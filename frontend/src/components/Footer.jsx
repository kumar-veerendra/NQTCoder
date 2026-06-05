import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Mail, Github, Heart } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const handleResourcesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('resources');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-darkCard border-t border-darkBorder py-12 px-6 transition-all select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand details */}
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div className="flex items-center space-x-3">
            <div className="bg-[#6366F1] p-1.5 rounded-lg text-white">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <Link to="/" className="text-base font-black tracking-wider text-white">
              NQT<span className="text-[#6366F1]">Coder</span>
            </Link>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Replicating national recruitment coding environments to help students prepare, practice, and succeed in placement programming assessments.
          </p>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for placement aspirants</span>
          </div>
        </div>

        {/* Col 2: Navigation links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-widest">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-semibold">
            <li>
              <Link to="/practice" className="hover:text-white transition-colors">
                Practice Arena
              </Link>
            </li>
            <li>
              <Link to="/mocktest" className="hover:text-white transition-colors">
                Mock Tests
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="hover:text-white transition-colors">
                Student Rankings
              </Link>
            </li>
            <li>
              <Link to="/#resources" onClick={handleResourcesClick} className="hover:text-white transition-colors">
                Resources
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Support links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-white tracking-widest">Support & Contact</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-semibold">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Platform
              </Link>
            </li>
            <li>
              <Link to="/compiler-setup" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <span>⚙️</span>
                <span>Compiler Setup Guide</span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                Submit Feedback
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                Report a Bug
              </Link>
            </li>
            <li>
              <a href="mailto:support@nqtcoder.com" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>Email Support</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom copyright details */}
      <div className="max-w-6xl mx-auto border-t border-darkBorder/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          © {new Date().getFullYear()} NQTCoder. All rights reserved.
        </p>

        {/* Github link */}
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer" 
          className="text-slate-500 hover:text-white transition-colors flex items-center space-x-1 text-xs"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">GitHub Repository</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
