import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import * as practiceService from '../services/practiceService';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { 
  ArrowLeft, CheckCircle2, XCircle, ChevronRight, HelpCircle, 
  Clock, Lightbulb, Compass, Award, Tag, Sparkles, BookOpen,
  Bookmark as BookmarkIcon, Eye, EyeOff
} from 'lucide-react';
import SEO from '../components/SEO';

const AptitudeArena = () => {
  const { user } = useContext(AuthContext);
  const { topicKey } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const section = searchParams.get('section');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Verdict state
  const [verdict, setVerdict] = useState(null); // { isCorrect: bool, correctAnswer: [str], explanation: obj }
  const [showHint, setShowHint] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState(0);

  // Verbal specific states
  const [verbalAnswers, setVerbalAnswers] = useState({});
  const [isReadingPhase, setIsReadingPhase] = useState(false);
  const [readingTimeLeft, setReadingTimeLeft] = useState(0);
  const [showPassageRecall, setShowPassageRecall] = useState(false);
  const readingTimerRef = useRef(null);

  // Timer state
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
    return () => clearInterval(timerRef.current);
  }, [topicKey]);

  useEffect(() => {
    // Reset timer on active question change
    setTimeTaken(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeTaken(prev => prev + 1);
    }, 1000);

    // Reset verbal specific states
    setVerbalAnswers({});
    setIsReadingPhase(false);
    setShowPassageRecall(false);
    clearInterval(readingTimerRef.current);

    // Load active question details (solved status, explanation) — only for logged-in users
    if (activeQuestion && user) {
      loadQuestionDetails(activeQuestion._id);
    }

    return () => clearInterval(readingTimerRef.current);
  }, [activeQuestion?._id]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await practiceService.getPracticeQuestions({ topic: topicKey });
      setQuestions(data);
      if (data.length > 0) {
        setActiveQuestion(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not download topic questions.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionDetails = async (id) => {
    try {
      const data = await practiceService.getPracticeQuestionById(id);
      setIsBookmarked(data.isBookmarked || false);
      setShowHint(false);
      setActiveStepTab(0);

      if (data.lastAttempt) {
        setVerdict({
          isCorrect: data.lastAttempt.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          blanks: data.blanks,
          verbalEvaluation: data.lastAttempt.verbalEvaluation
        });
        if (data.kind === 'VerbalQuestion') {
          if (data.verbalType === 'sentence_completion') {
            const initial = {};
            (data.lastAttempt.submittedAnswer || []).forEach((ans, idx) => {
              initial[idx] = ans;
            });
            setVerbalAnswers(initial);
          } else {
            setVerbalAnswers({ 0: data.lastAttempt.submittedAnswer[0] || '' });
          }
        } else {
          setSelectedOption(data.lastAttempt.submittedAnswer[0] || '');
        }
      } else if (data.isSolved && data.correctAnswer) {
        setVerdict({
          isCorrect: true,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          blanks: data.blanks
        });
        if (data.kind === 'VerbalQuestion') {
          if (data.verbalType === 'sentence_completion') {
            const initial = {};
            (data.correctAnswer || []).forEach((ans, idx) => {
              initial[idx] = ans;
            });
            setVerbalAnswers(initial);
          } else {
            setVerbalAnswers({ 0: data.correctAnswer[0] || '' });
          }
        } else {
          setSelectedOption(data.correctAnswer[0] || '');
        }
      } else {
        setVerdict(null);
        setSelectedOption('');
        if (data.kind === 'VerbalQuestion' && data.verbalType === 'passage_recall') {
          setIsReadingPhase(true);
          setReadingTimeLeft(data.readingDurationSec || 30);
          
          clearInterval(readingTimerRef.current);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await practiceService.toggleBookmark(activeQuestion._id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleSubmit = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const isVerbal = activeQuestion.kind === 'VerbalQuestion';
    
    // Validation
    if (isVerbal) {
      if (activeQuestion.verbalType === 'sentence_completion') {
        const blanksCount = activeQuestion.blanks?.length || 0;
        const allAnswered = Array.from({ length: blanksCount }).every((_, i) => (verbalAnswers[i] || '').trim().length > 0);
        if (!allAnswered) {
          alert('Please fill in all blanks before submitting.');
          return;
        }
      } else {
        if (!(verbalAnswers[0] || '').trim()) {
          alert('Please enter your response before submitting.');
          return;
        }
      }
    } else {
      if (!selectedOption) return;
    }

    setSubmitting(true);
    clearInterval(timerRef.current);

    // Prepare submittedAnswer array
    const submitted = isVerbal
      ? (activeQuestion.verbalType === 'sentence_completion'
          ? Array.from({ length: activeQuestion.blanks?.length || 0 }).map((_, i) => verbalAnswers[i] || '')
          : [verbalAnswers[0] || ''])
      : [selectedOption];

    try {
      const res = await practiceService.submitPracticeAnswer(activeQuestion._id, {
        submittedAnswer: submitted,
        timeTakenSec: timeTaken,
        sessionId: sessionId
      });
      setVerdict(res);
      
      // Update local question status in list to show it as solved or attempted
      setQuestions(prev => 
        prev.map(q => q._id === activeQuestion._id ? { 
          ...q, 
          isSolved: res.isCorrect,
          isAttempted: !res.isCorrect
        } : q)
      );
    } catch (err) {
      console.error(err);
      alert('Answer submission failed.');
      // Restart timer on failure
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    const currentIndex = questions.findIndex(q => q._id === activeQuestion._id);
    if (currentIndex < questions.length - 1) {
      setActiveQuestion(questions[currentIndex + 1]);
    }
  };

  const handleSelectQuestion = (q) => {
    setActiveQuestion(q);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="py-32 text-center bg-darkBg text-slate-100 min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Assembling interactive arena...</span>
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
          onClick={() => navigate(section ? `/aptitude?section=${section}` : '/aptitude')}
          className="text-accentBlue hover:underline text-sm font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const isSolved = verdict !== null;
  const isCorrectSubmit = verdict?.isCorrect;
  const correctAnsLetter = verdict?.correctAnswer?.[0];

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col md:flex-row">
      <SEO
        title={`${activeQuestion ? activeQuestion.displayName : 'Practice'} — Aptitude Arena`}
        description="Solve placement cognitive and reasoning questions with instant verdicts and explanation steps."
        path={`/aptitude/arena/${topicKey}`}
      />

      {/* Auth Modal for guests */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="aptitude"
      />

      {/* Left Panel: Sidebar Question Selector */}
      <div className="w-full md:w-80 border-r border-darkBorder bg-darkCard/50 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Back Navigation Link */}
          <button 
            onClick={() => navigate(section ? `/aptitude?section=${section}` : '/aptitude')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back to Practice
          </button>

          <div className="space-y-2">
            <h2 className="text-base font-extrabold text-white tracking-wide">
              {activeQuestion ? activeQuestion.displayName : 'Questions'}
            </h2>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              Topic Practice Set
            </p>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-3 pt-2 select-none">
            {questions.map((q, idx) => {
              const isActive = activeQuestion?._id === q._id;
              let btnClass = 'border-darkBorder bg-darkBg text-slate-400 hover:border-slate-500 hover:text-white';
              
              if (isActive) {
                btnClass = 'bg-accentBlue border-accentBlue text-white shadow-lg shadow-accentBlue/25';
              } else if (q.isSolved) {
                btnClass = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20';
              } else if (q.isAttempted) {
                btnClass = 'bg-rose-500/10 border-rose-500/35 text-rose-400 hover:bg-rose-500/20';
              }

              return (
                <button
                  key={q._id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info Section */}
        <div className="mt-8 border-t border-darkBorder/40 pt-4 space-y-4 select-none text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center justify-between">
            <span>Total Questions</span>
            <span className="text-white font-extrabold">{questions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Solved Questions</span>
            <span className="text-emerald-400 font-extrabold">
              {questions.filter(q => q.isSolved).length}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Interactive Solving Section */}
      <div className="flex-grow p-6 md:p-8 flex flex-col justify-between max-w-4xl mx-auto w-full">
        {activeQuestion ? (
          <div className="space-y-6">
            {/* Header: Difficulty & Companies */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-darkBorder/40 pb-4 select-none">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                  activeQuestion.difficulty === 'easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : activeQuestion.difficulty === 'medium'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {activeQuestion.difficulty}
                </span>

                {activeQuestion.applicableCompanies?.length > 0 && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    {activeQuestion.applicableCompanies.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                    isBookmarked 
                      ? 'bg-amber-500/10 border-amber-500/35 text-amber-500 hover:bg-amber-500/20' 
                      : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                >
                  <BookmarkIcon className={`w-4.5 h-4.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Timer Tracker */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold bg-darkCard/60 border border-darkBorder px-3 py-1.5 rounded-xl select-none">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>{formatTime(timeTaken)}</span>
                </div>
              </div>
            </div>

            {/* Question Workspace Layout: MCQ vs. Verbal */}
            {activeQuestion.kind === 'VerbalQuestion' ? (
              <div className="space-y-6">
                {/* 1. Sentence Completion (FIB) */}
                {activeQuestion.verbalType === 'sentence_completion' && (
                  <div className="space-y-4 pt-2">
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest">Complete the sentence below:</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base text-slate-200 leading-relaxed font-semibold">
                      {activeQuestion.content.statement.split(/\{(\d+)\}/g).map((part, idx) => {
                        if (/^\d+$/.test(part)) {
                          const blankIdx = parseInt(part);
                          const blankObj = activeQuestion.blanks?.find(b => b.blankIndex === blankIdx);
                          const value = verbalAnswers[blankIdx] || '';
                          const isSolved = !!verdict;
                          
                          // Check if student's answer for this blank matches any acceptable answers
                          const blankInVerdict = verdict?.blanks?.find(b => b.blankIndex === blankIdx);
                          const isThisBlankCorrect = isSolved && blankInVerdict?.acceptableAnswers?.some(
                            acc => acc.trim().toLowerCase() === value.trim().toLowerCase()
                          );

                          let borderClass = 'border-darkBorder bg-darkCard focus:border-accentBlue';
                          if (isSolved) {
                            borderClass = isThisBlankCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold pointer-events-none'
                              : 'border-red-500 bg-red-500/10 text-red-400 font-bold pointer-events-none';
                          }

                          const correctAns = blankInVerdict?.acceptableAnswers?.[0];

                          return (
                            <span key={blankIdx} className="inline-flex flex-col items-center gap-1 align-middle">
                              <input
                                type="text"
                                disabled={isSolved}
                                value={value}
                                placeholder={blankObj?.placeholder || '___'}
                                onChange={(e) => {
                                  setVerbalAnswers(prev => ({
                                    ...prev,
                                    [blankIdx]: e.target.value
                                  }));
                                }}
                                className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none w-32 md:w-44 text-center ${borderClass}`}
                              />
                              {isSolved && !isThisBlankCorrect && correctAns && (
                                <span className="text-[10px] text-emerald-400 font-bold select-none bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                                  Correct: {correctAns}
                                </span>
                              )}
                            </span>
                          );
                        }
                        return <span key={idx} className="align-middle">{part}</span>;
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Passage Recall */}
                {activeQuestion.verbalType === 'passage_recall' && (
                  <div className="space-y-4">
                    {isReadingPhase ? (
                      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Reading Phase</span>
                          <span className="text-xs font-bold text-slate-300">Time Left: {readingTimeLeft}s</span>
                        </div>
                        <p className="text-slate-200 text-base leading-relaxed font-semibold italic select-none">
                          "{activeQuestion.passageText}"
                        </p>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => {
                              clearInterval(readingTimerRef.current);
                              setIsReadingPhase(false);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-darkBg px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            I'm Ready to Write
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-darkBorder/40 pb-2">
                          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Reconstruct the Passage</span>
                          {!verdict && (
                            <button
                              onClick={() => setShowPassageRecall(!showPassageRecall)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase font-bold"
                            >
                              {showPassageRecall ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              <span>{showPassageRecall ? 'Hide Passage' : 'Peek Passage'}</span>
                            </button>
                          )}
                        </div>

                        {showPassageRecall && !verdict && (
                          <div className="border border-darkBorder bg-darkCard/20 p-4 rounded-xl text-slate-400 text-sm italic leading-relaxed animate-fadeIn">
                            "{activeQuestion.passageText}"
                          </div>
                        )}

                        <textarea
                          disabled={!!verdict}
                          value={verbalAnswers[0] || ''}
                          onChange={(e) => setVerbalAnswers({ 0: e.target.value })}
                          placeholder="Type the passage as closely as you can recall..."
                          className="w-full h-44 bg-darkCard border border-darkBorder rounded-2xl p-4 text-sm text-slate-200 font-semibold focus:outline-none focus:border-slate-500 resize-none transition-colors"
                        />
                        <div className="text-right text-[10px] text-slate-500 font-bold select-none">
                          Word Count: {(verbalAnswers[0] || '').trim().split(/\s+/).filter(Boolean).length}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Email Writing */}
                {activeQuestion.verbalType === 'email_writing' && (
                  <div className="flex flex-col gap-5 pt-2">

                    {/* ── Question Prompt Card (full width, top) ── */}
                    <div className="border border-darkBorder bg-darkCard/40 rounded-2xl p-5 space-y-4">
                      {/* Scenario */}
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">📋 Email Scenario</div>
                        <p className="text-slate-100 text-[15px] leading-relaxed font-semibold">
                          {activeQuestion.emailPrompt}
                        </p>
                      </div>

                      {/* Guidelines + Word target in one row */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-darkBorder/40">
                        {activeQuestion.guidelines?.length > 0 && (
                          <div className="flex-1 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">✅ Cover These Points</div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                              {activeQuestion.guidelines.map((guide, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                                  <span>{guide}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-col justify-center items-start sm:items-end gap-1 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Length</div>
                          <div className="text-sm font-bold text-violet-400">
                            {activeQuestion.minWords || 50} – {activeQuestion.maxWords || 150} words
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Full-width Compose Area (bottom) ── */}
                    <div className="flex flex-col gap-3">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">✉️</span>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Compose Your Email</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          (() => {
                            const wc = (verbalAnswers[0] || '').trim().split(/\s+/).filter(Boolean).length;
                            if (wc === 0) return 'text-violet-900 bg-violet-950/40';
                            if (wc < (activeQuestion.minWords || 50)) return 'text-violet-400 bg-violet-500/15';
                            if (wc > (activeQuestion.maxWords || 150)) return 'text-violet-300 bg-violet-400/25';
                            return 'text-violet-200 bg-violet-500/30';
                          })()
                        }`}>
                          {(verbalAnswers[0] || '').trim().split(/\s+/).filter(Boolean).length} / {activeQuestion.maxWords || 150} words
                        </span>
                      </div>

                      {/* Compose box */}
                      <textarea
                        disabled={!!verdict}
                        value={verbalAnswers[0] || ''}
                        onChange={(e) => setVerbalAnswers({ 0: e.target.value })}
                        placeholder={`Start writing your email here...\n\nSubject: [Your Subject]\n\nDear [Name],\n\n[Body]\n\nRegards,\n[Your Name]`}
                        className="w-full bg-darkCard border border-darkBorder rounded-2xl p-5 text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-slate-500 resize-none transition-colors"
                        style={{ minHeight: '340px' }}
                      />

                      {/* Word count bar */}
                      {(() => {
                        const wc = (verbalAnswers[0] || '').trim().split(/\s+/).filter(Boolean).length;
                        const min = activeQuestion.minWords || 50;
                        const max = activeQuestion.maxWords || 150;
                        const pct = Math.min((wc / max) * 100, 100);
                        const barColor = wc === 0 ? 'bg-violet-950' : wc < min ? 'bg-violet-700' : wc > max ? 'bg-violet-400' : 'bg-violet-500';
                        return (
                          <div className="space-y-1">
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-600 font-semibold select-none">
                              <span>0</span>
                              <span className="text-slate-500">min: {min}</span>
                              <span>max: {max}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* MCQ Question Statement */}
                <div className="space-y-4">
                  <div className="text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {activeQuestion.content.statement}
                  </div>
                </div>

                {/* MCQ Options Selector Cards */}
                <div className="space-y-3 pt-4">
                  {activeQuestion.options?.map((opt) => {
                    const isSelected = selectedOption === opt.optionId;
                    const isCorrectOpt = verdict?.isCorrect && opt.optionId === verdict.correctAnswer?.[0];
                    const isWrongSelect = verdict && isSelected && !verdict.isCorrect;

                    let cardClass = 'border-darkBorder bg-darkCard hover:border-slate-600 cursor-pointer';
                    let iconEl = null;

                    if (verdict) {
                      if (isCorrectOpt) {
                        cardClass = 'border-emerald-500 bg-emerald-500/5 text-emerald-300';
                        iconEl = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
                      } else if (isWrongSelect) {
                        cardClass = 'border-red-500 bg-red-500/5 text-red-300';
                        iconEl = <XCircle className="w-5 h-5 text-red-400 shrink-0" />;
                      } else {
                        cardClass = 'border-darkBorder/40 bg-darkCard/40 opacity-60 pointer-events-none';
                      }
                    } else if (isSelected) {
                      cardClass = 'border-accentBlue bg-accentBlue/5 text-white';
                    }

                    return (
                      <div
                        key={opt.optionId}
                        onClick={() => {
                          if (!user) { setIsAuthModalOpen(true); return; }
                          if (!verdict) setSelectedOption(opt.optionId);
                        }}
                        className={`border p-4 rounded-xl flex items-center justify-between gap-4 transition-all ${cardClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg border text-xs font-black flex items-center justify-center shrink-0 uppercase select-none ${
                            verdict && isCorrectOpt
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : verdict && isWrongSelect
                              ? 'bg-red-500 border-red-500 text-white'
                              : isSelected
                              ? 'bg-accentBlue border-accentBlue text-white'
                              : 'bg-darkBg border-darkBorder text-slate-400'
                          }`}>
                            {opt.optionId}
                          </span>
                          <span className="text-sm font-semibold">{opt.text}</span>
                        </div>
                        {iconEl}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-darkBorder/40 mt-8">
              {/* Show Hint Toggle */}
              {activeQuestion.explanation?.hints?.length > 0 && !verdict && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase select-none tracking-wider cursor-pointer"
                >
                  <Lightbulb className={`w-4 h-4 ${showHint ? 'text-amber-400 fill-amber-400/25 animate-pulse' : 'text-slate-500'}`} />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              )}
              {!activeQuestion.explanation?.hints?.length && <div />}

              <div className="flex gap-3">
                {verdict ? (
                  // Display Next button if it exists
                  questions.findIndex(q => q._id === activeQuestion._id) < questions.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="bg-accentBlue hover:bg-accentBlue/90 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-accentBlue/10"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  // Submit Button
                  <button
                    disabled={
                      submitting ||
                      isReadingPhase ||
                      (activeQuestion.kind !== 'VerbalQuestion' && !selectedOption) ||
                      (activeQuestion.kind === 'VerbalQuestion' && activeQuestion.verbalType === 'sentence_completion' && 
                        !Array.from({ length: activeQuestion.blanks?.length || 0 }).every((_, i) => (verbalAnswers[i] || '').trim().length > 0)
                      ) ||
                      (activeQuestion.kind === 'VerbalQuestion' && (activeQuestion.verbalType === 'passage_recall' || activeQuestion.verbalType === 'email_writing') && 
                        !(verbalAnswers[0] || '').trim()
                      )
                    }
                    onClick={handleSubmit}
                    className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      submitting ||
                      isReadingPhase ||
                      (activeQuestion.kind !== 'VerbalQuestion' && !selectedOption) ||
                      (activeQuestion.kind === 'VerbalQuestion' && activeQuestion.verbalType === 'sentence_completion' && 
                        !Array.from({ length: activeQuestion.blanks?.length || 0 }).every((_, i) => (verbalAnswers[i] || '').trim().length > 0)
                      ) ||
                      (activeQuestion.kind === 'VerbalQuestion' && (activeQuestion.verbalType === 'passage_recall' || activeQuestion.verbalType === 'email_writing') && 
                        !(verbalAnswers[0] || '').trim()
                      )
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-accentBlue hover:bg-accentBlue/90 text-white shadow-lg shadow-accentBlue/10'
                    }`}
                  >
                    {submitting ? 'Verifying...' : 'Submit Answer'}
                  </button>
                )}
              </div>
            </div>

            {/* Hint Box Reveal */}
            {showHint && activeQuestion.explanation?.hints?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/25 p-4 rounded-xl space-y-2 mt-4 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider select-none">
                  <Lightbulb className="w-4 h-4" /> Hint Level {activeQuestion.explanation.hints[0].level}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {activeQuestion.explanation.hints[0].text}
                </p>
              </div>
            )}

            {/* Verdict explanation box (MCQ and Sentence Completion) */}
            {isSolved && verdict && !verdict.verbalEvaluation && (verdict.explanation || activeQuestion.kind === 'VerbalQuestion') && (
              <div className="border border-darkBorder bg-darkCard/40 rounded-2xl p-6 mt-6 space-y-6 animate-fadeIn">
                {/* Result header */}
                <div className="flex items-center gap-2.5 border-b border-darkBorder/40 pb-4 select-none">
                  {isCorrectSubmit ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/5 animate-pulse" />
                      <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400 fill-red-400/5 animate-pulse" />
                      <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Incorrect Choice</span>
                    </>
                  )}
                </div>

                {/* Explanation Summary */}
                {verdict.explanation?.summary && (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-slate-600" /> Explanation Summary
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {verdict.explanation.summary}
                    </p>
                  </div>
                )}

                {/* Step-by-Step explanation Tab select cards */}
                {verdict.explanation?.steps?.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-slate-600" /> Detailed Solving Steps
                    </div>

                    {/* Step Tabs Row */}
                    <div className="flex flex-wrap gap-2 select-none">
                      {verdict.explanation.steps.map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveStepTab(idx)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            activeStepTab === idx
                              ? 'bg-accentBlue/10 border-accentBlue text-accentBlue'
                              : 'bg-darkCard/60 border-darkBorder text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {step.title || `Step ${idx + 1}`}
                        </button>
                      ))}
                    </div>

                    {/* Active Step Content */}
                    <div className="bg-darkBg/60 border border-darkBorder/60 p-5 rounded-xl text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                      {verdict.explanation.steps[activeStepTab]?.content}
                    </div>
                  </div>
                )}

                {/* Shortcut & Formulas */}
                {verdict.explanation?.shortcut && (
                  <div className="bg-accentBlue/5 border border-accentBlue/20 p-4 rounded-xl space-y-1.5">
                    <div className="text-[10px] text-accentBlue font-bold uppercase tracking-wider select-none">
                      ⚡ Shortcut Method
                    </div>
                    <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                      {verdict.explanation.shortcut}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Verdict explanation box (Verbal AI Graded: Passage Recall / Email) */}
            {isSolved && verdict && verdict.verbalEvaluation && (
              <div className="border border-darkBorder bg-darkCard/40 rounded-2xl p-6 mt-6 space-y-6 animate-fadeIn">
                {/* Result header */}
                <div className="flex items-center gap-2.5 border-b border-darkBorder/40 pb-4 select-none">
                  {isCorrectSubmit ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/5 animate-pulse" />
                      <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Pass (AI Evaluation Score &ge; 60)</span>
                    </>
                  ) : (
                    <>
                      {verdict.verbalEvaluation.status === 'completed' ? (
                        <>
                          <XCircle className="w-6 h-6 text-red-400 fill-red-400/5 animate-pulse" />
                          <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Unsatisfactory (AI Evaluation Score &lt; 60)</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-6 h-6 text-amber-400 fill-amber-400/5 animate-pulse" />
                          <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">AI Evaluation Unavailable</span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Quota Exceeded / Failed Alert */}
                {(verdict.verbalEvaluation.status === 'quota_exceeded' || verdict.verbalEvaluation.status === 'failed') && (
                  <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-2xl text-slate-300 space-y-2">
                    <p className="text-amber-400 text-xs font-black uppercase tracking-wider">
                      {verdict.verbalEvaluation.status === 'quota_exceeded' ? 'Daily AI Quota Reached' : 'AI Service Offline'}
                    </p>
                    <p className="text-sm leading-relaxed font-medium">
                      Your response has been saved successfully. AI evaluation is unavailable today due to the daily free quota limit. You can resubmit tomorrow or wait until the service is available again.
                    </p>
                  </div>
                )}

                {/* AI Evaluation Metrics (Status completed) */}
                {verdict.verbalEvaluation.status === 'completed' && (
                  <div className="space-y-6">
                    {/* Score Summary Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-darkBg/60 border border-darkBorder/60 p-4 rounded-xl text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Overall Score</div>
                        <div className="text-2xl font-black text-white mt-1">{verdict.verbalEvaluation.score}</div>
                      </div>
                      <div className="bg-darkBg/60 border border-darkBorder/60 p-4 rounded-xl text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Grammar Score</div>
                        <div className="text-2xl font-black text-emerald-400 mt-1">{verdict.verbalEvaluation.grammarScore}</div>
                      </div>
                      <div className="bg-darkBg/60 border border-darkBorder/60 p-4 rounded-xl text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Vocabulary</div>
                        <div className="text-2xl font-black text-accentBlue mt-1">{verdict.verbalEvaluation.vocabularyScore}</div>
                      </div>
                      <div className="bg-darkBg/60 border border-darkBorder/60 p-4 rounded-xl text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Relevance</div>
                        <div className="text-2xl font-black text-purple-400 mt-1">{verdict.verbalEvaluation.contentRelevanceScore}</div>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5 select-none">
                        <Sparkles className="w-4 h-4 text-accentBlue" /> Evaluator Feedback
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {verdict.verbalEvaluation.feedback}
                      </p>
                    </div>

                    {/* Guidelines fulfilled (Only for Email Writing) */}
                    {activeQuestion.verbalType === 'email_writing' && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs text-slate-500 uppercase font-black tracking-widest">Guidelines Checklist</div>
                        <div className="space-y-2">
                          {verdict.verbalEvaluation.keyPointsMatched?.map((point, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                              <span>{point}</span>
                            </div>
                          ))}
                          {verdict.verbalEvaluation.keyPointsMissed?.map((point, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-400 font-medium opacity-70">
                              <span className="w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-[10px] shrink-0">✗</span>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grammar and Spelling Errors corrections */}
                    {verdict.verbalEvaluation.grammarErrors?.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs text-slate-500 uppercase font-black tracking-widest">Grammar & Spelling Corrections</div>
                        <div className="border border-darkBorder rounded-2xl overflow-hidden divide-y divide-darkBorder/40">
                          {verdict.verbalEvaluation.grammarErrors.map((err, i) => (
                            <div key={i} className="p-4 bg-darkCard/20 space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="line-through bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">
                                  {err.originalText}
                                </span>
                                <span className="text-slate-400 text-xs font-bold">&rarr;</span>
                                <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold">
                                  {err.suggestedFix}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs font-semibold">
                                {err.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Suggested Response */}
                    {verdict.verbalEvaluation.modelSuggestedAnswer && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs text-slate-500 uppercase font-black tracking-widest">AI Suggested Model Response</div>
                        <div className="bg-darkBg border border-darkBorder p-5 rounded-2xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                          {verdict.verbalEvaluation.modelSuggestedAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-2xl text-slate-500 space-y-3">
            <HelpCircle className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest">Select a question to start solving.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeArena;
