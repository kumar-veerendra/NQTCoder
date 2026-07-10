import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, Award, Shield, BookOpen, ArrowRight, Brain, Target, 
  Flame, FileText, Database, ShieldAlert, Cpu, BarChart2 
} from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-73px)] bg-darkBg text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="About NQTCoder — Premium Placement Prep Ecosystem"
        description="Learn about NQTCoder's advanced features: sandbox compilers, timed mock tests, anti-cheat proctoring, aptitude arena, and dynamic roadmaps."
        path="/about"
        keywords="NQTCoder features, placement preparation suite, coding sandboxes, proctored mock exams, TCS NQT prep"
      />
      
      <div className="max-w-6xl mx-auto space-y-20 animate-fadeIn">
        
        {/* 1. Hero Title Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto select-none">
          <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Platform Engineering</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            The Ultimate Placement <br />
            Coding <span className="text-accentBlue">Ecosystem</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            NQTCoder replicates real corporate assessment environments to help students build exam resilience, master coding fundamentals, and succeed in national placement exams.
          </p>
        </div>

        {/* 2. Mission Card */}
        <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="premium-shine rounded-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">Bridging the Exam-Pressure Gap</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Classroom coding and real corporate assessments are two different worlds. Placement drives (like TCS NQT, Infosys, and Accenture) impose tight timelines, custom class entry requirements, and strict anti-cheat restrictions. 
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                NQTCoder was engineered specifically to bridge this gap. Our workspace simulates these exact environments, enabling you to build speed, accuracy, and confidence.
              </p>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 select-none">
              <div className="bg-darkBg border border-darkBorder p-5 rounded-2xl text-center space-y-1 hover:border-accentBlue transition-colors">
                <span className="text-2xl font-black text-white">300+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Coding Tasks</p>
              </div>
              <div className="bg-darkBg border border-darkBorder p-5 rounded-2xl text-center space-y-1 hover:border-accentBlue transition-colors">
                <span className="text-2xl font-black text-white">400+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aptitude MCQs</p>
              </div>
              <div className="bg-darkBg border border-darkBorder p-5 rounded-2xl text-center space-y-1 hover:border-accentBlue transition-colors">
                <span className="text-2xl font-black text-white">15+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Companies</p>
              </div>
              <div className="bg-darkBg border border-darkBorder p-5 rounded-2xl text-center space-y-1 hover:border-accentBlue transition-colors">
                <span className="text-2xl font-black text-white">27+</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Practice Paths</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Features Showcase */}
        <div className="space-y-10">
          <div className="text-center md:text-left select-none">
            <h2 className="text-xs font-black text-accentBlue uppercase tracking-widest mb-1">Architecture details</h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Platform Capabilities</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Sandbox Execution */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-accentBlue bg-accentBlue/10 w-11 h-11 rounded-xl flex items-center justify-center border border-accentBlue/10 transition-transform group-hover:scale-105">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-accentBlue transition-colors">Sandbox Code Execution</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Runs user submissions using native compilers locally installed on our backend. Supports optimized runtime sandboxing for C++ (g++), Java (JDK 11), and Python 3.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Proctored Exams */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-rose-400 bg-rose-500/10 w-11 h-11 rounded-xl flex items-center justify-center border border-rose-500/10 transition-transform group-hover:scale-105">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors">Anti-Cheat Proctoring</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Simulates authentic corporate testing. Our proctor monitors tab-switching events in real-time, logging warnings and automatically force-submitting tests upon multiple violations.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: High Five Roadmaps */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-emerald-400 bg-emerald-500/10 w-11 h-11 rounded-xl flex items-center justify-center border border-emerald-500/10 transition-transform group-hover:scale-105">
                  <Target className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">High Five Roadmaps</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Progressive study paths sorted sequentially from Easy ➔ Medium ➔ Hard. Standardized to exactly 5 unsolved questions per module for high-focus practice with unlimited batch resets.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4: Aptitude Arena */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-amber-400 bg-amber-500/10 w-11 h-11 rounded-xl flex items-center justify-center border border-amber-500/10 transition-transform group-hover:scale-105">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">Aptitude & Verbal Arena</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Includes Quantitative Aptitude, Logical Reasoning, and Verbal Ability tests. Track syllabus progress separately and practice with exam-aligned cognitive MCQs.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5: Dynamic Badges & Streaks */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-indigo-400 bg-indigo-500/10 w-11 h-11 rounded-xl flex items-center justify-center border border-indigo-500/10 transition-transform group-hover:scale-105">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors">Dynamic Achievements</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Earn custom accolades as you progress! Dynamically awards company specific `Conqueror` badges and topic specific two-tiered `Beginner` and `Master` badges directly on your profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6: GitHub Heatmaps & Analytics */}
            <div className="bg-darkCard border border-darkBorder p-6 rounded-2xl flex flex-col justify-between hover:border-accentBlue transition-all group relative overflow-hidden">
              <div className="premium-shine rounded-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="text-violet-400 bg-violet-500/10 w-11 h-11 rounded-xl flex items-center justify-center border border-violet-500/10 transition-transform group-hover:scale-105">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-white group-hover:text-violet-400 transition-colors">Heatmaps & Activity Calendar</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Visualize your consistency with our GitHub-style activity heatmaps. Tracks login streaks, solved questions, and mock test scores for comprehensive profile monitoring.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Action CTA Card */}
        <div className="bg-gradient-to-r from-accentBlue/20 to-indigo-600/10 border border-accentBlue/30 rounded-3xl p-8 md:p-12 text-center space-y-6 select-none relative overflow-hidden shadow-lg">
          <div className="premium-shine rounded-3xl"></div>
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-wide">Ready to Launch Your Practice?</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Explore the Practice Arena, check the Leaderboard to see where you stand, or test your exam readiness with our timed Mock Tests!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button 
                onClick={() => navigate('/practice')}
                className="w-full sm:w-auto px-6 py-3 bg-accentBtn hover:bg-accentBtnHover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Enter Practice Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => navigate('/tracks')}
                className="w-full sm:w-auto px-6 py-3 bg-darkBg border border-darkBorder hover:border-slate-600 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Explore Learning Tracks
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
