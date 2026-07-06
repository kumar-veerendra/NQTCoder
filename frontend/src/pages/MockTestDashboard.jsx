import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import { AuthContext } from '../context/AuthContext';
import { 
  Award, Zap, AlertTriangle, ArrowRight, ShieldCheck, 
  Trophy, Layers, Clock, Sparkles, BookOpen 
} from 'lucide-react';
import SEO from '../components/SEO';

const MockTestDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [history, setHistory] = useState([]);
  const [historyV2, setHistoryV2] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [active, hist, bps, histV2] = await Promise.all([
        mockTestService.getCurrentMockTest(),
        mockTestService.getMockTestHistory(),
        mockTestService.getMockBlueprints(),
        mockTestService.getMockHistoryV2()
      ]);
      setActiveTest(active);
      setHistory(hist);
      setBlueprints(bps);
      setHistoryV2(histV2);

    } catch (err) {
      console.error('Failed to load mock tests dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMock = async () => {
    setStarting(true);
    try {
      const session = await mockTestService.startMockTest();
      navigate(`/mocktest/arena/${session._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start mock test session.');
    } finally {
      setStarting(false);
    }
  };

  const handleStartMockV2 = async (blueprintId) => {
    setStarting(true);
    try {
      const { instance } = await mockTestService.startMockInstance(blueprintId);
      navigate(`/mocktest/arena/v2/${instance._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start mock exam.');
    } finally {
      setStarting(false);
    }
  };

  // Stat computations (combined V1 and V2)
  const totalTests = history.length + historyV2.length;
  
  const maxScore = Math.max(
    history.length > 0 ? Math.max(...history.map(h => h.totalScore)) : 0,
    historyV2.length > 0 ? Math.max(...historyV2.map(h => h.totalScore)) : 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Mock Test Center — Simulated Corporate Assessments"
        description="Take proctored, corporate-syllabus aligned mock tests (TCS NQT, Wipro, Infosys) combining Quant, Reasoning, and Coding questions."
        path="/mocktest"
      />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-darkBorder">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-accentBlue" />
            Mock Test Center
          </h1>
          <p className="text-slate-400 text-xs">
            Simulate real assessments with strict section timers, anti-cheat tab warnings, and dynamic syllabus pools.
          </p>
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0 text-xs font-semibold text-slate-400 select-none">
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-md">
            Total Mock Exams: <span className="text-accentBlue font-bold">{totalTests} sitting(s)</span>
          </div>
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-md">
            Top Score: <span className="text-emerald-400 font-bold">{maxScore} Marks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Mock Test Blueprints Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
              <Sparkles className="w-4 h-4 text-accentBlue mr-2" />
              Corporate Syllabus Exam Blueprints
            </h2>

            {loading ? (
              <div className="py-12 text-center bg-darkCard border border-darkBorder rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mx-auto mb-2"></div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing exam patterns...</span>
              </div>
            ) : blueprints.length === 0 ? (
              <div className="p-8 text-center bg-darkCard border border-darkBorder rounded-lg text-slate-500 text-xs">
                No mock test blueprints loaded in system.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprints.map((bp) => (
                  <div 
                    key={bp.blueprintId} 
                    className="bg-darkCard border border-darkBorder rounded-xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 opacity-50 select-none"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-slate-500/10 text-slate-400 px-2.5 py-0.5 rounded-lg border border-slate-500/20 font-black tracking-wider uppercase">
                          🔒 Coming Soon
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                          ⏱️ {bp.totalDurationMinutes} Mins
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">{bp.title}</h3>
                      
                      <div className="space-y-1.5 pt-1">
                        {bp.sections.map((sec, sIdx) => (
                          <div key={sIdx} className="flex justify-between text-[11px] text-slate-400">
                            <span>• {sec.sectionName}</span>
                            <span className="font-semibold text-slate-300">{sec.itemCount} Qs</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full bg-slate-800 text-slate-500 mt-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-not-allowed"
                    >
                      <span>🔒 Coming Soon</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legacy Mock Option (Backwards compatibility) */}
          {!activeTest && (
            <div className="bg-darkCard border border-darkBorder/60 rounded-xl p-5 flex items-center justify-between gap-6 shadow-sm">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Coding Placement Simulator (Legacy)
                </h3>
                <p className="text-xs text-slate-500 max-w-lg">
                  Generates 2 non-repeating programming problems (Easy/Med and Med/Hard) with strict proctor tab checks.
                </p>
              </div>
              <button
                onClick={handleStartMock}
                disabled={starting}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow border border-darkBorder hover:border-slate-500 shrink-0"
              >
                Launch Simulator
              </button>
            </div>
          )}

          {/* Previous Mock Test Performance History */}
          <div className="space-y-3 pt-4">
            <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
              <Trophy className="w-4.5 h-4.5 text-accentBlue mr-2" />
              Previous Mock Test Performance
            </h2>

            {loading ? (
              <div className="bg-darkCard border border-darkBorder rounded-lg p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
              </div>
            ) : history.length === 0 && historyV2.length === 0 ? (
              <div className="bg-darkCard border border-darkBorder rounded-lg p-12 text-center text-slate-500 space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold">No mock tests taken yet.</div>
                <p className="text-xs text-slate-500">Exams taken will log details, warnings, and marks reports here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Render Dynamic Blueprints history */}
                {historyV2.map((test) => {
                  const date = new Date(test.endedAt || test.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div 
                      key={test._id}
                      className="bg-darkCard border border-darkBorder rounded-xl p-4 flex items-center justify-between transition-all hover:border-accentBlue group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-black tracking-wider uppercase">
                            Dynamic Mock
                          </span>
                          <h3 className="text-xs font-bold text-slate-200 tracking-wide truncate group-hover:text-accentBlue transition-colors">
                            {test.blueprintId === 'TCS-NQT-MINI-01' ? 'TCS NQT Cognitive & Coding Mini Mock' : 'Corporate Mock Exam'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500 select-none">
                          <span>📅 {date}</span>
                          <span>•</span>
                          <span className={test.tabSwitchesCount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                            ⚠️ {test.tabSwitchesCount} Warnings
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-100">{test.totalScore} / {test.maxScore}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Score</div>
                        </div>
                        <button
                          onClick={() => navigate(`/mocktest/result/v2/${test._id}`)}
                          className="bg-darkBg hover:bg-darkCard border border-darkBorder text-xs text-slate-300 px-3.5 py-1.5 rounded-xl transition-all font-bold uppercase tracking-wider cursor-pointer"
                        >
                          View Report
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Render Legacy history */}
                {history.map((test) => {
                  const date = new Date(test.completedAt || test.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  return (
                    <div 
                      key={test._id}
                      className="bg-darkCard border border-darkBorder rounded-xl p-4 flex items-center justify-between transition-all hover:border-accentBlue group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded border border-darkBorder font-black tracking-wider uppercase">
                            Coding simulator
                          </span>
                          <h3 className="text-xs font-bold text-slate-200 tracking-wide truncate group-hover:text-accentBlue transition-colors">
                            Placement Coding Simulation
                          </h3>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500 select-none">
                          <span>📅 {date}</span>
                          <span>•</span>
                          <span className={test.tabSwitchesCount > 0 ? 'text-amber-400' : 'text-slate-500'}>
                            ⚠️ {test.tabSwitchesCount} Warnings
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-100">{test.totalScore} / 200</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Score</div>
                        </div>
                        <button
                          onClick={() => navigate(`/mocktest/result/${test._id}`)}
                          className="bg-darkBg hover:bg-darkCard border border-darkBorder text-xs text-slate-300 px-3.5 py-1.5 rounded-xl transition-all font-bold uppercase tracking-wider cursor-pointer"
                        >
                          View Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active test banner & Engagement rules */}
        <div className="lg:col-span-1 space-y-6">
          {activeTest && (
            <div className="bg-darkCard border border-amber-500/20 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-[10px] font-black tracking-wider text-amber-400 uppercase select-none">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Active Session Found
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">You have a mock test currently in progress.</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your session is locked. You must complete or resume this mock test before accessing other standard questions.
              </p>
              <button
                onClick={() => navigate(`/mocktest/arena/${activeTest._id}`)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow cursor-pointer"
              >
                <span>Resume Mock Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="bg-darkCard border border-darkBorder rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center select-none">
              <Clock className="w-4 h-4 text-accentBlue mr-2" /> Rules of Engagement
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 list-disc list-inside leading-relaxed">
              <li>Timers count down automatically and do not pause if you close your browser.</li>
              <li>Do not leave the screen. **3 tab switches** will auto-submit your exam with 0 marks on remaining test cases.</li>
              <li>Ensure you write code from scratch. Copy-pasting is blocked inside the editor.</li>
              <li>Score is calculated dynamically based on section rules and compiler hidden test runs.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestDashboard;
