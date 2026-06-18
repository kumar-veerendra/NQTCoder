// Frontend entrypoint - authored by Satyam
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Hide navbar on login, register, verify-email, problem arena, and mocktest arena pages
  const hideNavbar = ['/login', '/register', '/verify-email', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/problem/') || location.pathname.startsWith('/mocktest/arena/');

  // Show footer only on the Home page
  const hideFooter = location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-slate-100 font-sans">
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
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problem/:id"
          element={
            <ProtectedRoute>
              <ProblemArena />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracks"
          element={
            <ProtectedRoute>
              <Tracks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracks/:id"
          element={
            <ProtectedRoute>
              <TrackDetail />
            </ProtectedRoute>
          }
        />
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
