import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const { register, loginWithGoogle, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real-time username availability check states
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  const navigate = useNavigate();

  // Debounced check for username uniqueness
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailable(null);

    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await api.get('/api/auth/check-username', {
          params: { username: username.trim() }
        });
        setUsernameAvailable(data.available);
      } catch (err) {
        console.error('Error checking username availability:', err);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450); // 450ms debounce delay

    return () => clearTimeout(delayDebounce);
  }, [username]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (usernameAvailable === false) {
      setErrors({ username: 'Username is already taken.' });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    const res = await register(username, email, password, confirmPassword);
    setIsSubmitting(false);

    if (res.success) {
      if (res.verificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        navigate('/');
      }
    } else {
      setErrors(res.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate('/');
    } else {
      setErrors({ message: res.error });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-darkBg">
      <div className="glass-panel w-full max-w-md p-8 rounded-lg shadow-xl relative overflow-hidden">
        
        <div className="text-center space-y-2 mb-6 relative">
          <h2 className="text-3xl font-extrabold text-white tracking-wide">Create Account</h2>
          <p className="text-sm text-slate-400 font-medium">Join NQTCoder to start practicing challenges.</p>
        </div>

        {errors.message && (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer12"
                className={`w-full bg-darkBg/60 border ${
                  errors.username ? 'border-red-500' : 'border-darkBorder'
                } pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
              />
            </div>
            {errors.username && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.username}</p>}
            {!errors.username && isCheckingUsername && (
              <p className="text-[10px] text-slate-500 mt-1 font-semibold animate-pulse">Checking availability...</p>
            )}
            {!errors.username && !isCheckingUsername && usernameAvailable === true && (
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold">✓ Username is available</p>
            )}
            {!errors.username && !isCheckingUsername && usernameAvailable === false && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">✗ Username is already taken</p>
            )}
          </div>

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
                className={`w-full bg-darkBg/60 border ${
                  errors.email ? 'border-red-500' : 'border-darkBorder'
                } pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-darkBg/60 border ${
                  errors.password ? 'border-red-500' : 'border-darkBorder'
                } pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-400 mt-1 font-semibold leading-normal">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-darkBg/60 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-darkBorder'
                } pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-darkBorder/60"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-darkBorder/60"></div>
        </div>

        {/* Google OAuth Login Container */}
        <div className="flex justify-center relative w-full mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ message: 'Google Sign-in failed. Try again.' })}
            theme={theme === 'light' ? 'outline' : 'dark'}
            shape="circle"
            text="signup_with"
            width="100%"
          />
        </div>

        <div className="text-center relative">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-accentBlue hover:text-accentBlue/80 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
