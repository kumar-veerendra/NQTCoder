import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as questionService from '../services/questionService';
import * as executionService from '../services/executionService';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';
import Console from '../components/Console';
import Timer from '../components/Timer';
import AuthModal from '../components/AuthModal';
import { Play, Send, ChevronLeft, AlertTriangle, ShieldCheck, Sun, Moon, CheckCircle2, Search, Users, Zap, X } from 'lucide-react';
import SEO from '../components/SEO';

const ProblemArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Theme state
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Editor states
  const [language, setLanguage] = useState(localStorage.getItem('nqtcoder_selected_language') || 'cpp');
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('run'); // 'run' | 'submit'
  const [toast, setToast] = useState(null);
  const [isGuestBannerDismissed, setIsGuestBannerDismissed] = useState(
    sessionStorage.getItem('nqt_guest_banner_dismissed') === 'true'
  );

  const handleDismissGuestBanner = () => {
    sessionStorage.setItem('nqt_guest_banner_dismissed', 'true');
    setIsGuestBannerDismissed(true);
  };

  // Console states
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [compilerStatus, setCompilerStatus] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState('input'); // 'input' or 'output'

  // Resizing states
  const [leftWidth, setLeftWidth] = useState(45); // Left width percentage
  const [isResizing, setIsResizing] = useState(false);
  const [editorHeight, setEditorHeight] = useState(60); // Editor height percentage
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const arenaRef = useRef(null);

  // Search states for quick question navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Mobile responsiveness states
  const [activeMobileTab, setActiveMobileTab] = useState('description');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Server load state
  const [serverLoad, setServerLoad] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchFocus = async () => {
    setShowDropdown(true);
    if (allQuestions.length === 0) {
      try {
        const data = await questionService.getQuestions();
        setAllQuestions(data);
      } catch (err) {
        console.error('Failed to load questions for quick search', err);
      }
    }
  };

  const handleSelectQuestion = (q) => {
    if (q._id === id) {
      setShowDropdown(false);
      setSearchQuery('');
      return;
    }
    if (window.confirm(`Do you want to switch to "${q.title}"? Your active coding progress for the current question will be lost.`)) {
      setShowDropdown(false);
      setSearchQuery('');
      navigate(`/problem/${q.slug || q._id}`);
    }
  };

  const filteredQuestions = allQuestions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchCompilerStatus = async () => {
    try {
      const data = await executionService.getCompilersStatus();
      setCompilerStatus(data);
    } catch (err) {
      console.error('Failed to retrieve compiler status:', err);
      setCompilerStatus({ error: true });
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
    fetchCompilerStatus();
  }, [id]);

  // Auto-load code from localStorage when problem (id) or language changes
  useEffect(() => {
    if (!question) return;

    // First check if there is a pending guest session from redirect
    const guestCode = sessionStorage.getItem('guest_code');
    const guestLanguage = sessionStorage.getItem('guest_language');
    const guestProblemId = sessionStorage.getItem('guest_problem_id');

    const clearGuestSession = () => {
      sessionStorage.removeItem('guest_code');
      sessionStorage.removeItem('guest_language');
      sessionStorage.removeItem('guest_problem_id');
      sessionStorage.removeItem('guest_redirect_url');
    };

    if (guestCode || guestLanguage || guestProblemId) {
      const isLangSupported = question.languagesSupported && question.languagesSupported.includes(guestLanguage);
      const isProblemMatch = guestProblemId === id;

      if (guestCode && guestCode.trim() !== '' && isLangSupported && isProblemMatch) {
        setCode(guestCode);
        setLanguage(guestLanguage);
        localStorage.setItem('nqtcoder_selected_language', guestLanguage);
        localStorage.setItem(`nqt_saved_code_${id}_${guestLanguage}`, guestCode);
        
        // Show success toast
        setToast('Welcome back! Your code is ready to continue.');
        const timer = setTimeout(() => setToast(null), 4000);
        
        clearGuestSession();
        return () => clearTimeout(timer);
      } else {
        clearGuestSession();
      }
    }

    // Standard load from localStorage if no guest session redirect
    const savedCode = localStorage.getItem(`nqt_saved_code_${id}_${language}`);
    if (savedCode !== null) {
      setCode(savedCode);
    } else {
      setCode(''); // Triggers template reload in CodeEditor
    }
  }, [id, question, language]);

  // Auto-save code to localStorage as the user types
  useEffect(() => {
    if (!question || code === undefined || code === null) return;
    
    // Don't save if it's empty string (loading state)
    if (code === '') return;

    localStorage.setItem(`nqt_saved_code_${id}_${language}`, code);
  }, [code, id, language, question]);

  // Poll server load every 8 seconds
  useEffect(() => {
    const fetchLoad = async () => {
      try {
        const { data } = await api.get('/api/submissions/load');
        setServerLoad(data);
      } catch {}
    };
    fetchLoad();
    const interval = setInterval(fetchLoad, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuestionDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await questionService.getQuestionById(id);
      setQuestion(data);
      if (data.languagesSupported && data.languagesSupported.length > 0) {
        const savedLang = localStorage.getItem('nqtcoder_selected_language');
        if (savedLang && data.languagesSupported.includes(savedLang)) {
          setLanguage(savedLang);
        } else {
          setLanguage(data.languagesSupported[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve problem details. Please verify backend state.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!user) {
      if (isAuthModalOpen) return;
      sessionStorage.setItem('guest_code', code);
      sessionStorage.setItem('guest_language', language);
      sessionStorage.setItem('guest_problem_id', id);
      sessionStorage.setItem('guest_redirect_url', window.location.pathname);
      setAuthModalMode('run');
      setIsAuthModalOpen(true);
      return;
    }
    if (!code.trim()) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);

    try {
      const result = await executionService.runCode(code, language, question?._id || id, customInput, setQueueStatus);
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
      console.error(err);
      setExecutionResult({
        status: 'Runtime Error',
        isCustom: false,
        error: err.response?.data?.message || err.message || 'Execution request failed.'
      });
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleSubmitCode = async () => {
    if (!user) {
      if (isAuthModalOpen) return;
      sessionStorage.setItem('guest_code', code);
      sessionStorage.setItem('guest_language', language);
      sessionStorage.setItem('guest_problem_id', id);
      sessionStorage.setItem('guest_redirect_url', window.location.pathname);
      setAuthModalMode('submit');
      setIsAuthModalOpen(true);
      return;
    }
    if (!code.trim()) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);

    try {
      const result = await executionService.submitCode(code, language, question?._id || id, setQueueStatus);
      setExecutionResult(result);

      if (result.status === 'Accepted') {
        if (user) {
          refreshUser();
        }
      }
    } catch (err) {
      console.error(err);
      setExecutionResult({
        status: 'Runtime Error',
        isCustom: false,
        error: err.response?.data?.message || err.message || 'Submission request failed.'
      });
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleTimeout = () => {
    setIsLocked(true);
    alert('Time limit expired! Lock active. Your code will be automatically submitted.');
    handleSubmitCode();
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
        const relativeX = e.clientX - arenaRect.left;
        const percentageWidth = (relativeX / arenaRect.width) * 100;
        
        // Impose safety boundaries
        if (percentageWidth > 20 && percentageWidth < 80) {
          setLeftWidth(percentageWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

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
        const relativeY = e.clientY - arenaRect.top;
        const percentageHeight = (relativeY / arenaRect.height) * 100;
        
        // Impose safety boundaries (editor height between 25% and 80%)
        if (percentageHeight > 25 && percentageHeight < 80) {
          setEditorHeight(percentageHeight);
        }
      }
    };

    const handleMouseUpHeight = () => {
      setIsResizingHeight(false);
    };

    if (isResizingHeight) {
      window.addEventListener('mousemove', handleMouseMoveHeight);
      window.addEventListener('mouseup', handleMouseUpHeight);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveHeight);
      window.removeEventListener('mouseup', handleMouseUpHeight);
    };
  }, [isResizingHeight]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('nqtcoder_selected_language', newLang);
  };

  // toggleTheme is consumed from global ThemeContext

  if (loading) {
    return (
      <div className="min-h-screen h-screen flex flex-col items-center justify-center space-y-4 bg-darkBg text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Opening Secure Sandbox...</span>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-darkCard border border-darkBorder rounded-2xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Oops! Problem Arena Load Error</h2>
        <p className="text-sm text-slate-400">{error || 'Requested coding question was not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen max-h-screen flex flex-col bg-darkBg overflow-hidden ${
        isResizing ? 'cursor-col-resize select-none' : isResizingHeight ? 'cursor-row-resize select-none' : ''
      }`}
    >
      <SEO
        title="Problem Arena"
        description="Solve placement coding problems on NQTCoder in C++, Java, or Python. Real-time code execution with test case verification."
        path="/problem"
        noIndex={true}
      />
      
      {/* 1. Exam Control Bar with LeetCode Aesthetic */}
      <div className="px-3 sm:px-6 py-2 bg-darkCard border-b border-darkBorder flex items-center justify-between shrink-0 z-10 gap-2 select-none">
        
        {/* Left Side: Clickable NQTCoder Logo & Searchable Question title dropdown */}
        <div className="flex items-center space-x-2.5 w-auto md:w-1/3 md:min-w-[260px] relative" ref={searchRef}>
          <div
            onClick={() => {
              if (window.confirm('Do you want to leave the exam arena? Your active coding progress will be lost.')) {
                navigate('/');
              }
            }}
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
            title="Go to Dashboard"
          >
            <img src="/logo.svg" alt="NQTCoder Logo" className="h-[30px] w-auto object-contain" />
            <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 group-hover:text-white transition-colors">
              NQTCoder
            </span>
          </div>

          <div className="w-px h-4 bg-darkBorder shrink-0 hidden md:block"></div>

          {/* Quick Search Selector */}
          <div className="relative flex-grow min-w-0 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder={question.title}
                value={searchQuery}
                onFocus={handleSearchFocus}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-darkBg/60 border border-darkBorder hover:border-accentBlue/40 focus:border-accentBlue text-xs font-semibold pl-8 pr-3 py-1.5 rounded-md focus:outline-none transition-colors text-slate-200 placeholder-slate-200 truncate"
              />
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-darkCard border border-darkBorder rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-darkBorder/40">
                {filteredQuestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 italic">
                    No challenges found
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isCurrent = q._id === id;
                    const isSolved = user?.solvedQuestions?.includes(q._id);
                    return (
                      <button
                        key={q._id}
                        onClick={() => handleSelectQuestion(q)}
                        className={`w-full text-left px-3.5 py-2.5 hover:bg-accentBlue/10 transition-colors text-xs font-semibold flex items-center justify-between gap-2 ${
                          isCurrent ? 'text-accentBlue bg-accentBlue/5' : 'text-slate-300 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{q.title}</span>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isSolved && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                              Solved
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* LeetCode Middle: Run & Submit Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 justify-center w-auto md:w-1/3 shrink-0">
          <button
            onClick={handleRunCode}
            disabled={isExecuting || !code.trim()}
            className="bg-darkCard hover:bg-darkBg/60 text-slate-200 border border-darkBorder px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wide flex items-center space-x-1 sm:space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            <span>Run</span>
          </button>
          
          <button
            onClick={handleSubmitCode}
            disabled={isExecuting || !code.trim() || isLocked}
            className="bg-accentBlue hover:bg-accentBlue/90 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wider flex items-center space-x-1 sm:space-x-1.5 transition-colors"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Submit</span>
          </button>
        </div>

        {/* Right Side: Server Load + Timer + Theme Toggle */}
        <div className="flex justify-end w-auto md:w-1/3 items-center space-x-1.5 sm:space-x-3 shrink-0">

          {/* Live Server Load Badge */}
          {(() => {
            if (!serverLoad) return (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-700 bg-darkBg text-[10px] font-black uppercase tracking-wider text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
                <span>0 · Free</span>
              </div>
            );
            const cfg = {
              low:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', label: 'Low Load' },
              medium: { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/25',   label: 'Busy' },
              high:   { dot: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/25',     label: 'Heavy' }
            }[serverLoad.level] || { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', label: 'Low Load' };
            return (
              <div
                title={`${serverLoad.running} compiling, ${serverLoad.waiting} waiting in queue`}
                className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider cursor-default ${cfg.bg} ${cfg.text}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
                <span>{serverLoad.total} · {cfg.label}</span>
              </div>
            );
          })()}

          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-accentBlue hover:bg-accentBlue/10 rounded-md transition-all duration-200 shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <Timer
            durationMinutes={question.timerDuration}
            isEnabled={question.timerEnabled && !isLocked}
            onTimeout={handleTimeout}
          />
        </div>

      </div>

      {/* Guest Mode Banner */}
      {!user && !isGuestBannerDismissed && (
        <div className="bg-[#1e1b4b]/80 border-b border-amber-500/20 text-amber-300 px-4 py-2.5 text-xs flex items-center justify-between gap-4 select-none animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">Guest Mode</span>
            <span>You're exploring NQTCoder. Sign in to run code, submit solutions, and save your progress.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => { if (!isAuthModalOpen) setIsAuthModalOpen(true); }} 
              className="text-accentBlue hover:text-accentBlue/90 font-black uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={handleDismissGuestBanner} 
              className="text-slate-400 hover:text-slate-200 font-bold text-[10px] uppercase transition-colors cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden bg-darkCard border-b border-darkBorder p-1.5 justify-around z-10 shrink-0 select-none">
        <button
          onClick={() => setActiveMobileTab('description')}
          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider text-center rounded-lg transition-all border ${
            activeMobileTab === 'description'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveMobileTab('code')}
          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider text-center rounded-lg transition-all border ${
            activeMobileTab === 'code'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveMobileTab('console')}
          className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider text-center rounded-lg transition-all border ${
            activeMobileTab === 'console'
              ? 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Console
        </button>
      </div>

      {/* 2. Resizable Workspace Layout */}
      <div 
        ref={arenaRef}
        className="flex-grow min-h-0 flex p-1.5 gap-0 relative bg-darkBg"
      >
        
        {/* Left Side: Problem Statement Description */}
        <div 
          className={`h-full bg-darkCard/50 border border-darkBorder/70 rounded-xl p-4 overflow-hidden flex-grow md:flex-grow-0 ${
            isMobile && activeMobileTab !== 'description' ? 'hidden' : 'block'
          }`}
          style={isMobile ? { width: '100%' } : { width: `${leftWidth}%` }}
        >
          <ProblemDescription question={question} />
        </div>

        {/* Divider resizing bar */}
        {!isMobile && (
          <div
            onMouseDown={handleMouseDown}
            className="w-2.5 hover:w-2.5 cursor-col-resize h-full flex items-center justify-center group select-none relative shrink-0 z-20"
          >
            <div className="w-[2px] h-full bg-darkBorder group-hover:bg-accentBlue/60 group-active:bg-accentBlue transition-colors"></div>
            <div className="absolute w-1.5 h-8 bg-darkBorder border border-darkBorder group-hover:bg-accentBlue group-hover:border-accentBlue rounded-full flex flex-col justify-between p-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-[2px] bg-slate-400 rounded"></div>
              <div className="w-full h-[2px] bg-slate-400 rounded"></div>
              <div className="w-full h-[2px] bg-slate-400 rounded"></div>
            </div>
          </div>
        )}

        {/* Right Side: Monaco Editor + Console Outputs Panel */}
        <div 
          className={`h-full flex-col min-h-0 flex-grow md:flex-grow-0 ${
            isMobile && activeMobileTab === 'description' ? 'hidden' : 'flex'
          }`}
          style={isMobile ? { width: '100%' } : { width: `${100 - leftWidth}%` }}
        >
          
          {/* Top Panel: Coding Editor */}
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
              isLocked={isLocked}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              theme={theme}
              compilerStatus={compilerStatus}
            />
          </div>

          {/* Horizontal drag-to-resize divider */}
          {!isMobile && (
            <div
              onMouseDown={handleHeightMouseDown}
              className="h-2 hover:h-2 cursor-row-resize w-full flex items-center justify-center group select-none relative shrink-0 z-20"
            >
              <div className="h-[2px] w-full bg-darkBorder group-hover:bg-accentBlue/60 group-active:bg-accentBlue transition-colors"></div>
              <div className="absolute h-1.5 w-8 bg-darkBorder border border-darkBorder group-hover:bg-accentBlue group-hover:border-accentBlue rounded-full flex justify-between p-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-full w-[2px] bg-slate-400 rounded"></div>
                <div className="h-full w-[2px] bg-slate-400 rounded"></div>
                <div className="h-full w-[2px] bg-slate-400 rounded"></div>
              </div>
            </div>
          )}

          {/* Bottom Panel: Interactive Run/Submit actions & Console Logs */}
          <div 
            className={`min-h-0 w-full flex-col bg-darkCard border border-darkBorder rounded-xl overflow-hidden shrink-0 ${
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed z-[9999] bg-[#0b1329] border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 select-none animate-fadeIn font-sans text-xs font-bold
          top-5 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:translate-x-0 md:bottom-5 md:right-5 shrink-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{toast}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        mode={authModalMode}
      />

    </div>
  );
};

export default ProblemArena;
