import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import { AuthContext } from '../context/AuthContext';
import { Award, Zap, AlertTriangle, Code2, ArrowRight, ShieldCheck, Trophy, Layers, Clock } from 'lucide-react';

const MockTestDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const active = await mockTestService.getCurrentMockTest();
      setActiveTest(active);
      
      const hist = await mockTestService.getMockTestHistory();
      setHistory(hist);
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

  // Stat computations
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.totalScore, 0) / totalTests) 
    : 0;
  const maxScore = totalTests > 0 
    ? Math.max(...history.map(h => h.totalScore)) 
    : 0;
  const totalCheats = history.reduce((sum, h) => sum + (h.tabSwitchesCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-darkBg text-slate-100 min-h-screen">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-darkBorder">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-accentBlue" />
            Mock Test Center
          </h1>
          <p className="text-slate-400 text-xs">
            Simulate real assessments with strict timers, no autocomplete, and tab focus proctor constraints.
          </p>
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0 text-xs font-semibold text-slate-400 select-none">
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-md">
            Avg Score: <span className="text-accentBlue font-bold">{avgScore} / 200</span>
          </div>
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-md">
            Top Score: <span className="text-emerald-400 font-bold">{maxScore} / 200</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Start / Active Sessions Panel */}
        <div className="lg:col-span-1 space-y-6">
          {activeTest ? (
            <div className="bg-darkCard border border-amber-500/20 rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-[10px] font-black tracking-wider text-amber-400 uppercase select-none">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Active Session Found
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">You have a mock test currently in progress.</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your session is locked. You must complete or resume this mock test before accessing other standard questions.
              </p>
              <button
                onClick={() => navigate(`/mocktest/arena/${activeTest._id}`)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Resume Mock Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-[10px] font-black tracking-wider text-accentBlue uppercase select-none">
                <Zap className="w-3.5 h-3.5 text-accentBlue shrink-0" /> Practice assessment
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">Launch Placement Simulator</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates 2 non-repeating coding questions. 
                <br/>* **Q1 (Easy/Med):** 35 Minutes
                <br/>* **Q2 (Med/Hard):** 55 Minutes
                <br/>No code hints are visible, right-click/copy is blocked, and switching browser tabs triggers warnings.
              </p>
              <button
                onClick={handleStartMock}
                disabled={starting}
                className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <span>{starting ? 'Generating Test...' : 'Start Mock Test'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick instructions / guidelines list */}
          <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4 shadow-sm">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center select-none">
              <Clock className="w-4 h-4 text-accentBlue mr-2" /> Rules of Engagement
            </h3>
            <ul className="space-y-3 text-xs text-slate-400 list-disc list-inside leading-relaxed">
              <li>Timers count down automatically and do not pause if you close your browser.</li>
              <li>Do not leave the screen. **3 tab switches** will auto-submit your exam with 0 marks on remaining test cases.</li>
              <li>Ensure you write code from scratch. Copy-pasting is blocked inside the editor.</li>
              <li>Calculates score out of 200 (100 marks per question).</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Mock Test History list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
            <Trophy className="w-4 h-4 text-accentBlue mr-2" />
            Previous Mock Test Performance
          </h2>

          {loading ? (
            <div className="bg-darkCard border border-darkBorder rounded-lg p-16 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Opening performance archives...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-darkCard border border-darkBorder rounded-lg p-12 text-center text-slate-500 space-y-2">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-bold">No mock tests taken yet.</div>
              <p className="text-xs text-slate-500">Launch your first simulator test to review score summaries and checkmate details.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((test) => {
                const date = new Date(test.completedAt || test.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                
                return (
                  <div 
                    key={test._id}
                    className="bg-darkCard border border-darkBorder rounded-lg p-4 flex items-center justify-between transition-all hover:border-accentBlue group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-200 tracking-wide truncate group-hover:text-accentBlue transition-colors">
                        Placement Mock Test Session
                      </h3>
                      <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500">
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
                        className="bg-darkBg hover:bg-darkCard border border-darkBorder text-xs text-slate-300 px-3 py-1.5 rounded-md transition-all font-semibold"
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
    </div>
  );
};

export default MockTestDashboard;
