import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { X, Lock, Shield, Award, CheckCircle, Flame, Play, Send } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, mode = 'run' }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // ── Context config for run vs submit ────────────────────────────────────────
  const config = {
    run: {
      Icon: Play,
      iconBg: 'bg-accentBlue/10 border-accentBlue/25 text-accentBlue',
      title: 'Run Your Code',
      subtitle: 'Sign in to execute your code against sample test cases.',
      features: [
        { Icon: Play,        text: 'Run code against sample test cases' },
        { Icon: Shield,      text: 'Execute securely on our servers' },
        { Icon: CheckCircle, text: 'See instant output and error logs' },
        { Icon: CheckCircle, text: 'Test with your own custom input' },
        { Icon: Flame,       text: 'Build your daily coding streak' },
      ],
    },
    submit: {
      Icon: Send,
      iconBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      title: 'Submit Your Solution',
      subtitle: 'Sign in to submit and check against all hidden test cases.',
      features: [
        { Icon: Send,        text: 'Submit against all hidden test cases' },
        { Icon: CheckCircle, text: 'Get an Accepted / Wrong Answer verdict' },
        { Icon: Award,       text: 'Earn rank points for correct solutions' },
        { Icon: CheckCircle, text: 'Track solved questions on your profile' },
        { Icon: Flame,       text: 'Climb the leaderboard rankings' },
      ],
    },
  };

  const { Icon, iconBg, title, subtitle, features } = config[mode] ?? config.run;

  const handleRedirectToLogin = () => {
    sessionStorage.setItem('guest_redirect_url', window.location.pathname);
    onClose();
    navigate('/login');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.success) {
        onClose();
        const redirectUrl = sessionStorage.getItem('guest_redirect_url');
        if (redirectUrl) {
          sessionStorage.removeItem('guest_redirect_url');
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      } else {
        alert(res.error || 'Google Authentication failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="bg-[#0b1329] border border-[#1e293b] w-full max-w-md rounded-2xl p-6 relative shadow-2xl flex flex-col space-y-5 text-slate-100 font-sans">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`p-3 rounded-full border mb-1 ${iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">{title}</h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-semibold">{subtitle}</p>
        </div>

        {/* Feature list */}
        <div className="bg-[#0f172a]/60 border border-[#1e293b]/60 rounded-xl p-4 space-y-3 text-left">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Create a free account to:
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-[11px] text-slate-300">
            {features.map(({ Icon: FIcon, text }, i) => (
              <div key={i} className="flex items-center space-x-2.5">
                <FIcon className="w-4 h-4 text-accentBlue shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-xs mx-auto italic">
          Your current code will be restored automatically after you sign in.
        </p>

        {/* Actions */}
        <div className="flex flex-col space-y-3 pt-1">
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google Sign-in failed. Try again.')}
              theme={theme === 'light' ? 'outline' : 'dark'}
              shape="circle"
              text="continue_with"
              width="100%"
            />
          </div>

          <button
            onClick={handleRedirectToLogin}
            className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-accentBlue/10 cursor-pointer"
          >
            Continue with Email
          </button>

          <button
            onClick={onClose}
            className="w-full bg-transparent hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="text-center text-[11px] text-slate-400 pt-1 leading-relaxed">
            Already have an account?<br />
            <button
              onClick={handleRedirectToLogin}
              className="text-accentBlue hover:text-accentBlue/90 hover:underline font-bold transition-all cursor-pointer mt-1"
            >
              Sign In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
