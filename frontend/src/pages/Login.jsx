import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';

const Login = () => {
  const { login, loginWithGoogle, user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      const redirectUrl = sessionStorage.getItem('guest_redirect_url');
      if (redirectUrl) {
        sessionStorage.removeItem('guest_redirect_url');
        navigate(redirectUrl);
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
      const redirectUrl = sessionStorage.getItem('guest_redirect_url');
      if (redirectUrl) {
        sessionStorage.removeItem('guest_redirect_url');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } else {
      setErrors({ auth: res.error });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-darkBg">
      <SEO
        title="Sign In"
        description="Sign in to your NQTCoder account to access placement coding practice, mock tests, and your personal dashboard."
        path="/login"
        noIndex={true}
      />
      <div className="glass-panel w-full max-w-md p-8 rounded-lg shadow-xl relative overflow-hidden">
        
        <div className="text-center space-y-2 mb-8 relative">
          <h2 className="text-3xl font-extrabold text-white tracking-wide">Welcome Back</h2>
          <p className="text-sm text-slate-400">Practice like a real assessment and ace your exams.</p>
        </div>

        {errors.auth && (
          <div className="flex flex-col space-y-2 bg-red-500/10 border border-red-500/25 p-3 rounded-md text-red-400 text-xs mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.auth}</span>
            </div>
            {errors.auth.includes('verify your email') && (
              <button
                type="button"
                onClick={() => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
                className="text-accentBlue hover:text-accentBlue/80 font-bold transition-colors w-fit text-left pl-6"
              >
                Verify your email now →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
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
                } pl-10 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-400 mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-accentBlue hover:text-accentBlue/80 font-bold transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-darkBg/60 border ${
                  errors.password ? 'border-red-500' : 'border-darkBorder'
                } pl-10 pr-10 py-2.5 rounded-md text-sm focus:outline-none focus:border-accentBlue transition-colors text-slate-200`}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2.5 rounded-md text-sm font-semibold tracking-wide flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-darkBorder/60"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-darkBorder/60"></div>
        </div>

        {/* Google OAuth Login Container */}
        <div className="flex justify-center relative w-full mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ auth: 'Google Sign-in failed. Try again.' })}
            theme={theme === 'light' ? 'outline' : 'dark'}
            shape="circle"
            text="signin_with"
          />
        </div>

        <div className="text-center relative">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-accentBlue hover:text-accentBlue/80 font-bold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
