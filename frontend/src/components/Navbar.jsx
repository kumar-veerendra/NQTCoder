import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Terminal, Sun, Moon, LogOut, User as UserIcon, Settings, LayoutDashboard, Menu, X, ExternalLink } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleResourcesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('resources');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-darkBg/80 backdrop-blur-md border-b border-darkBorder px-6 py-4 flex items-center justify-between transition-all">
      {/* Left: Brand Logo */}
      <div className="flex items-center space-x-3 select-none">
        <div className="bg-accentBtn p-2 rounded-lg text-white">
          <Terminal className="w-4 h-4" />
        </div>
        <Link to="/" className="text-lg font-black tracking-wider text-white">
          NQT<span className="text-accentBlue">Coder</span>
        </Link>
      </div>

      {/* Center: Navigation Options (Desktop) */}
      {!location.pathname.startsWith('/admin') && (
        <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
          <Link
            to="/"
            className={`transition-colors ${isActive('/') && !location.hash ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Home
          </Link>
          <Link
            to="/practice"
            className={`transition-colors ${isActive('/practice') ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Practice
          </Link>
          <Link
            to="/mocktest"
            className={`transition-colors ${isActive('/mocktest') ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Mock Test
          </Link>
          <Link
            to="/#resources"
            onClick={handleResourcesClick}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Resources
          </Link>
          <Link
            to="/leaderboard"
            className={`transition-colors ${isActive('/leaderboard') ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Leaderboard
          </Link>
        </div>
      )}

      {/* Right: Actions */}
      <div className="hidden md:flex items-center space-x-4">
        {location.pathname.startsWith('/admin') && (
          <Link
            to="/"
            className="text-accentBlue hover:text-accentBlueHover transition-colors flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mr-2"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-4 w-px border-l border-darkBorder"></div>

        {user ? (
          /* Logged In: Profile Menu */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none select-none hover:opacity-90 transition-opacity"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-accentBtn text-white flex items-center justify-center font-bold text-xs uppercase border border-darkBorder">
                {(user.username || 'U')[0]}
              </div>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-52 bg-darkCard border border-darkBorder rounded-lg shadow-2xl z-50 p-1.5 text-left text-xs font-semibold">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 border-b border-darkBorder mb-1">
                  {user.username}
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center space-x-2 w-full text-slate-300 hover:text-white px-3 py-2 rounded hover:bg-darkBg/60 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 w-full text-slate-300 hover:text-white px-3 py-2 rounded hover:bg-darkBg/60 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <hr className="border-t border-darkBorder my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-rose-400 hover:text-rose-300 px-3 py-2 rounded hover:bg-darkBg/60 transition-all text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Logged Out: Authentication links */
          <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-wider">
            <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-accentBtn hover:bg-accentBtnHover text-white px-4 py-2 rounded-lg transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <div className="flex md:hidden items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-darkCard border-b border-darkBorder p-5 flex flex-col space-y-4 md:hidden shadow-2xl z-50 text-xs font-bold uppercase tracking-wider">
          {!location.pathname.startsWith('/admin') ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded hover:bg-darkBg/60 transition-colors ${isActive('/') && !location.hash ? 'text-accentBlue' : 'text-slate-300'}`}
              >
                Home
              </Link>
              <Link
                to="/practice"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded hover:bg-darkBg/60 transition-colors ${isActive('/practice') ? 'text-accentBlue' : 'text-slate-300'}`}
              >
                Practice
              </Link>
              <Link
                to="/mocktest"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded hover:bg-darkBg/60 transition-colors ${isActive('/mocktest') ? 'text-accentBlue' : 'text-slate-300'}`}
              >
                Mock Test
              </Link>
              <Link
                to="/#resources"
                onClick={handleResourcesClick}
                className="p-2 rounded hover:bg-darkBg/60 text-slate-300 transition-colors"
              >
                Resources
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded hover:bg-darkBg/60 transition-colors ${isActive('/leaderboard') ? 'text-accentBlue' : 'text-slate-300'}`}
              >
                Leaderboard
              </Link>
            </>
          ) : (
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded hover:bg-darkBg/60 text-accentBlue transition-colors flex items-center space-x-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <hr className="border-t border-darkBorder my-2" />

          {user ? (
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 text-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-accentBtn text-white flex items-center justify-center font-bold text-sm uppercase border border-darkBorder">
                  {(user.username || 'U')[0]}
                </div>
                <span className="normal-case">{user.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-darkBg text-rose-400 px-3.5 py-2 rounded-lg border border-darkBorder hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-slate-300 hover:text-white py-2.5 border border-darkBorder rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-accentBtn hover:bg-accentBtnHover text-white py-2.5 rounded-lg transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
