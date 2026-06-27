import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification, 3: Password Reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Clear messages on step transition
  useEffect(() => {
    setErrors({});
    setSuccessMsg('');
  }, [step]);

  // Handle email request submission (Step 1)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        // Move to Step 2
        setStep(2);
      } else {
        setErrors({ auth: res.message || 'Failed to request reset OTP. Try again.' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ auth: err.response?.data?.message || 'Failed to request reset OTP. Try again.' });
    }
  };

  // Handle code/digit input events (Step 2)
  const handleChangeDigit = (e, index) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return; // digits only

    const newCode = [...code];
    newCode[index] = val.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDownDigit = (e, index) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      } else {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePasteDigit = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = [...code];
    for (let i = 0; i < pasteData.length; i++) {
      newCode[i] = pasteData[i];
    }
    setCode(newCode);

    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // Handle OTP verification (Step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrors({ code: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyResetCode(email, fullCode);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        // Move to Step 3
        setStep(3);
      } else {
        setErrors({ auth: res.message || 'Verification failed. Please check the code.' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ auth: err.response?.data?.message || 'Verification failed. Please check the code.' });
    }
  };

  // Handle password reset submission (Step 3)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullCode = code.join('');
      const res = await resetPassword(email, fullCode, newPassword);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setErrors({ auth: res.message || 'Reset password failed. Try again.' });
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ auth: err.response?.data?.message || 'Reset password failed. Try again.' });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-darkBg text-slate-100">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden">
        
        {/* Background Glows */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accentBlue/10 rounded-full blur-2xl pointer-events-none"></div>

        {step === 1 && (
          // STEP 1: Enter Email Form
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="flex justify-center">
                <div className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue p-3 rounded-full mb-2">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-sans">Forgot Password?</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                No worries! Enter your email and we'll send you a 6-digit OTP code to reset your password.
              </p>
            </div>

            {errors.auth && (
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.auth}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-darkBg/60 border border-darkBorder pl-10 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span>Send Reset OTP</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 font-bold gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          // STEP 2: Enter OTP Code only
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2 mb-4">
              <div className="flex justify-center">
                <div className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue p-3 rounded-full mb-2">
                  <Mail className="w-6 h-6 animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Verify OTP</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Please enter the 6-digit OTP code sent to <strong className="text-slate-200 break-all">{email}</strong>.
              </p>
            </div>

            {successMsg && (
              <div className="flex items-start space-x-2 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-md text-emerald-400 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errors.auth && (
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.auth}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Digit Inputs Row (Responsive width) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center mb-1">6-Digit OTP Code</label>
                <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePasteDigit}>
                  {code.map((num, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required
                      maxLength="1"
                      ref={(el) => (inputRefs.current[idx] = el)}
                      value={num}
                      onChange={(e) => handleChangeDigit(e, idx)}
                      onKeyDown={(e) => handleKeyDownDigit(e, idx)}
                      className="w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-bold bg-darkBg border border-darkBorder rounded-md sm:rounded-lg focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                    />
                  ))}
                </div>
                {errors.code && <p className="text-[10px] text-red-400 mt-1 font-semibold text-center">{errors.code}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 font-bold gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Email input
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          // STEP 3: Enter New Passwords Form (Styled professionally like Register page)
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2 mb-4">
              <div className="flex justify-center">
                <div className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue p-3 rounded-full mb-2">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Choose New Password</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your OTP was verified! Please choose a secure new password for your account.
              </p>
            </div>

            {successMsg && (
              <div className="flex items-start space-x-2 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-md text-emerald-400 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errors.auth && (
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.auth}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg/60 border border-darkBorder pl-10 pr-10 py-2.5 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-darkBg/60 border border-darkBorder pl-10 pr-10 py-2.5 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accentBtn hover:bg-accentBtnHover text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
