import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertCircle, FileCode, Check } from 'lucide-react';

const Console = ({
  customInput,
  onCustomInputChange,
  isExecuting,
  executionResult,
  activeTab,
  onActiveTabChange,
  queueStatus
}) => {
  
  const getVerdictStyle = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Wrong Answer':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Compilation Error':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Time Limit Exceeded':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getVerdictIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'Wrong Answer':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'Compilation Error':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-darkCard border border-darkBorder rounded-lg overflow-hidden text-slate-300">
      {/* Console Tab Selectors */}
      <div className="px-4 bg-darkBg/60 border-b border-darkBorder flex items-center justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => onActiveTabChange('input')}
            className={`px-3 sm:px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'input'
                ? 'border-accentBlue text-accentBlue'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden sm:inline">Custom Input</span>
            <span className="inline sm:hidden">Input</span>
          </button>
          <button
            onClick={() => onActiveTabChange('output')}
            className={`px-3 sm:px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'output'
                ? 'border-accentBlue text-accentBlue'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="hidden sm:inline">Results Console</span>
            <span className="inline sm:hidden">Results</span>
          </button>
        </div>

        {isExecuting && (
          <div className="flex items-center space-x-2 text-xs text-accentBlue">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-accentBlue"></div>
            <span>
              {queueStatus && queueStatus.status === 'queued'
                ? `Queued (Pos: ${queueStatus.position}, Wait: ${queueStatus.estimatedWait}s)`
                : queueStatus && queueStatus.status === 'running'
                ? 'Compiling & Running...'
                : 'Executing...'}
            </span>
          </div>
        )}
      </div>

      {/* Tab Area Content */}
      <div className="flex-grow p-4 min-h-0 overflow-y-auto bg-darkBg/30">
        
        {/* Tab 1: Custom Input */}
        {activeTab === 'input' && (
          <div className="h-full flex flex-col space-y-3">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Provide Standard Input (stdin):</label>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="Paste or type test input cases here..."
              className="flex-grow w-full bg-darkBg border border-darkBorder p-3 rounded-md text-sm text-slate-200 font-mono focus:outline-none focus:border-accentBlue resize-none"
            />
          </div>
        )}

        {/* Tab 2: Execution Results */}
        {activeTab === 'output' && (
          <div className="space-y-4">
            {!executionResult ? (
              isExecuting ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-accentBlue text-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mb-3"></div>
                  <span className="font-extrabold uppercase tracking-wide">
                    {queueStatus && queueStatus.status === 'queued'
                      ? `Job Queued (Position ${queueStatus.position}, Est. Wait: ${queueStatus.estimatedWait}s)`
                      : 'Compiling & Executing Code...'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1.5 uppercase font-bold tracking-wider">Please keep this window open</span>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                  <Play className="w-8 h-8 text-slate-600 mb-2" />
                  <span>Click "Run Code" or "Submit Code" to view compiler output.</span>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Overall status card */}
                <div className={`flex items-center justify-between p-4 rounded-xl border ${getVerdictStyle(executionResult.status)}`}>
                  <div className="flex items-center space-x-3">
                    {getVerdictIcon(executionResult.status)}
                    <div>
                      <div className="text-sm font-black uppercase tracking-wider">Verdict: {executionResult.status}</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {executionResult.isCustom 
                          ? 'Executed against custom input'
                          : executionResult.status === 'Compilation Error'
                          ? 'Failed to compile'
                          : `Passed ${
                              executionResult.passedCount !== undefined 
                                ? executionResult.passedCount 
                                : (executionResult.testResults ? executionResult.testResults.filter(r => r.status === 'Accepted').length : 0)
                            } / ${
                              executionResult.totalCount !== undefined 
                                ? executionResult.totalCount 
                                : (executionResult.testResults ? executionResult.testResults.length : 0)
                            } test cases`
                        }
                      </div>
                    </div>
                  </div>
                  {executionResult.runTime !== undefined && (
                    <div className="text-xs font-mono">Time: {executionResult.runTime}s</div>
                  )}
                </div>

                {/* Compilation Logs / System Missing Compiler Errors */}
                {executionResult.status === 'Compilation Error' && (
                  <div className="space-y-3">
                    {executionResult.error?.includes('[System Error]') ? (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-5 rounded-xl space-y-3 shadow-lg">
                        <div className="flex items-center space-x-2 text-red-400 font-extrabold uppercase text-xs tracking-wider">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 animate-bounce" />
                          <span>Missing System Dependency Alert</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                          {executionResult.error.replace('[System Error] ', '')}
                        </p>
                        <div className="pt-2 flex gap-3 flex-wrap">
                          {executionResult.error.includes('Java') && (
                            <a
                              href="https://adoptium.net/temurin/releases/?version=8"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-500/20"
                            >
                              Download OpenJDK 8
                            </a>
                          )}
                          {executionResult.error.includes('GCC') && (
                            <a
                              href="https://www.msys2.org/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-500/20"
                            >
                              Download MinGW (C++)
                            </a>
                          )}
                          {executionResult.error.includes('Python') && (
                            <a
                              href="https://www.python.org/downloads/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border border-red-500/20"
                            >
                              Download Python 3
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center">
                          <FileCode className="w-4 h-4 mr-1.5" /> Compiler Logs:
                        </div>
                        <pre className="bg-amber-950/20 border border-amber-500/20 text-amber-200 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {executionResult.error || 'No compiler messages returned.'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Runtime Error or Other Errors without test results (e.g. process crashed or network error) */}
                {executionResult.status !== 'Compilation Error' && executionResult.error && (!executionResult.testResults || executionResult.testResults.length === 0) && (
                  <div className="space-y-2">
                    <div className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" /> Error Details:
                    </div>
                    <pre className="bg-rose-950/20 border border-rose-500/20 text-rose-300 p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {executionResult.error}
                    </pre>
                  </div>
                )}

                {/* Visible cases list */}
                {executionResult.testResults && executionResult.testResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Test Case Results:</div>
                    
                    <div className="space-y-3">
                      {executionResult.testResults.map((res, i) => (
                        <div key={i} className="bg-darkCard border border-darkBorder rounded-lg p-3.5 space-y-3">
                          <div className="flex items-center justify-between border-b border-darkBorder/40 pb-2">
                            <span className="text-xs font-bold text-slate-200">Test Case {res.testCaseIndex}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${
                              res.status === 'Accepted' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                            }`}>
                              {res.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Input</div>
                              <pre className="bg-darkBg border border-darkBorder/40 p-2 rounded font-mono text-xs overflow-x-auto max-h-24 whitespace-pre-wrap">
                                {res.input}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Expected Output</div>
                              <pre className="bg-darkBg border border-darkBorder/40 p-2 rounded font-mono text-xs overflow-x-auto max-h-24 whitespace-pre-wrap">
                                {res.expectedOutput}
                              </pre>
                            </div>
                          </div>

                          {res.status !== 'Compilation Error' && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Your Output</div>
                              <pre className={`border p-2 rounded font-mono text-xs overflow-x-auto max-h-32 whitespace-pre-wrap ${
                                res.status === 'Accepted'
                                  ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-950/10 border-rose-500/20 text-rose-300'
                              }`}>
                                {res.actualOutput || (res.error ? `Error: ${res.error}` : '(Empty Output)')}
                              </pre>
                            </div>
                          )}

                          {res.error && res.status !== 'Accepted' && (
                            <div className="text-[10px] text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10 font-mono">
                              <span className="font-bold text-red-300">Stderr:</span> {res.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Console;
