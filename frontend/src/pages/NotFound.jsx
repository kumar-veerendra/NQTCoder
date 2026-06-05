import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Home, 
  Play, 
  Sparkles, 
  RefreshCw, 
  Trophy, 
  BookOpen, 
  AlertTriangle, 
  ArrowRight, 
  Bug, 
  Code,
  CheckCircle
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [diagnosticsState, setDiagnosticsState] = useState('idle'); // idle, scanning, fixing, done
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const terminalEndRef = useRef(null);

  const initialLogs = [
    { type: 'info', text: `Initializing route diagnostics for target: "${location.pathname}"` },
    { type: 'warn', text: 'Scanning local client registry...' },
    { type: 'error', text: 'CRITICAL ERROR: GET_ROUTE_NOT_FOUND (status 404)' },
    { type: 'info', text: 'Compilation failed. Address unresolved in router tables.' },
    { type: 'hint', text: 'Tip: You can manually trigger a local compile & bypass fix below.' }
  ];

  useEffect(() => {
    setLogs(initialLogs);
  }, [location.pathname]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runDiagnostics = () => {
    if (diagnosticsState !== 'idle') return;
    
    setDiagnosticsState('scanning');
    setLogs(prev => [...prev, { type: 'system', text: '\n--- STARTING SYSTEM DIAGNOSTICS & REPAIR ---' }]);

    const steps = [
      { type: 'info', text: 'Initializing NQTCoder virtual environment compiler...' },
      { type: 'info', text: 'Scanning route registry configuration for missing endpoints...' },
      { type: 'system', text: 'Analyzing database models and component declarations...' },
      { type: 'warn', text: 'Discovered orphan pointer at route resolver middleware.' },
      { type: 'info', text: 'Applying hot-patch to route mapping engine...' },
      { type: 'system', text: 'Recompiling local memory map (allocating fallback buffers)...' },
      { type: 'success', text: 'Route resolved! Dynamic fallback mapping is now online.' },
      { type: 'info', text: 'Redirecting to placement practice modules...' }
    ];

    let delay = 0;
    steps.forEach((step, idx) => {
      delay += idx === 0 ? 500 : (idx === 3 || idx === 6 ? 1200 : 700);
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setDiagnosticsState('done');
          setTimeout(() => {
            navigate('/practice');
          }, 1500);
        }
      }, delay);
    });
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-darkBg text-slate-100 px-6 py-12 relative overflow-hidden flex flex-col items-center justify-center font-sans select-none">
      
      {/* Background glow grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      {/* Large Glowing Ambient Blurs */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col space-y-12">
        
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-rose-400 uppercase tracking-widest animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Diagnostic Alert: Status 404</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2">
            Compilation <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-indigo-400">Failed</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl font-medium">
            The requested module could not be compiled. The memory address is missing, or the route was never registered.
          </p>
        </div>

        {/* Two-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Huge 404 Glow + Interactive Diagnostics Terminal */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Visual 404 Glitch Block */}
            <div className="bg-darkCard/50 border border-darkBorder rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative glass-panel">
              <div className="relative flex flex-col items-center sm:items-start text-center sm:text-left z-10">
                <div className="text-[80px] sm:text-[100px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_35px_rgba(99,102,241,0.25)] flex items-center">
                  4
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-1 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center border border-white/10 shadow-lg relative overflow-hidden group">
                    <Bug className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  </div>
                  4
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2 tracking-wide uppercase">
                  ERROR_CODE: <span className="text-rose-400 font-bold">ROUTE_RESOLVER_NULL</span>
                </div>
              </div>

              <div className="hidden sm:block text-right font-mono text-[10px] text-slate-500 bg-[#090d16]/60 p-4 border border-darkBorder/40 rounded-xl max-w-[240px]">
                <div className="text-[#6366F1] mb-1 font-bold">// route_resolver.cpp</div>
                <span className="text-rose-400">#include</span> &lt;iostream&gt;<br />
                <span className="text-slate-400">int main() &#123;</span><br />
                &nbsp;&nbsp;std::string err = <span className="text-emerald-400">"404"</span>;<br />
                &nbsp;&nbsp;<span className="text-rose-400">throw</span> err;<br />
                <span className="text-slate-400">&#125;</span>
              </div>
            </div>

            {/* Interactive Compiler Terminal */}
            <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden flex flex-col flex-grow shadow-2xl glass-panel">
              
              {/* Window Header */}
              <div className="bg-[#111827] px-4 py-3 border-b border-darkBorder flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  <span>NQTCoder-Terminal v2.0.26</span>
                </div>
                <div className="w-12"></div>
              </div>

              {/* Console Screen */}
              <div className="p-6 h-[220px] sm:h-[260px] overflow-y-auto font-mono text-xs space-y-2.5 bg-[#070b12] text-slate-300">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log.type === 'error' && (
                      <span className="text-rose-400 font-bold">[!] {log.text}</span>
                    )}
                    {log.type === 'warn' && (
                      <span className="text-amber-400">[?] {log.text}</span>
                    )}
                    {log.type === 'system' && (
                      <span className="text-slate-500">{log.text}</span>
                    )}
                    {log.type === 'info' && (
                      <span className="text-indigo-400">{log.text}</span>
                    )}
                    {log.type === 'hint' && (
                      <span className="text-emerald-400 font-semibold">{log.text}</span>
                    )}
                    {log.type === 'success' && (
                      <span className="text-emerald-400 font-bold">[SUCCESS] {log.text}</span>
                    )}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Controller Box */}
              <div className="bg-[#090d16]/80 border-t border-darkBorder/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${diagnosticsState === 'done' ? 'bg-emerald-400' : (diagnosticsState === 'idle' ? 'bg-rose-400' : 'bg-amber-400')}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${diagnosticsState === 'done' ? 'bg-emerald-500' : (diagnosticsState === 'idle' ? 'bg-rose-500' : 'bg-amber-500')}`}></span>
                  </span>
                  <span className="font-mono uppercase tracking-wide">
                    {diagnosticsState === 'idle' && 'Status: Ready to diagnose'}
                    {diagnosticsState === 'scanning' && 'Status: Analyzing compiler...'}
                    {diagnosticsState === 'fixing' && 'Status: Applying hot-patch...'}
                    {diagnosticsState === 'done' && 'Status: Restored / Redirecting...'}
                  </span>
                </div>

                <button
                  onClick={runDiagnostics}
                  disabled={diagnosticsState !== 'idle'}
                  className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all ${
                    diagnosticsState !== 'idle'
                      ? 'bg-darkBg text-slate-500 cursor-not-allowed border border-darkBorder/40'
                      : 'bg-gradient-to-r from-[#6366F1] to-indigo-600 hover:from-[#6366F1]/95 hover:to-indigo-600/95 text-white shadow-[#6366F1]/20 cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${diagnosticsState === 'scanning' ? 'animate-spin' : ''}`} />
                  <span>Run Diagnostics & Repair</span>
                </button>
              </div>

            </div>

          </div>

          {/* Right Column: Dynamic Action Cards & Redirect Links */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
                Available Target Outlets
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                
                {/* Outlets Option 1: Practice Arena */}
                <div 
                  onClick={() => navigate('/practice')}
                  className="glass-card bg-darkCard/40 border border-darkBorder hover:border-[#6366F1]/40 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 cursor-pointer group transition-all duration-300 hover:bg-darkCard hover:-translate-y-0.5"
                >
                  <div className="bg-indigo-500/10 text-[#6366F1] p-3 rounded-xl flex-shrink-0 group-hover:bg-[#6366F1] group-hover:text-white transition-all duration-300">
                    <Code className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#6366F1] transition-colors">
                        Practice Arena
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#6366F1] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Practice 100+ curated shifting placement challenges from top companies like TCS.
                    </p>
                  </div>
                </div>

                {/* Outlets Option 2: Mock Tests */}
                <div 
                  onClick={() => navigate('/mocktest')}
                  className="glass-card bg-darkCard/40 border border-darkBorder hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 cursor-pointer group transition-all duration-300 hover:bg-darkCard hover:-translate-y-0.5"
                >
                  <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Mock Assessments
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Evaluate your placement speed in proctored simulations under exam timers.
                    </p>
                  </div>
                </div>

                {/* Outlets Option 3: Leaderboard */}
                <div 
                  onClick={() => navigate('/leaderboard')}
                  className="glass-card bg-darkCard/40 border border-darkBorder hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 flex items-start space-x-4 cursor-pointer group transition-all duration-300 hover:bg-darkCard hover:-translate-y-0.5"
                >
                  <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        Student Leaderboard
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      View overall scores, solved metrics, and comparative analytics of your peers.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Back to Home Button at bottom of right column */}
            <div className="bg-darkCard/30 border border-darkBorder rounded-2xl p-5 flex items-center justify-between glass-panel">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-darkBg border border-darkBorder text-slate-400 flex items-center justify-center text-xs">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lost in compilation?</div>
                  <div className="text-[10px] text-slate-500">Go back to safely start navigation.</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="bg-transparent border border-darkBorder hover:border-slate-500/30 hover:bg-darkCard text-slate-300 hover:text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Compile Home</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default NotFound;
