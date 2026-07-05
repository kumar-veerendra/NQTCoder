import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import * as executionService from '../services/executionService';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor, { CODE_TEMPLATES } from '../components/CodeEditor';
import Console from '../components/Console';
import { Play, Send, ChevronLeft, Terminal, AlertTriangle, ShieldCheck, Sun, Moon } from 'lucide-react';
import SEO from '../components/SEO';

const MockTestArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [mockTest, setMockTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compilerStatus, setCompilerStatus] = useState(null);
  
  // Active Question states
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);

  // Theme state from global context
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Console states
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState('input');

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Proctoring states
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Layout resizing states
  const [leftWidth, setLeftWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [editorHeight, setEditorHeight] = useState(60);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const arenaRef = useRef(null);

  // Mobile responsiveness states
  const [activeMobileTab, setActiveMobileTab] = useState('description');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchActiveSession();
    fetchCompilerStatus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchCompilerStatus = async () => {
    try {
      const data = await executionService.getCompilersStatus();
      setCompilerStatus(data);
    } catch (err) {
      console.error('Failed to retrieve compiler status:', err);
      setCompilerStatus({ error: true });
    }
  };

  const fetchActiveSession = async () => {
    setLoading(true);
    setError('');
    try {
      const active = await mockTestService.getCurrentMockTest();
      if (!active || active._id !== id) {
        setError('No active mock test session found.');
        return;
      }
      setMockTest(active);
      setWarningCount(active.tabSwitchesCount);

      const normalize = (str) => {
        if (!str) return '';
        return str.replace(/\r\n/g, '\n').trim();
      };

      // Determine active question
      if (active.q1Status === 'started') {
        setQuestionNumber(1);
        setActiveQuestion(active.q1);
        const q1Lang = active.q1Language || 'cpp';
        setLanguage(q1Lang);
        setCode(active.q1Code && normalize(active.q1Code) !== '' ? active.q1Code : CODE_TEMPLATES[q1Lang] || '');
        setupTimer(active, 1);
      } else if (active.q2Status === 'started') {
        setQuestionNumber(2);
        setActiveQuestion(active.q2);
        const q2Lang = active.q2Language || 'cpp';
        setLanguage(q2Lang);
        setCode(active.q2Code && normalize(active.q2Code) !== '' ? active.q2Code : CODE_TEMPLATES[q2Lang] || '');
        setupTimer(active, 2);
      } else {
        // Mock test already finished
        navigate(`/mocktest/result/${active._id}`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to query mock test state from server.');
    } finally {
      setLoading(false);
    }
  };

  const setupTimer = (testDoc, qNum) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const startTimestamp = qNum === 1 ? testDoc.q1StartedAt : testDoc.q2StartedAt;
    const maxSeconds = qNum === 1 ? 35 * 60 : 55 * 60; // 35 min or 55 min
    
    const calculateTimeLeft = () => {
      const elapsedSeconds = Math.floor((Date.now() - new Date(startTimestamp).getTime()) / 1000);
      const remaining = Math.max(0, maxSeconds - elapsedSeconds);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleAutoSubmitQuestion();
      }
    };

    calculateTimeLeft();
    timerRef.current = setInterval(calculateTimeLeft, 1000);
  };

  const handleLanguageChange = (newLang) => {
    const normalize = (str) => {
      if (!str) return '';
      return str.replace(/\r\n/g, '\n').trim();
    };

    const currentNormalized = normalize(code);
    const templates = Object.values(CODE_TEMPLATES).map(t => normalize(t));

    // If current code is empty or matches one of the templates, swap it to the new language's template
    if (!code || !currentNormalized || templates.includes(currentNormalized)) {
      setCode(CODE_TEMPLATES[newLang] || '');
    }

    setLanguage(newLang);
  };

  // Proctoring tab blur event
  useEffect(() => {
    const handleBlur = async () => {
      if (!mockTest || mockTest.status !== 'active' || showWarningModal || loading) return;
      try {
        const res = await mockTestService.recordMockTestViolation(mockTest._id);
        setWarningCount(res.tabSwitchesCount);
        if (res.autoSubmitted) {
          if (timerRef.current) clearInterval(timerRef.current);
          alert('Test auto-submitted. Focus proctor constraint violation limit reached (3 shifts).');
          navigate(`/mocktest/result/${mockTest._id}`);
        } else {
          setShowWarningModal(true);
        }
      } catch (err) {
        console.error('Failed to log proctor violation', err);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [mockTest, showWarningModal, loading]);

  const handleRunCode = async () => {
    if (!code.trim() || !activeQuestion) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);

    try {
      const result = await executionService.runCode(code, language, activeQuestion._id, customInput, setQueueStatus);
      if (result.isCustom) {
        setExecutionResult({
          status: result.runResult.status === 'Success' ? 'Accepted' : result.runResult.status,
          isCustom: true,
          error: result.runResult.error,
          testResults: [
            {
              testCaseIndex: 1,
              input: result.runResult.input,
              expectedOutput: '(Custom Execution)',
              actualOutput: result.runResult.stdout,
              error: result.runResult.error,
              status: result.runResult.status === 'Success' ? 'Accepted' : result.runResult.status
            }
          ]
        });
      } else {
        setExecutionResult(result);
      }
    } catch (err) {
      setExecutionResult({
        status: 'Runtime Error',
        isCustom: false,
        error: err.response?.data?.message || err.message || 'Execution failed.'
      });
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!code.trim() || !mockTest) return;
    if (!window.confirm(`Are you sure you want to submit Question ${questionNumber}? You cannot return to edit it.`)) return;
    
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);

    // Compute remaining time
    const startTimestamp = questionNumber === 1 ? mockTest.q1StartedAt : mockTest.q2StartedAt;
    const elapsedSeconds = Math.floor((Date.now() - new Date(startTimestamp).getTime()) / 1000);

    try {
      const updatedTest = await mockTestService.submitMockTestQuestion(
        mockTest._id,
        questionNumber,
        code,
        language,
        elapsedSeconds
      );

      if (questionNumber === 1) {
        alert('Question 1 submitted successfully. Swapping to Question 2 (55 minutes start).');
        fetchActiveSession();
      } else {
        alert('Mock test completed successfully. Loading score report card...');
        navigate(`/mocktest/result/${mockTest._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Submission failed.');
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleAutoSubmitQuestion = async () => {
    if (!mockTest) return;
    setIsExecuting(true);
    
    const startTimestamp = questionNumber === 1 ? mockTest.q1StartedAt : mockTest.q2StartedAt;
    const elapsedSeconds = Math.floor((Date.now() - new Date(startTimestamp).getTime()) / 1000);

    try {
      await mockTestService.submitMockTestQuestion(
        mockTest._id,
        questionNumber,
        code || '// Time limit exceeded template',
        language,
        elapsedSeconds
      );

      if (questionNumber === 1) {
        alert('Time limit expired for Question 1! Submitting and loading Question 2.');
        fetchActiveSession();
      } else {
        alert('Time limit expired for Question 2! Submitting and ending mock test.');
        navigate(`/mocktest/result/${mockTest._id}`);
      }
    } catch (err) {
      console.error('Auto submit failed', err);
      navigate('/mocktest');
    }
  };

  // Drag resizing handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      if (arenaRef.current) {
        const arenaRect = arenaRef.current.getBoundingClientRect();
        const percentageWidth = (e.clientX - arenaRect.left) / arenaRect.width * 100;
        if (percentageWidth > 20 && percentageWidth < 80) {
          setLeftWidth(percentageWidth);
        }
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleHeightMouseDown = (e) => {
    e.preventDefault();
    setIsResizingHeight(true);
  };

  useEffect(() => {
    const handleMouseMoveHeight = (e) => {
      if (!isResizingHeight) return;
      if (arenaRef.current) {
        const arenaRect = arenaRef.current.getBoundingClientRect();
        const percentageHeight = (e.clientY - arenaRect.top) / arenaRect.height * 100;
        if (percentageHeight > 25 && percentageHeight < 80) {
          setEditorHeight(percentageHeight);
        }
      }
    };
    const handleMouseUpHeight = () => setIsResizingHeight(false);

    if (isResizingHeight) {
      window.addEventListener('mousemove', handleMouseMoveHeight);
      window.addEventListener('mouseup', handleMouseUpHeight);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveHeight);
      window.removeEventListener('mouseup', handleMouseUpHeight);
    };
  }, [isResizingHeight]);

  const formatTimer = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen h-screen flex flex-col items-center justify-center space-y-4 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Opening Secure Exam Room...</span>
      </div>
    );
  }

  if (error || !mockTest || !activeQuestion) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-darkCard border border-darkBorder rounded-lg text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Oops! Assessment Arena Error</h2>
        <p className="text-sm text-slate-400">{error || 'Session details unavailable.'}</p>
        <button
          onClick={() => navigate('/mocktest')}
          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Back to Mock Tests
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen max-h-screen flex flex-col bg-darkBg overflow-hidden select-none ${
        isResizing ? 'cursor-col-resize' : isResizingHeight ? 'cursor-row-resize' : ''
      }`}
    >
      <SEO
        title="Mock Test Arena"
        description="Proctored mock test session on NQTCoder. Timed exam with anti-cheat monitoring."
        path="/mocktest/arena"
        noIndex={true}
      />
      
      {/* 1. Strict Exam Header bar */}
      <div className="px-3 sm:px-6 py-2 bg-darkCard border-b border-darkBorder flex items-center justify-between shrink-0 z-10 gap-2 select-none">
        
        <div className="flex items-center space-x-2 w-auto md:w-1/3 md:min-w-[220px]">
          <div className="bg-red-600 p-1.5 rounded-md select-none shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wider text-rose-400 shrink-0 hidden sm:inline">
            PROCTOR LOBBY ({questionNumber}/2)
          </span>
          <span className="text-[10px] font-bold tracking-wider text-rose-400 shrink-0 inline sm:hidden">
            P-{questionNumber}
          </span>
          <div className="w-px h-4 bg-darkBorder shrink-0 hidden md:block"></div>
          <div className="truncate hidden md:block">
            <h2 className="text-xs font-bold text-slate-300 tracking-wide truncate">{activeQuestion.title}</h2>
          </div>
        </div>

        {/* Compile Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 justify-center w-auto md:w-1/3 shrink-0">
          <button
            onClick={handleRunCode}
            disabled={isExecuting || !code.trim()}
            className="bg-darkCard hover:bg-darkBg/60 text-slate-200 border border-darkBorder px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wide flex items-center space-x-1 sm:space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            <span>Run</span>
          </button>
          
          <button
            onClick={handleSubmitQuestion}
            disabled={isExecuting || !code.trim()}
            className="bg-accentBlue hover:bg-accentBlue/90 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wider flex items-center space-x-1 sm:space-x-1.5 transition-colors"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="hidden sm:inline">Submit Solution</span>
            <span className="inline sm:hidden">Submit</span>
          </button>
        </div>

        {/* Proctoring info and countdown timer */}
        <div className="flex justify-end w-auto md:w-1/3 items-center space-x-1.5 sm:space-x-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-accentBlue hover:bg-accentBlue/10 rounded-md transition-all duration-200 shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <div className="flex items-center space-x-1 text-[10px] text-amber-500 font-bold border border-amber-500/25 px-1.5 py-0.5 rounded-md select-none shrink-0">
            <span>⚠️ <span className="hidden sm:inline">Switches: </span>{warningCount}/3</span>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-xs sm:text-sm px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-md flex items-center space-x-1 sm:space-x-1.5 font-bold select-none shrink-0">
            <span className="text-[9px] font-bold uppercase text-red-500 mr-0.5 tracking-wider hidden sm:inline">Time Left:</span>
            {formatTimer(timeLeft)}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden bg-darkCard border-b border-darkBorder p-1.5 justify-around z-10 shrink-0 select-none">
        <button
          onClick={() => setActiveMobileTab('description')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-center rounded-md transition-all border ${
            activeMobileTab === 'description'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveMobileTab('code')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-center rounded-md transition-all border ${
            activeMobileTab === 'code'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveMobileTab('console')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider text-center rounded-md transition-all border ${
            activeMobileTab === 'console'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Console
        </button>
      </div>

      {/* 2. Workspace layouts */}
      <div 
        ref={arenaRef}
        className="flex-grow min-h-0 flex p-1.5 gap-0 relative bg-darkBg"
      >
        {/* Left column: Problem Statement Description (No Hints) */}
        <div 
          className={`h-full bg-darkCard/50 border border-darkBorder/70 rounded-lg p-4 overflow-hidden flex-grow md:flex-grow-0 ${
            isMobile && activeMobileTab !== 'description' ? 'hidden' : 'block'
          }`}
          style={isMobile ? { width: '100%' } : { width: `${leftWidth}%` }}
        >
          <ProblemDescription question={activeQuestion} isMockTest={true} />
        </div>

        {/* Vertical Resizer */}
        {!isMobile && (
          <div
            onMouseDown={handleMouseDown}
            className="w-2.5 cursor-col-resize h-full flex items-center justify-center group select-none relative shrink-0 z-20"
          >
            <div className="w-[2px] h-full bg-darkBorder group-hover:bg-accentBlue/60 group-active:bg-accentBlue transition-colors"></div>
          </div>
        )}

        {/* Right column: Monaco Editor + Console Outputs */}
        <div 
          className={`h-full flex-col min-h-0 relative flex-grow md:flex-grow-0 ${
            isMobile && activeMobileTab === 'description' ? 'hidden' : 'flex'
          }`}
          style={isMobile ? { width: '100%' } : { width: `${100 - leftWidth}%` }}
        >
          {/* Top Panel: Monaco editor (copy paste blocked) */}
          <div 
            className={`min-h-0 w-full overflow-hidden flex-grow md:flex-grow-0 ${
              isMobile && activeMobileTab !== 'code' ? 'hidden' : 'block'
            }`}
            style={isMobile ? { height: '100%' } : { height: `calc(${editorHeight}% - 4px)` }}
          >
            <CodeEditor
              language={language}
              onLanguageChange={handleLanguageChange}
              code={code}
              onCodeChange={setCode}
              isLocked={false}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              theme={theme}
              disableClipboard={true}
              compilerStatus={compilerStatus}
            />
          </div>

          {/* Horizontal Resizer */}
          {!isMobile && (
            <div
              onMouseDown={handleHeightMouseDown}
              className="h-2 cursor-row-resize w-full flex items-center justify-center group select-none relative shrink-0 z-20"
            >
              <div className="h-[2px] w-full bg-darkBorder group-hover:bg-accentBlue/60 group-active:bg-accentBlue transition-colors"></div>
            </div>
          )}

          {/* Bottom Panel: Output console */}
          <div 
            className={`min-h-0 w-full flex-col bg-darkCard border border-darkBorder rounded-lg overflow-hidden shrink-0 ${
              isMobile && activeMobileTab !== 'console' ? 'hidden' : 'flex'
            }`}
            style={isMobile ? { height: '100%' } : { height: `calc(${100 - editorHeight}% - 4px)` }}
          >
            <Console
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              isExecuting={isExecuting}
              executionResult={executionResult}
              activeTab={consoleTab}
              onActiveTabChange={setConsoleTab}
              queueStatus={queueStatus}
            />
          </div>
        </div>

      </div>

      {/* 3. Focus infraction Warning Modal Overlay */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-darkCard border border-rose-500/30 p-6 rounded-2xl shadow-2xl text-center space-y-5 animate-scale-in">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-xl font-black text-rose-500 uppercase tracking-wide">PROCTOR WARNING</h2>
              <p className="text-sm font-bold text-slate-100">Screen focus switch detected!</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This test is strictly proctored. Opening new tabs, developer consoles, or switching applications is prohibited. 
              </p>
            </div>
            
            <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl">
              <span className="text-xs font-black uppercase text-rose-400">
                Switches Recorded: {warningCount} / 3 Warnings
              </span>
              <p className="text-[10px] text-rose-300 mt-1 uppercase font-bold tracking-wider">
                Reaching 3 warnings will immediately submit and lock your test!
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-rose-500/15"
            >
              Return to Test
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MockTestArena;
