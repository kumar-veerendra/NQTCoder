import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as mockTestService from '../services/mockTestService';
import * as executionService from '../services/executionService';
import { ThemeContext } from '../context/ThemeContext';
import CodeEditor, { CODE_TEMPLATES } from '../components/CodeEditor';
import Console from '../components/Console';
import { 
  Play, Send, ArrowLeft, Clock, ShieldCheck, AlertTriangle, 
  ChevronRight, ChevronLeft, HelpCircle, Terminal, CheckCircle2 
} from 'lucide-react';
import SEO from '../components/SEO';

const AptitudeMockArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Question Navigation states
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // maps questionId -> Array of selected option letters

  // Coding states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [fontSize, setFontSize] = useState(14);
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [consoleTab, setConsoleTab] = useState('input');
  const [compilerStatus, setCompilerStatus] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Warnings count
  const [warnings, setWarnings] = useState(0);

  // Verbal specific states
  const [isReadingPhase, setIsReadingPhase] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);
  const readingTimerRef = useRef(null);

  useEffect(() => {
    fetchSessionDetails();
    fetchCompilerStatus();
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    // Save timer logic
    if (timeLeft > 0 && instance?.status === 'in_progress') {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSectionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [timeLeft, instance?.status]);

  // Anti-Cheat Proctoring window blur listener
  useEffect(() => {
    if (!instance || instance.status !== 'in_progress') return;

    const handleBlur = async () => {
      try {
        const res = await mockTestService.recordMockViolation(id);
        setWarnings(res.tabSwitchesCount);
        alert(`⚠️ PROCTOR WARNING: Tab switch detected! (Violation ${res.tabSwitchesCount}/3). Reaching 3 violations auto-submits your mock test.`);
        if (res.tabSwitchesCount >= 3) {
          handleAutoSubmit();
        }
      } catch (err) {
        console.error('Failed to log cheat warning:', err);
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [instance, id]);

  const fetchCompilerStatus = async () => {
    try {
      const data = await executionService.getCompilersStatus();
      setCompilerStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessionDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mockTestService.getMockInstance(id);
      if (data.status === 'completed') {
        navigate(`/mocktest/result/v2/${data._id}`);
        return;
      }

      setInstance(data);
      setWarnings(data.tabSwitchesCount);

      // Prepopulate selected answers
      const answersMap = {};
      data.questions.forEach(q => {
        if (q.submittedAnswer?.length > 0) {
          answersMap[q.questionId] = q.submittedAnswer;
        }
      });
      setSelectedAnswers(answersMap);

      setTimeLeft(data.activeSectionTimeRemainingSec || 0);

    } catch (err) {
      console.error(err);
      setError('Could not locate active mock test instance.');
    } finally {
      setLoading(false);
    }
  };

  const activeQuestionsList = instance ? instance.questions.filter(q => q.sectionIndex === instance.currentSectionIndex) : [];
  const activeQuestion = activeQuestionsList[activeQuestionIndex];
  const isCoding = activeQuestion?.details?.kind === 'CodingQuestion';

  // Load code template on swapping coding question
  useEffect(() => {
    if (activeQuestion && isCoding) {
      setCode(CODE_TEMPLATES[language]);
      setExecutionResult(null);
    }
  }, [activeQuestionIndex, language]);

  // Reading phase timer for Passage Recall
  useEffect(() => {
    setIsReadingPhase(false);
    clearInterval(readingTimerRef.current);

    if (activeQuestion && activeQuestion.details?.kind === 'VerbalQuestion' && activeQuestion.details.verbalType === 'passage_recall') {
      const hasSavedAnswer = selectedAnswers[activeQuestion.questionId]?.[0];
      if (!hasSavedAnswer) {
        setIsReadingPhase(true);
        setReadingTimeLeft(activeQuestion.details.readingDurationSec || 30);
        
        readingTimerRef.current = setInterval(() => {
          setReadingTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(readingTimerRef.current);
              setIsReadingPhase(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => clearInterval(readingTimerRef.current);
  }, [activeQuestion?.questionId]);

  const handleUpdateSentenceCompletion = async (val, blankIdx, blanksCount) => {
    const qId = activeQuestion.questionId;
    const current = [...(selectedAnswers[qId] || [])];
    for (let i = 0; i < blanksCount; i++) {
      if (current[i] === undefined) {
        current[i] = '';
      }
    }
    current[blankIdx] = val;
    
    const newAnswers = { ...selectedAnswers, [qId]: current };
    setSelectedAnswers(newAnswers);

    try {
      await mockTestService.submitMockItem(id, {
        questionId: qId,
        submittedAnswer: current,
        timeSpentSec: 0
      });
    } catch (err) {
      console.error('Failed to auto-save sentence completion blank:', err);
    }
  };

  const handleUpdateVerbalText = async (val) => {
    const qId = activeQuestion.questionId;
    const newAnswers = { ...selectedAnswers, [qId]: [val] };
    setSelectedAnswers(newAnswers);

    try {
      await mockTestService.submitMockItem(id, {
        questionId: qId,
        submittedAnswer: [val],
        timeSpentSec: 0
      });
    } catch (err) {
      console.error('Failed to auto-save verbal response:', err);
    }
  };

  const handleSelectOption = async (optionLetter) => {
    const qId = activeQuestion.questionId;
    const newAnswers = { ...selectedAnswers, [qId]: [optionLetter] };
    setSelectedAnswers(newAnswers);

    try {
      await mockTestService.submitMockItem(id, {
        questionId: qId,
        submittedAnswer: [optionLetter],
        timeSpentSec: 0
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  const handleRunCode = async () => {
    if (!isCoding || isExecuting) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);
    try {
      const result = await executionService.runCode(
        code,
        language,
        activeQuestion.questionId,
        customInput,
        setQueueStatus
      );
      setExecutionResult(result);
    } catch (err) {
      setExecutionResult({
        error: true,
        stderr: err.message || 'Execution failed'
      });
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleSubmitCode = async () => {
    if (!isCoding || isExecuting) return;
    if (!window.confirm('Submit code? This will evaluate against hidden test cases. You can resubmit anytime before the test ends.')) return;
    
    setIsExecuting(true);
    setConsoleTab('output');
    setExecutionResult(null);
    try {
      const result = await executionService.submitCode(
        code,
        language,
        activeQuestion.questionId,
        setQueueStatus
      );
      setExecutionResult(result);
      // Auto-save coding item as attempted
      await mockTestService.submitMockItem(id, {
        questionId: activeQuestion.questionId,
        submittedAnswer: [language],
        timeSpentSec: 0
      });
    } catch (err) {
      setExecutionResult({
        error: true,
        stderr: err.message || 'Submission failed'
      });
    } finally {
      setIsExecuting(false);
      setQueueStatus(null);
    }
  };

  const handleSectionTimeout = async () => {
    try {
      const res = await mockTestService.nextSectionMockInstance(id);
      if (res.completed) {
        navigate(`/mocktest/result/v2/${id}`);
      } else {
        await fetchSessionDetails();
        setActiveQuestionIndex(0);
      }
    } catch (err) {
      console.error(err);
      alert('Error transitioning mock sections. Please refresh.');
    }
  };

  const handleNextSectionClick = async () => {
    if (!window.confirm('Are you sure you want to submit this section? Once submitted, you will automatically transition to the next section and cannot return to modify answers.')) return;
    try {
      setLoading(true);
      const res = await mockTestService.nextSectionMockInstance(id);
      if (res.completed) {
        navigate(`/mocktest/result/v2/${id}`);
      } else {
        await fetchSessionDetails();
        setActiveQuestionIndex(0);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit section.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishTest = async () => {
    if (!window.confirm('Are you sure you want to end your mock test? Any unattempted questions will receive 0 marks.')) return;
    submitFinalSession();
  };

  const handleAutoSubmit = async () => {
    console.log('Time expired or violation limit exceeded. Auto-submitting mock test...');
    submitFinalSession();
  };

  const submitFinalSession = async () => {
    clearInterval(timerRef.current);
    try {
      await mockTestService.finishMockInstance(id);
      navigate(`/mocktest/result/v2/${id}`);
    } catch (err) {
      console.error(err);
      alert('Error finalizing test scoring. Please refresh.');
    }
  };

  const formatTimer = (sec) => {
    const hr = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hr > 0 ? hr + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="py-32 text-center bg-darkBg text-slate-100 min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Opening secure assessment chamber...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center bg-darkBg text-slate-100 min-h-screen space-y-4">
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-5 rounded-xl max-w-md mx-auto">
          {error}
        </div>
        <button 
          onClick={() => navigate('/mocktest')}
          className="text-accentBlue hover:underline text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Mock Test Center
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col">
      <SEO
        title="Proctored Mock Test Arena"
        description="Secure exam simulation console."
        path={`/mocktest/arena/${id}`}
        noIndex={true}
      />

      {/* 1. Header Toolbar */}
      <header className="h-14 border-b border-darkBorder bg-darkCard/60 flex items-center justify-between px-6 z-25 select-none">
        <div className="flex items-center gap-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            {instance.sections?.[instance.currentSectionIndex]?.sectionName || 'Cognitive Section'}
          </span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
            warnings > 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Violations: {warnings}/3</span>
          </div>
        </div>

        {/* Timer countdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white bg-darkBg border border-darkBorder px-4 py-1.5 rounded-xl">
            <Clock className="w-4.5 h-4.5 text-slate-500 animate-pulse" />
            <span>Time Left: {formatTimer(timeLeft)}</span>
          </div>

          {instance.currentSectionIndex < (instance.sections?.length || 1) - 1 ? (
            <button
              onClick={handleNextSectionClick}
              className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors shadow-lg shadow-accentBlue/10"
            >
              Submit Section
            </button>
          ) : (
            <button
              onClick={handleFinishTest}
              className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors shadow-lg shadow-rose-600/10"
            >
              Finish Exam
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Arena Section split */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-r border-darkBorder bg-darkCard/30 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest select-none">
              Questions Map
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {activeQuestionsList.map((q, idx) => {
                const isActive = activeQuestionIndex === idx;
                const isSaved = selectedAnswers[q.questionId]?.length > 0;
                
                let btnClass = 'border-darkBorder bg-darkBg text-slate-400 hover:border-slate-600';
                if (isActive) {
                  btnClass = 'bg-accentBlue border-accentBlue text-white shadow shadow-accentBlue/25';
                } else if (isSaved) {
                  btnClass = 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400';
                }

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-darkBorder/40 pt-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none space-y-2">
            <div className="flex justify-between">
              <span>Section Attempted</span>
              <span className="text-emerald-400">
                {activeQuestionsList.filter(q => selectedAnswers[q.questionId]?.length > 0).length} Qs
              </span>
            </div>
            <div className="flex justify-between">
              <span>Section Remaining</span>
              <span className="text-white">
                {activeQuestionsList.length - activeQuestionsList.filter(q => selectedAnswers[q.questionId]?.length > 0).length} Qs
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Question Workspace */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {activeQuestion ? (
            isCoding ? (
              /* Coding Workspace Split Panels */
              <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {/* Left side description */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-4 border-r border-darkBorder">
                  <span className="text-[9px] bg-accentBlue/10 text-accentBlue px-2 py-0.5 rounded font-black tracking-wider uppercase">
                    Coding Section (10 Marks)
                  </span>
                  <h2 className="text-lg font-black text-white">{activeQuestion.details.title}</h2>
                  <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                    {activeQuestion.details.description}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-darkBorder/30">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input Format</div>
                    <p className="text-slate-300 text-xs">{activeQuestion.details.inputFormat}</p>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output Format</div>
                    <p className="text-slate-300 text-xs">{activeQuestion.details.outputFormat}</p>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Constraints</div>
                    <p className="text-slate-300 text-xs font-mono">{activeQuestion.details.constraints}</p>
                  </div>
                </div>

                {/* Right side editor */}
                <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-darkCard/10">
                  <div className="h-10 border-b border-darkBorder flex items-center justify-between px-4 bg-darkCard/40 shrink-0">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-darkBg border border-darkBorder text-slate-300 text-xs rounded px-2.5 py-1 font-semibold"
                    >
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </select>
                  </div>

                  <div className="flex-grow overflow-hidden relative">
                    <CodeEditor
                      language={language}
                      code={code}
                      onCodeChange={setCode}
                      fontSize={fontSize}
                      theme={theme}
                    />
                  </div>

                  {/* Execution Console output */}
                  <div className="h-64 border-t border-darkBorder bg-darkBg/90 flex flex-col shrink-0">
                    <div className="h-9 border-b border-darkBorder flex items-center justify-between px-4 bg-darkCard/60 select-none">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConsoleTab('input')}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                            consoleTab === 'input' ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Custom Input
                        </button>
                        <button
                          onClick={() => setConsoleTab('output')}
                          className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                            consoleTab === 'output' ? 'text-accentBlue' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Console Output
                        </button>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          disabled={isExecuting}
                          onClick={handleRunCode}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Run Code
                        </button>
                        <button
                          disabled={isExecuting}
                          onClick={handleSubmitCode}
                          className="bg-accentBlue hover:bg-accentBlue/90 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-accentBlue/10"
                        >
                          Submit Code
                        </button>
                      </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                      {consoleTab === 'input' ? (
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Provide custom standard input (stdin) for compiler run..."
                          className="w-full h-full bg-darkCard/40 border border-darkBorder rounded-lg p-3 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:border-slate-500"
                        />
                      ) : (
                        <Console
                          isExecuting={isExecuting}
                          queueStatus={queueStatus}
                          executionResult={executionResult}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeQuestion.details.kind === 'VerbalQuestion' ? (
              /* Verbal Workspace Card Layout */
              <div className="flex-grow p-8 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto animate-fadeIn">
                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black tracking-wider uppercase select-none">
                  Verbal Section ({activeQuestion.details.meta?.marks || 1} Mark{activeQuestion.details.meta?.marks > 1 ? 's' : ''})
                </span>

                {/* 1. Sentence Completion */}
                {activeQuestion.details.verbalType === 'sentence_completion' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold leading-relaxed text-slate-200">
                      Complete the sentence below:
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base text-slate-200 leading-relaxed font-semibold">
                      {activeQuestion.details.content.statement.split(/\{(\d+)\}/g).map((part, idx) => {
                        if (/^\d+$/.test(part)) {
                          const blankIdx = parseInt(part);
                          const blankObj = activeQuestion.details.blanks?.find(b => b.blankIndex === blankIdx);
                          const value = selectedAnswers[activeQuestion.questionId]?.[blankIdx] || '';

                          return (
                            <input
                              key={blankIdx}
                              type="text"
                              value={value}
                              placeholder={blankObj?.placeholder || '___'}
                              onChange={(e) => handleUpdateSentenceCompletion(e.target.value, blankIdx, activeQuestion.details.blanks?.length || 0)}
                              className="px-3 py-1.5 rounded-xl border border-darkBorder bg-darkCard focus:border-accentBlue text-sm font-semibold transition-all focus:outline-none w-32 md:w-44 text-center"
                            />
                          );
                        }
                        return <span key={idx}>{part}</span>;
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Passage Recall */}
                {activeQuestion.details.verbalType === 'passage_recall' && (
                  <div className="space-y-4">
                    {isReadingPhase ? (
                      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Reading Phase</span>
                          <span className="text-xs font-bold text-slate-300">Time Left: {readingTimeLeft}s</span>
                        </div>
                        <p className="text-slate-200 text-base leading-relaxed font-semibold italic select-none">
                          "{activeQuestion.details.passageText}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs font-black uppercase text-slate-400 tracking-wider">Reconstruct the Passage</div>
                        <textarea
                          value={selectedAnswers[activeQuestion.questionId]?.[0] || ''}
                          onChange={(e) => handleUpdateVerbalText(e.target.value)}
                          placeholder="Type the passage as closely as you can recall..."
                          className="w-full h-44 bg-darkCard border border-darkBorder rounded-2xl p-4 text-sm text-slate-200 font-semibold focus:outline-none focus:border-slate-500 resize-none transition-colors"
                        />
                        <div className="text-right text-[10px] text-slate-500 font-bold select-none">
                          Word Count: {(selectedAnswers[activeQuestion.questionId]?.[0] || '').trim().split(/\s+/).filter(Boolean).length}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Email Writing */}
                {activeQuestion.details.verbalType === 'email_writing' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-darkBorder bg-darkCard/30 rounded-2xl p-5 space-y-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Prompt</div>
                        <p className="text-slate-200 text-sm leading-relaxed font-semibold mt-1">
                          {activeQuestion.details.emailPrompt}
                        </p>
                      </div>

                      {activeQuestion.details.guidelines?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-darkBorder/40">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Required Details to Include</div>
                          <ul className="space-y-1.5">
                            {activeQuestion.details.guidelines.map((guide, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                                <span className="w-1.5 h-1.5 bg-accentBlue rounded-full mt-1.5 shrink-0" />
                                <span>{guide}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 border-t border-darkBorder/40 text-[11px] text-slate-500 font-bold">
                        Target Length: {activeQuestion.details.minWords || 50} - {activeQuestion.details.maxWords || 150} words
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase text-slate-400 tracking-wider">Email Compose Window</div>
                      <textarea
                        value={selectedAnswers[activeQuestion.questionId]?.[0] || ''}
                        onChange={(e) => handleUpdateVerbalText(e.target.value)}
                        placeholder="Write your email here..."
                        className="w-full h-64 bg-darkCard border border-darkBorder rounded-2xl p-4 text-sm text-slate-200 font-mono focus:outline-none focus:border-slate-500 resize-none transition-colors"
                      />
                      <div className="text-right text-[10px] text-slate-500 font-bold select-none">
                        Word Count: {(selectedAnswers[activeQuestion.questionId]?.[0] || '').trim().split(/\s+/).filter(Boolean).length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom button controls */}
                <div className="flex justify-between items-center pt-8 border-t border-darkBorder/40 mt-12">
                  <button
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                    className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      activeQuestionIndex === 0 
                        ? 'opacity-30 cursor-not-allowed border-darkBorder text-slate-600' 
                        : 'border-darkBorder bg-darkCard text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    disabled={activeQuestionIndex === activeQuestionsList.length - 1}
                    onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                    className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      activeQuestionIndex === activeQuestionsList.length - 1 
                        ? 'opacity-30 cursor-not-allowed border-darkBorder text-slate-600' 
                        : 'border-darkBorder bg-darkCard text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* MCQ Workspace Card Layout */
              <div className="flex-grow p-8 max-w-3xl mx-auto w-full space-y-6 overflow-y-auto">
                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black tracking-wider uppercase select-none">
                  Aptitude Section (1 Mark)
                </span>
                
                <h3 className="text-base font-semibold leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {activeQuestion.details.content.statement}
                </h3>

                <div className="space-y-3.5 pt-4">
                  {activeQuestion.details.options.map((opt) => {
                    const isSelected = selectedAnswers[activeQuestion.questionId]?.includes(opt.optionId);

                    return (
                      <div
                        key={opt.optionId}
                        onClick={() => handleSelectOption(opt.optionId)}
                        className={`border p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-accentBlue/5 border-accentBlue text-white shadow shadow-accentBlue/5' 
                            : 'bg-darkCard border-darkBorder hover:border-slate-600 text-slate-300'
                        }`}
                      >
                        <span className={`w-7.5 h-7.5 rounded-lg border text-xs font-black flex items-center justify-center shrink-0 uppercase ${
                          isSelected 
                            ? 'bg-accentBlue border-accentBlue text-white' 
                            : 'bg-darkBg border-darkBorder text-slate-500'
                        }`}>
                          {opt.optionId}
                        </span>
                        <span className="text-sm font-semibold">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom button controls */}
                <div className="flex justify-between items-center pt-8 border-t border-darkBorder/40 mt-12">
                  <button
                    disabled={activeQuestionIndex === 0}
                    onClick={() => setActiveQuestionIndex(prev => prev - 1)}
                    className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      activeQuestionIndex === 0 
                        ? 'opacity-30 cursor-not-allowed border-darkBorder text-slate-600' 
                        : 'border-darkBorder bg-darkCard text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    disabled={activeQuestionIndex === activeQuestionsList.length - 1}
                    onClick={() => setActiveQuestionIndex(prev => prev + 1)}
                    className={`px-4.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      activeQuestionIndex === activeQuestionsList.length - 1 
                        ? 'opacity-30 cursor-not-allowed border-darkBorder text-slate-600' 
                        : 'border-darkBorder bg-darkCard text-slate-400 hover:text-white hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-32 text-slate-600 space-y-2 select-none">
              <HelpCircle className="w-12 h-12 mx-auto animate-pulse" />
              <div className="text-xs uppercase font-black">Question space empty.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeMockArena;
