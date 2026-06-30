import User from '../models/User.js';
import Question from '../models/Question.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { validateRegister, validateLogin } from '../utils/validator.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

// Initialize Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'nqtcoder_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const { errors, isValid } = validateRegister({ username, email, password, confirmPassword });
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const field = userExists.email === email ? 'email' : 'username';
      return res.status(400).json({
        errors: { [field]: `User with this ${field} already exists` }
      });
    }

    // Generate 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      username,
      email,
      password,
      role: 'user', // default registration is user
      isVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    if (user) {
      // Send OTP verification email asynchronously
      sendVerificationEmail(user.email, verificationCode).catch((emailErr) => {
        console.error('Error sending registration verification email:', emailErr);
      });

      res.status(201).json({
        success: true,
        verificationRequired: true,
        email: user.email,
        message: 'Verification code sent to email'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { errors, isValid } = validateLogin({ email, password });
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({
          errors: { auth: 'Please verify your email before logging in.' }
        });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        solvedQuestions: user.solvedQuestions || [],
        solvedCount: user.solvedCount || { easy: 0, medium: 0, hard: 0 },
        fullName: user.fullName || '',
        bio: user.bio || '',
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({
        errors: { auth: 'Invalid email or password' }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Google OAuth Sign in / Sign up
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    let payload;
    
    // Attempt standard verification if client ID is present
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here') {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } else {
      // Fallback for development/testing if Client ID is not configured.
      // We will decode the JWT payload manually without signature verification.
      console.warn('Google Client ID not configured. Decoding payload insecurely for development only.');
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      payload = JSON.parse(jsonPayload);
    }

    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      let isModified = false;
      // If user exists by email but googleId is not linked, link it
      if (!user.googleId) {
        user.googleId = googleId;
        isModified = true;
      }
      // If the user was registered manually but not verified, mark them verified since they logged in via Google
      if (!user.isVerified) {
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        isModified = true;
      }
      if (isModified) {
        await user.save();
      }
    } else {
      // Generate a unique username from name
      let baseUsername = name.replace(/\s+/g, '').toLowerCase();
      let username = baseUsername;
      let count = 1;
      
      // Ensure unique username
      while (await User.findOne({ username })) {
        username = `${baseUsername}${count}`;
        count++;
      }

      user = await User.create({
        username,
        email,
        googleId,
        role: 'user',
        isVerified: true
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      googleId: user.googleId || null,
      solvedQuestions: user.solvedQuestions || [],
      solvedCount: user.solvedCount || { easy: 0, medium: 0, hard: 0 },
      fullName: user.fullName || '',
      bio: user.bio || '',
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google Authentication failed', error: error.message });
  }
};

const formatUserProfile = async (user) => {
  const easyTotal = await Question.countDocuments({ difficulty: { $in: ['Easy', 'Easy-Medium'] }, status: 'active' });
  const mediumTotal = await Question.countDocuments({ difficulty: { $in: ['Medium', 'Medium-Hard'] }, status: 'active' });
  const hardTotal = await Question.countDocuments({ difficulty: 'Hard', status: 'active' });

  const solvedEasy = user.solvedQuestions.filter(q => ['Easy', 'Easy-Medium'].includes(q.difficulty)).length;
  const solvedMedium = user.solvedQuestions.filter(q => ['Medium', 'Medium-Hard'].includes(q.difficulty)).length;
  const solvedHard = user.solvedQuestions.filter(q => q.difficulty === 'Hard').length;

  const userObj = user.toObject();
  userObj.solvedCount = {
    easy: solvedEasy,
    medium: solvedMedium,
    hard: solvedHard
  };
  userObj.difficultyTotals = {
    easy: easyTotal,
    medium: mediumTotal,
    hard: hardTotal
  };
  return userObj;
};

/**
 * @desc    Get user profile data
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedQuestions', 'title difficulty company topic slug');
      
    if (user) {
      const formatted = await formatUserProfile(user);
      res.json(formatted);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName !== undefined ? req.body.fullName : user.fullName;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

      const updatedUser = await user.save();
      
      const populatedUser = await User.findById(updatedUser._id)
        .select('-password')
        .populate('solvedQuestions', 'title difficulty company topic slug');

      const formatted = await formatUserProfile(populatedUser);
      res.json(formatted);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify email using OTP code
 * @route   POST /api/auth/verify
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({
        errors: { code: 'Invalid verification code' }
      });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({
        errors: { code: 'Verification code has expired. Please request a new code.' }
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      solvedQuestions: user.solvedQuestions || [],
      solvedCount: user.solvedCount || { easy: 0, medium: 0, hard: 0 },
      fullName: user.fullName || '',
      bio: user.bio || '',
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Resend verification code OTP
 * @route   POST /api/auth/resend-code
 * @access  Public
 */
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate new OTP
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send email asynchronously
    sendVerificationEmail(user.email, verificationCode).catch((emailErr) => {
      console.error('Error sending resend OTP email:', emailErr);
    });

    res.json({ success: true, message: 'Verification code resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Check username availability in real-time
 * @route   GET /api/auth/check-username
 * @access  Public
 */
export const checkUsername = async (req, res) => {
  const { username } = req.query;

  if (!username || username.trim() === '') {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const userExists = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }
    });

    if (userExists) {
      return res.json({ available: false });
    }

    return res.json({ available: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Request password reset OTP code (Forgot Password)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email });

    // Option B: Generic Secure Response
    // If the user does not exist, we still return success to prevent user enumeration
    if (!user) {
      console.log(`\n[Forgot Password] Request for UNREGISTERED email: ${email}. No email sent (Security Option B).\n`);
      return res.status(200).json({
        success: true,
        message: 'If this email is registered in our system, a password reset OTP has been sent.'
      });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpires = resetCodeExpires;
    await user.save();

    // Send email (async in background)
    sendPasswordResetEmail(user.email, resetCode).catch((emailErr) => {
      console.error('Failed to send password reset email:', emailErr.message);
    });

    res.status(200).json({
      success: true,
      message: 'If this email is registered in our system, a password reset OTP has been sent.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify reset password OTP code
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and OTP code are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Invalid email or reset OTP code.' });
    }

    if (new Date() > user.resetPasswordCodeExpires) {
      return res.status(400).json({ message: 'Reset OTP code has expired. Please request a new one.' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP code verified successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reset password using OTP code
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or reset OTP code.' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Invalid email or reset OTP code.' });
    }

    if (new Date() > user.resetPasswordCodeExpires) {
      return res.status(400).json({ message: 'Reset OTP code has expired. Please request a new one.' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
