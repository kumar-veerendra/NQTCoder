import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationCode,
  checkUsername,
  forgotPassword,
  verifyResetCode,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/verify', verifyEmail);
router.post('/resend-code', resendVerificationCode);
router.get('/check-username', checkUsername);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
