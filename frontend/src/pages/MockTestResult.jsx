import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import { ChevronLeft, Award, AlertTriangle, ShieldCheck, Clock, FileCode, CheckCircle, XCircle } from 'lucide-react';
import SEO from '../components/SEO';

const MockTestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState(1); // 1 for Q1, 2 for Q2

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    setLoading(true);
    setError('');
    try {
      const history = await mockTestService.getMockTestHistory();
      const match = history.find(h => h._id === id);
      if (match) {
        setTest(match);
      } else {
        setError('Requested mock test report could not be found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch mock test results. Check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block">Compiling score analytics...</span>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-darkCard border border-darkBorder rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Report Load Error</h2>
        <p className="text-sm text-slate-400">{error || 'Session details not found.'}</p>
        <button
          onClick={() => navigate('/mocktest')}
          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Back to Mock Tests
        </button>
      </div>
    );
  }

  const date = new Date(test.completedAt || test.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isCheatDetected = test.tabSwitchesCount >= 3;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Mock Test Report"
        description="Detailed result sheet for your NQTCoder Mock Test session."
        path={`/mocktest/result/${id}`}
        noIndex={true}
      />
      
      {/* 1. Header Navigation */}
      <div className="flex items-center space-x-4 border-b border-darkBorder pb-5">
        <button
          onClick={() => navigate('/mocktest')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-darkCard rounded-md transition-all"
          title="Back to Mock Tests"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[9px] font-bold uppercase text-accentBlue tracking-wider">Exam Results Analytics</span>
          <h1 className="text-xl font-extrabold text-white tracking-wide">Mock Test Report</h1>
        </div>
      </div>

      {/* 2. Proctoring Infraction Banner */}
      {isCheatDetected && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-lg p-4 flex items-start space-x-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Test Auto-Submitted Due to Violations</h4>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              This session was terminated and auto-submitted because the system detected **{test.tabSwitchesCount} focus shifts/tab switches** away from the exam screen.
            </p>
          </div>
        </div>
      )}

      {/* 3. Stat Score Summaries Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Score card */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Final Score</div>
            <div className="text-2xl font-bold text-white">{test.totalScore} <span className="text-xs text-slate-500 font-bold">/ {test.maxScore}</span></div>
            <div className="text-[10px] text-slate-400 font-semibold">{date}</div>
          </div>
          <Award className="w-10 h-10 text-accentBlue shrink-0" />
        </div>

        {/* Question 1 Score */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Q1 Easy/Medium Score</div>
            <div className="text-2xl font-bold text-slate-200">{test.q1Score} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="text-[10px] text-slate-400 font-semibold flex items-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-1 shrink-0" />
              Passed: {test.q1PassedCount} / {test.q1TotalCount} cases
            </div>
          </div>
          <Clock className="w-8 h-8 text-slate-600 shrink-0" />
        </div>

        {/* Question 2 Score */}
        <div className="bg-darkCard border border-darkBorder rounded-lg p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Q2 Medium/Hard Score</div>
            <div className="text-2xl font-bold text-slate-200">{test.q2Score} <span className="text-xs text-slate-500">/ 100</span></div>
            <div className="text-[10px] text-slate-400 font-semibold flex items-center">
              {test.q2Score === 100 ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-1 shrink-0" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-accentBlue mr-1 shrink-0" />
              )}
              Passed: {test.q2PassedCount} / {test.q2TotalCount} cases
            </div>
          </div>
          <Clock className="w-8 h-8 text-slate-600 shrink-0" />
        </div>

      </div>

      {/* 4. Question Breakdown and Solutions Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Side: Question selector details */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest">Solved Challenges Details</h2>
          
          <div className="space-y-4">
            {/* Q1 card */}
            <div 
              onClick={() => setActiveCodeTab(1)}
              className={`border rounded-lg p-4 cursor-pointer transition-all space-y-3 ${
                activeCodeTab === 1 
                  ? 'bg-accentBlue/10 border-accentBlue shadow-sm' 
                  : 'bg-darkCard border-darkBorder hover:border-darkBorder/80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Question 1 (35 Min)</span>
                <span className={test.q1Score === 100 ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                  {test.q1Score} Marks
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{test.q1?.title || 'Unknown Title'}</h3>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold select-none uppercase">
                <span className={`px-2 py-0.5 rounded border ${
                  test.q1?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  test.q1?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {test.q1?.difficulty}
                </span>
                <span>•</span>
                <span className="text-slate-500 bg-darkBg border border-darkBorder px-1.5 py-0.5 rounded">
                  {test.q1?.topic}
                </span>
              </div>
            </div>

            {/* Q2 card */}
            <div 
              onClick={() => setActiveCodeTab(2)}
              className={`border rounded-lg p-4 cursor-pointer transition-all space-y-3 ${
                activeCodeTab === 2 
                  ? 'bg-accentBlue/10 border-accentBlue shadow-sm' 
                  : 'bg-darkCard border-darkBorder hover:border-darkBorder/80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Question 2 (55 Min)</span>
                <span className={test.q2Score === 100 ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                  {test.q2Score} Marks
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">{test.q2?.title || 'Unknown Title'}</h3>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold select-none uppercase">
                <span className={`px-2 py-0.5 rounded border ${
                  test.q2?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  test.q2?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {test.q2?.difficulty}
                </span>
                <span>•</span>
                <span className="text-slate-500 bg-darkBg border border-darkBorder px-1.5 py-0.5 rounded">
                  {test.q2?.topic}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Submitted Code display panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-black text-slate-400 tracking-widest flex items-center">
              <FileCode className="w-4 h-4 text-accentBlue mr-2" />
              Submitted Code Solution (Question {activeCodeTab})
            </h2>
            <span className="text-[10px] bg-darkCard border border-darkBorder px-2.5 py-1 rounded-md text-slate-400 uppercase font-black tracking-widest select-none">
              🌐 {activeCodeTab === 1 ? test.q1Language : test.q2Language}
            </span>
          </div>

          <div className="bg-darkCard border border-darkBorder rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-darkBg/50 border-b border-darkBorder flex items-center justify-between select-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {activeCodeTab === 1 ? test.q1?.title : test.q2?.title}
              </span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">
                {activeCodeTab === 1 
                  ? `Time spent: ${Math.floor(test.q1TimeSpent / 60)}m ${test.q1TimeSpent % 60}s` 
                  : `Time spent: ${Math.floor(test.q2TimeSpent / 60)}m ${test.q2TimeSpent % 60}s`}
              </span>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto bg-darkBg/30">
              {((activeCodeTab === 1 ? test.q1Code : test.q2Code) || '').trim() ? (
                <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-text">
                  {activeCodeTab === 1 ? test.q1Code : test.q2Code}
                </pre>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No solution code was submitted for this question (either skipped or auto-submitted with blank content).
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MockTestResult;
