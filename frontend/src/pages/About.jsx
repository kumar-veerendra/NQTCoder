import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Award, Shield, BookOpen, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-73px)] bg-darkBg text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="About NQTCoder — Platform, Team & Mission"
        description="Learn about NQTCoder — a placement coding practice platform built for students preparing for TCS NQT, Infosys, Wipro & more."
        path="/about"
        keywords="NQTCoder about, placement platform team, coding platform India, TCS NQT preparation"
      />
      <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider select-none">
            <Terminal className="w-3.5 h-3.5" />
            <span>Connecting & Improving</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white select-none">
            About NQT<span className="text-accentBlue">Coder</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Welcome to the ultimate preparation arena. We are building a modern workspace to help students crack campus coding rounds and land their dream offers.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Shimmer Overlay */}
          <div className="premium-shine rounded-3xl"></div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-xl font-extrabold text-white tracking-wide">Our Mission & Goals</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              NQTCoder was designed to bridge the gap between classroom coding and exam pressure. We replicate actual corporate exam interfaces to give you authentic coding practice with strict timers, secure test cases, and multi-language support.
            </p>
          </div>

          {/* Visual Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 select-none">
            <div className="flex flex-col p-5 rounded-xl bg-darkBg border border-darkBorder hover:border-slate-700 transition-all space-y-3">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400 w-10 h-10 flex items-center justify-center border border-indigo-500/10">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Exam Simulation</h3>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Practice with the exact compiler UI, full imports, and custom class structures required by national recruiters.
                </p>
              </div>
            </div>

            <div className="flex flex-col p-5 rounded-xl bg-darkBg border border-darkBorder hover:border-slate-700 transition-all space-y-3">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 w-10 h-10 flex items-center justify-center border border-emerald-500/10">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Secure Sandboxes</h3>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Your code executes in isolated server environments to guarantee safety, speed, and standard test results.
                </p>
              </div>
            </div>

            <div className="flex flex-col p-5 rounded-xl bg-darkBg border border-darkBorder hover:border-slate-700 transition-all space-y-3">
              <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 w-10 h-10 flex items-center justify-center border border-amber-500/10">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Learning Tracks</h3>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Follow company-specific roadmaps for TCS, Accenture, Wipro, and topic-specific preparation plans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compiler Setup FAQ callout */}
        <div className="bg-gradient-to-br from-accentBlue/10 to-indigo-500/5 border border-accentBlue/20 rounded-2xl p-8 space-y-5 select-none shadow">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accentBlue/15 border border-accentBlue/25 text-accentBlue flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Code Editor Showing "Offline"?</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                NQTCoder's code editor uses local compilers installed on the server machine to run your code.
                If the compiler status bar shows Offline, it means Java, g++ (C++), or Python is not yet installed on the backend server.
                This is a one-time setup that only the server admin needs to do.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { lang: '☕ Java (JDK 11)', note: 'Most important — needed for Java submissions' },
              { lang: '⚙️ C++ (GCC/g++)', note: 'Install MinGW (Windows) or GCC (Linux/Mac)' },
              { lang: '🐍 Python 3', note: 'Easiest to install — just download & check "Add to PATH"' }
            ].map((item, i) => (
              <div key={i} className="bg-darkBg/60 border border-darkBorder rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm font-bold text-white">{item.lang}</p>
                <p className="text-[11px] text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>

          <a
            href="/compiler-setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-accentBtn/20 transition-all cursor-pointer w-fit"
          >
            <Terminal className="w-4 h-4" />
            Read Full Compiler Setup Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
