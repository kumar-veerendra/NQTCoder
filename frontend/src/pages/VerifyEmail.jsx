import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const { verifyEmail, resendCode } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resend Timer State (default 60s cooldown)
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend countdown effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return; // only digits

    const newCode = [...code];
    newCode[index] = val.slice(-1); // only keep last character
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // focus previous and clear it
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      } else {
        // clear current
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return; // must be digits only

    const newCode = [...code];
    for (let i = 0; i < pasteData.length; i++) {
      newCode[i] = pasteData[i];
    }
    setCode(newCode);
    
    // Focus last pasted or next empty
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess('');
    const fullCode = code.join('');
    
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyEmail(email, fullCode);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem('guest_redirect_url');
        if (redirectUrl) {
          sessionStorage.removeItem('guest_redirect_url');
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      }, 1500);
    } else {
      setError(res.error?.code || res.error?.message || 'Verification failed. Try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setResendSuccess('');
    setCanResend(false);
    setTimer(60);

    const res = await resendCode(email);
    if (res.success) {
      setResendSuccess('Verification OTP sent successfully!');
    } else {
      setError(res.error || 'Failed to resend code. Try again later.');
      setCanResend(true);
      setTimer(0);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-darkBg text-slate-100">
      <div className="glass-panel w-full max-w-md p-8 rounded-lg shadow-xl relative overflow-hidden text-center">
        
        {/* Background decorative glows */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accentBlue/10 rounded-full blur-2xl pointer-events-none"></div>

        {success ? (
          <div className="space-y-4 py-8 animate-fade-in">
            <div className="flex justify-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Email Verified!</h3>
            <p className="text-sm text-slate-400 font-medium">Your account is now active. Redirecting you to home page...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-accentBlue/10 border border-accentBlue/20 text-accentBlue p-3 rounded-full mb-2">
                  <Mail className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">Verify Your Email</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                We sent a 6-digit confirmation code to <strong className="text-slate-200">{email}</strong>. Enter it below to activate your account.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {resendSuccess && (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-md text-emerald-400 text-xs text-left">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{resendSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Digit Inputs Row */}
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((num, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required
                    maxLength="1"
                    ref={(el) => (inputRefs.current[idx] = el)}
                    value={num}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-11 h-12 text-center text-lg font-bold bg-darkBg border border-darkBorder rounded-lg focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <span>Verify Account</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-accentBlue hover:underline font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                ) : (
                  <span className="text-slate-400">Resend in {timer}s</span>
                )}
              </p>

              {/* Temporary Google Auth Bug Notification */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-[11px] text-amber-300/90 text-left leading-relaxed">
                <span className="font-bold block mb-1 text-amber-400">⚠️ Having trouble getting the OTP?</span>
                There might be a delivery issue with some email providers which we are currently fixing. You can go back and sign in instantly using <strong>Google Auth</strong> instead.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
