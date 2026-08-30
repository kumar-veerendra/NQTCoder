import React, { useState } from 'react';
import { CheckCircle2, XCircle, Terminal, Award, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

const WebDevTestResults = ({ results, consoleLogs = [], isRunning = false, onRunAgain }) => {
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'console'

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-darkCard/50 border border-darkBorder rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center text-accentBlue mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Evaluating Behavioral Tests...</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Simulating user clicks, inputs, and validating computed DOM styles inside the sandbox.
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-darkCard/30 border border-darkBorder rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Tests Run Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
          Click <strong>Run Tests</strong> to evaluate your HTML, CSS, and JavaScript implementation against the behavioral test suite.
        </p>
        {onRunAgain && (
          <button
            type="button"
            onClick={onRunAgain}
            className="bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Run Tests Now
          </button>
        )}
      </div>
    );
  }

  const {
    testResults = [],
    passedCount = 0,
    totalCount = 0,
    pointsEarned = 0,
    totalPoints = 100,
    score = 0,
  } = results;

  const isAllPassed = score === 100;

  return (
    <div className="flex flex-col h-full bg-darkBg border border-darkBorder rounded-2xl overflow-hidden shadow-xl">
      {/* Header Tabs */}
      <div className="bg-darkCard px-4 py-2.5 border-b border-darkBorder flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-accentBlue text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Results ({passedCount}/{totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'console'
                ? 'bg-accentBlue text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console Logs ({consoleLogs.length})</span>
          </button>
        </div>

        {/* Score Pill */}
        <div
          className={`text-xs font-black px-3 py-1 rounded-xl border flex items-center space-x-1.5 ${
            isAllPassed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : score > 0
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>
            {score}% ({pointsEarned}/{totalPoints} pts)
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {activeTab === 'tests' ? (
          <>
            {/* Top Score Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isAllPassed
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : score > 0
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isAllPassed ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-amber-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isAllPassed
                      ? 'All Behavioral Tests Passed!'
                      : `${passedCount} of ${totalCount} Tests Passed`}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isAllPassed
                      ? 'Your implementation satisfies all functional requirements.'
                      : 'Review the failed test descriptions below to complete your solution.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-white">{score}</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="space-y-2.5 pt-2">
              {testResults.map((test, idx) => (
                <div
                  key={test.testId || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    test.passed
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {test.description}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        test.passed
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {test.passed ? `+${test.points} pts` : `0/${test.points} pts`}
                    </span>
                  </div>

                  {!test.passed && test.failureMessage && (
                    <p className="text-xs text-rose-300/90 mt-2 pl-6.5 font-mono leading-relaxed bg-rose-500/10 p-2 rounded-lg">
                      {test.failureMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Console Tab */
          <div className="font-mono text-xs space-y-1.5 bg-darkCard/50 p-3 rounded-xl border border-darkBorder min-h-[220px]">
            {consoleLogs.length === 0 ? (
              <span className="text-slate-500 italic">No console outputs recorded. Use console.log() in your code to debug.</span>
            ) : (
              consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`p-1.5 rounded ${
                    log.level === 'error'
                      ? 'text-rose-400 bg-rose-500/10'
                      : log.level === 'warn'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="opacity-50 mr-2">[{log.level.toUpperCase()}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDevTestResults;
