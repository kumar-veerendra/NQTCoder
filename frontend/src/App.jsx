// Frontend entrypoint - authored by Satyam
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertTriangle, X } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyDashboard from './pages/CompanyDashboard';
import ProblemArena from './pages/ProblemArena';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuestionForm from './pages/AdminQuestionForm';
import Tracks from './pages/Tracks';
import TrackDetail from './pages/TrackDetail';
import MockTestDashboard from './pages/MockTestDashboard';
import MockTestArena from './pages/MockTestArena';
import MockTestResult from './pages/MockTestResult';
import NotFound from './pages/NotFound';
import AboutContact from './pages/AboutContact';
import Resources from './pages/Resources';
import CompilerSetup from './pages/CompilerSetup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

const UnverifiedBanner = () => {
  const { user, resendCode } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Google OAuth users are already verified by Google — never show this banner to them
  if (!user || user.isVerified || user.googleId || isDismissed) return null;
  
  // Don't show on login/register/verify pages
  if (['/login', '/register', '/verify-email', '/forgot-password'].includes(location.pathname)) return null;

  const handleVerify = () => {
    // Fire email trigger asynchronously
    resendCode(user.email).catch((err) => {
      console.error('Failed to trigger verification code from banner:', err);
    });
    navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between gap-4 select-none animate-fadeIn text-amber-300 font-medium z-[100] shrink-0">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span>Your email is not verified yet. Please verify your email to unlock all features.</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={handleVerify}
          className="bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider text-[10px] px-3 py-1 rounded-md transition-colors cursor-pointer"
        >
          Verify Email
        </button>
        <a 
          href="https://mail.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-accentBlue hover:text-accentBlue/90 hover:underline font-black uppercase tracking-wider text-[10px] transition-all"
        >
          Go to Gmail
        </a>
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Hide navbar on login, register, verify-email, problem arena, and mocktest arena pages
  const hideNavbar = ['/login', '/register', '/verify-email', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/problem/') || location.pathname.startsWith('/mocktest/arena/');

  // Show footer only on the Home page
  const hideFooter = location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 font-sans">
      <UnverifiedBanner />
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const AppContent = () => {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutContact />} />
        <Route path="/contact" element={<AboutContact />} />
        <Route path="/compiler-setup" element={<CompilerSetup />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected User Routes */}
        <Route path="/practice" element={<CompanyDashboard />} />
        <Route path="/problem/:id" element={<ProblemArena />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/tracks" element={<Tracks />} />
        <Route path="/tracks/:id" element={<TrackDetail />} />
        <Route
          path="/mocktest"
          element={
            <ProtectedRoute>
              <MockTestDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mocktest/arena/:id"
          element={
            <ProtectedRoute>
              <MockTestArena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mocktest/result/:id"
          element={
            <ProtectedRoute>
              <MockTestResult />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/question/new"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminQuestionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/question/edit/:id"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminQuestionForm />
            </ProtectedRoute>
          }
        />

        {/* Fallback to NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

function App() {
  // Use Vite client ID env var or placeholder mock client ID to prevent mounting crash
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '123456789-mock-id.apps.googleusercontent.com';

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
