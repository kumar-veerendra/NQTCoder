import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Heart } from 'lucide-react';

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
          <div className="flex items-center select-none">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img src="/logo.svg" alt="NQTCoder Logo" className="h-[32px] w-auto object-contain" />
              <span className="text-base font-black tracking-wider text-white group-hover:text-slate-200 transition-colors">
                NQT<span className="text-accentBlue">Coder</span>
              </span>
            </Link>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Replicating national recruitment coding environments to help students prepare, practice, and succeed in placement programming assessments.
          </p>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for placement aspirants</span>
          </div>
        </div>

        {/* Col 2: Navigation links */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase text-white tracking-widest">Platform</h2>
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
          <h2 className="text-xs font-black uppercase text-white tracking-widest">Support & Contact</h2>
          <ul className="space-y-2 text-xs text-slate-400 font-semibold">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Platform
              </Link>
            </li>
            <li>
              <Link to="/compiler-setup" className="hover:text-white transition-colors">
                Compiler Setup Guide
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
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=veerendrakumartmsl@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors"
              >
                Email Support
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom copyright details */}
      <div className="max-w-6xl mx-auto border-t border-darkBorder/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          © {new Date().getFullYear()} NQTCoder. All rights reserved.
        </p>

        <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>

        {/* Github link */}
        <a 
          href="https://github.com/kumar-veerendra/NQTCoder" 
          target="_blank" 
          rel="noreferrer" 
          className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 text-xs"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">GitHub Repository</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
