import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import * as practiceService from '../services/practiceService';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { 
  ArrowLeft, CheckCircle2, XCircle, ChevronRight, HelpCircle, 
  Clock, Lightbulb, Compass, Award, Tag, Sparkles, BookOpen,
  Bookmark as BookmarkIcon, Eye, EyeOff, Play, X
} from 'lucide-react';
import SEO from '../components/SEO';
import { aiClient } from '../services/aiClient';
import EvaluationFeedback from '../components/email-writing/EvaluationFeedback';
import { Link } from 'react-router-dom';

class FeedbackErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("EvaluationFeedback render error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 text-center space-y-4">
          <p className="text-rose-400 text-xs font-bold">Evaluation feedback container caught an error.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="bg-accentBlue text-white text-xs px-4 py-2 rounded-xl font-bold uppercase cursor-pointer"
          >
            Practice Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const FILL_BLANK_SKILLS_UI = [
  { key: 'all', label: 'All', full: 'All Topics' },
  { key: 'subject-verb-agreement', label: 'SVA', full: 'Subject-Verb Agreement' },
  { key: 'tenses', label: 'Tenses', full: 'Tenses' },
  { key: 'articles', label: 'Articles', full: 'Articles' },
  { key: 'prepositions', label: 'Prepositions', full: 'Prepositions' },
  { key: 'pronouns', label: 'Pronouns', full: 'Pronouns' },
  { key: 'adjectives-adverbs', label: 'Adj & Adv', full: 'Adjectives & Adverbs' },
  { key: 'conjunctions', label: 'Conjunctions', full: 'Conjunctions' },
  { key: 'modals', label: 'Modals', full: 'Modals' },
  { key: 'voice', label: 'Voice', full: 'Voice' },
  { key: 'vocabulary', label: 'Vocabulary', full: 'Vocabulary' }
];

const AptitudeArena = () => {
  const { user } = useContext(AuthContext);
  const { topicKey } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const section = searchParams.get('section');
  const navigate = useNavigate();

  const targetSection = section || (['email-writing', 'passage-recall'].includes(topicKey) ? 'verbal' : 'quant');

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

  // ✨ AI Coaching & Inline Key States
  const [aiCoachingEnabled, setAiCoachingEnabled] = useState(false);
  const [showAICoachingModal, setShowAICoachingModal] = useState(false);
  const [showInlineKeyForm, setShowInlineKeyForm] = useState(false);
  const [inlineKeyVal, setInlineKeyVal] = useState('');
  const [inlineKeyName, setInlineKeyName] = useState('My Personal Key');
  const [inlineModel, setInlineModel] = useState('gemini-2.5-flash');
  const [inlineSaving, setInlineSaving] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [questionBankTab, setQuestionBankTab] = useState('official'); // 'official' | 'personal'
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [topicFilter, setTopicFilter] = useState('ALL');

  // Draft Recovery & Quota states
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [recoveredDraftText, setRecoveredDraftText] = useState('');
  const [quotaRemaining, setQuotaRemaining] = useState(10);
  const [showSharedQuotaModal, setShowSharedQuotaModal] = useState(false);
  const [showPersonalQuotaModal, setShowPersonalQuotaModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const lastSavedRef = useRef('');

  // AI Generator States
  const [showGenModal, setShowGenModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [genDifficulty, setGenDifficulty] = useState('medium');
  const [genCommType, setGenCommType] = useState('Internal');
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPracticeList, setShowPracticeList] = useState(true);
  const [showAIList, setShowAIList] = useState(true);

  // Timer state
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setSelectedSkill('all');
    fetchQuestions('all');
    return () => clearInterval(timerRef.current);
  }, [topicKey]);

  const mode = searchParams.get('mode') || 'practice';
  const isMockMode = mode === 'mock';
  const [timeLeft, setTimeLeft] = useState(540);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    // Reset verbal specific states
    setVerbalAnswers({});
    const isPassage = activeQuestion?.verbalType === 'passage_recall';
    setIsReadingPhase(isPassage);
    setShowPassageRecall(false);
    clearInterval(readingTimerRef.current);

    if (isPassage) {
      setReadingTimeLeft(activeQuestion.readingDurationSec || 30);
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
    setShowDraftModal(false);
    setRecoveredDraftText('');
    lastSavedRef.current = '';
    setLastSavedTime(null);

    // Initialize Timer (Mock countdown vs Practice countup)
    clearInterval(timerRef.current);
    if (isMockMode) {
      const duration = activeQuestion?.writingDurationSecEmail || 540;
      setTimeLeft(duration);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(); // Auto-submit when time hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeTaken(0);
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
    }

    // Load active question details (solved status, explanation) — only for logged-in users
    if (activeQuestion && user) {
      loadQuestionDetails(activeQuestion._id);

      // 1. Check for draft recovery
      if (activeQuestion.verbalType === 'email_writing') {
        practiceService.getQuestionDraft(activeQuestion._id).then(draft => {
          if (draft && draft.content && draft.content.trim()) {
            setRecoveredDraftText(draft.content);
            setShowDraftModal(true);
          }
        }).catch(err => console.error('Failed to load draft:', err));
        
        // 2. Fetch daily quota
        practiceService.getPracticeQuota().then(quota => {
          setQuotaRemaining(quota.remaining);
        }).catch(err => console.error('Failed to load quota:', err));
      }
    }

    return () => {
      clearInterval(readingTimerRef.current);
      clearInterval(timerRef.current);
    };
  }, [activeQuestion?._id, isMockMode]);

  // Debounced auto-save effect
  useEffect(() => {
    if (activeQuestion && activeQuestion.verbalType === 'email_writing' && user && !verdict) {
      const currentText = verbalAnswers[0] || '';
      if (currentText.trim() === '' || currentText === lastSavedRef.current) return;

      const delayDebounce = setTimeout(() => {
        practiceService.saveQuestionDraft(activeQuestion._id, {
          content: currentText,
          timeRemainingSec: isMockMode ? timeLeft : timeTaken,
          mode: isMockMode ? 'mock' : 'practice'
        }).then(() => {
          lastSavedRef.current = currentText;
          setLastSavedTime(new Date().toLocaleTimeString());
        }).catch(err => console.error('Auto-save failed:', err));
      }, 3000);

      return () => clearTimeout(delayDebounce);
    }
  }, [verbalAnswers[0], activeQuestion?._id, timeLeft, timeTaken, isMockMode, verdict]);

  const [selectedSkill, setSelectedSkill] = useState('all');

  const fetchQuestions = async (skillOverride) => {
    setLoading(true);
    setError('');
    const targetSkill = skillOverride !== undefined ? skillOverride : selectedSkill;
    try {
      const filters = { topic: topicKey };
      if (targetSkill && targetSkill !== 'all') {
        filters.skill = targetSkill;
      }
      const data = await practiceService.getPracticeQuestions(filters);
      setQuestions(data);
      if (data.length > 0) {
        setActiveQuestion(data[0]);
      } else {
        setActiveQuestion(null);
      }
    } catch (err) {
      console.error(err);
      setError('Could not download topic questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (newSkill) => {
    if (newSkill === selectedSkill) return;
    setSelectedSkill(newSkill);
    setVerbalAnswers({});
    setVerdict(null);
    setTimeTaken(0);
    fetchQuestions(newSkill);
  };

  const handleGenerateAIQuestion = async () => {
    setIsGenerating(true);
    try {
      const activeKey = aiClient.getActiveKey('gemini')?.value || null;
      const question = await practiceService.generateAIQuestion({
        difficulty: genDifficulty,
        communicationType: genCommType,
        apiKey: activeKey,
        provider: 'gemini',
        topic: topicKey
      });

      // Start new practice session
      await practiceService.startPracticeSession({
        section: section || 'verbal',
        topic: topicKey,
        mode: 'practice'
      });

      // Refetch questions list
      const data = await practiceService.getPracticeQuestions({ topic: topicKey });
      setQuestions(data);

      // Find the generated question
      const newQ = data.find(q => q._id === question._id || q.slug === question.slug);
      if (newQ) {
        setVerbalAnswers({});
        setVerdict(null);
        setTimeTaken(0);
        setActiveQuestion(newQ);
        triggerToast('AI Scenario Generated!');
      }
      setShowGenModal(false);
      
      if (!activeKey) {
        practiceService.getPracticeQuota().then(quota => {
          setQuotaRemaining(quota.remaining);
        }).catch(err => console.error('Failed to reload quota:', err));
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert('Daily shared quota limit reached. Please connect a personal API key.');
      } else {
        alert(err.response?.data?.message || 'Failed to generate scenario. Please check connection and keys.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomScenarioSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!customText.trim()) return;
    setIsGenerating(true);
    try {
      const activeKey = aiClient.getActiveKey('gemini')?.value || null;
      const question = await practiceService.generateCustomScenario({
        userScenario: customText.trim(),
        apiKey: activeKey,
        provider: 'gemini',
        topic: topicKey
      });

      // Start new practice session
      await practiceService.startPracticeSession({
        section: section || 'verbal',
        topic: topicKey || 'email-writing',
        mode: 'practice'
      });

      // Refetch questions list
      const data = await practiceService.getPracticeQuestions({ topic: topicKey });
      setQuestions(data);

      const newQ = data.find(q => q._id === question._id || q.slug === question.slug);
      if (newQ) {
        setVerbalAnswers({});
        setVerdict(null);
        setTimeTaken(0);
        setActiveQuestion(newQ);
        triggerToast('Custom Scenario Converted!');
      }
      setCustomText('');
      setShowConvertModal(false);

      if (!activeKey) {
        practiceService.getPracticeQuota().then(quota => {
          setQuotaRemaining(quota.remaining);
        }).catch(err => console.error('Failed to reload quota:', err));
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert('Daily shared quota limit reached. Please connect a personal API key.');
      } else {
        alert(err.response?.data?.message || 'Failed to convert scenario. Please check connection and keys.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInlineKey = async (e) => {
    e.preventDefault();
    if (!inlineKeyVal.trim()) return;
    setInlineSaving(true);
    setInlineError('');

    try {
      const keyToTest = inlineKeyVal.trim();
      const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`);
      if (!testRes.ok) {
        const errorData = await testRes.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Invalid Gemini API key. Please check your key from Google AI Studio.');
      }

      // Save key in aiClient localStorage
      aiClient.saveKey('gemini', {
        name: inlineKeyName.trim() || 'My Personal Key',
        value: keyToTest,
        model: inlineModel,
        isActive: true
      });

      setAiCoachingEnabled(true);
      setShowAICoachingModal(false);
      setShowInlineKeyForm(false);
      setInlineKeyVal('');
      triggerToast('✨ Personal Gemini API key saved! AI Coaching enabled.');
    } catch (err) {
      setInlineError(err.message || 'Key validation failed. Please check your key.');
    } finally {
      setInlineSaving(false);
    }
  };

  const loadQuestionDetails = async (id) => {
    try {
      const data = await practiceService.getPracticeQuestionById(id);
      setIsBookmarked(data.isBookmarked || false);
      setShowHint(false);
      setActiveStepTab(0);

      if (data.lastAttempt) {
        clearInterval(readingTimerRef.current);
        setIsReadingPhase(false);
        setVerdict({
          attemptId: data.lastAttempt._id,
          isCorrect: data.lastAttempt.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
          blanks: data.blanks,
          verbalEvaluation: data.lastAttempt.verbalEvaluation,
          deterministic: data.lastAttempt.deterministic,
          ai: data.lastAttempt.ai,
          aiStatus: data.lastAttempt.aiStatus || data.lastAttempt.ai?.status || 'skipped',
          evaluationMode: data.lastAttempt.evaluationMode || 'RULE_ONLY'
        });
        if (data.kind === 'VerbalQuestion') {
          if (data.verbalType === 'sentence_completion') {
            const initial = {};
            (data.lastAttempt.submittedAnswer || []).forEach((ans, idx) => {
              initial[idx] = ans;
            });
            setVerbalAnswers(initial);
          } else {
            setVerbalAnswers({ 0: data.lastAttempt.submittedAnswer?.[0] || '' });
          }
        } else {
          setSelectedOption(data.lastAttempt.submittedAnswer?.[0] || '');
        }
      } else if (data.isSolved && data.correctAnswer) {
        clearInterval(readingTimerRef.current);
        setIsReadingPhase(false);
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

    const makeSubmitRequest = async (keyVal, provName) => {
      let evalMode = 'RULE_ONLY';
      if (aiCoachingEnabled) {
        evalMode = keyVal ? 'AI_BYOK' : 'AI_SHARED';
      }
      return await practiceService.submitPracticeAnswer(activeQuestion._id, {
        submittedAnswer: submitted,
        timeTakenSec: isMockMode ? ((activeQuestion.writingDurationSecEmail || 540) - timeLeft) : timeTaken,
        sessionId: sessionId,
        apiKey: keyVal,
        provider: provName,
        evaluationMode: evalMode,
        useAI: aiCoachingEnabled
      });
    };

    try {
      let activeKeyObj = aiClient.getActiveKey('gemini');
      let res;
      try {
        res = await makeSubmitRequest(activeKeyObj?.value || null, 'gemini');
      } catch (err) {
        if (err.response?.status === 429 && err.response?.data?.error === 'PROVIDER_RATE_LIMIT' && activeKeyObj) {
          const rotated = aiClient.rotateKey(activeKeyObj.id, 'gemini');
          if (rotated) {
            triggerToast(`Rate limit hit on primary. Rotating to "${rotated.name}" and retrying...`);
            res = await makeSubmitRequest(rotated.value, 'gemini');
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      setVerdict(res);

      // Start non-blocking background polling if AI evaluation is pending
      if (res.attemptId && res.aiStatus === 'pending') {
        const pollInterval = setInterval(async () => {
          try {
            const updated = await practiceService.getAttemptAIStatus(res.attemptId);
            if (updated && updated.aiStatus !== 'pending') {
              clearInterval(pollInterval);
              setVerdict(prev => ({
                ...prev,
                aiStatus: updated.aiStatus,
                ai: updated.ai,
                verbalEvaluation: updated.verbalEvaluation || prev.verbalEvaluation
              }));
            }
          } catch (e) {
            console.error('AI status polling error:', e);
          }
        }, 2000);
      }
      
      // Update local question status in list to show it as solved or attempted
      setQuestions(prev => 
        prev.map(q => q._id === activeQuestion._id ? { 
          ...q, 
          isSolved: res.isCorrect,
          isAttempted: !res.isCorrect
        } : q)
      );

      // Refetch daily quota if evaluated via Shared AI
      if (activeQuestion.verbalType === 'email_writing' && !aiClient.getActiveKey('gemini')) {
        practiceService.getPracticeQuota().then(quota => {
          setQuotaRemaining(quota.remaining);
        }).catch(err => console.error('Failed to reload quota:', err));
      }

      // Clean up Draft on successful submission
      if (activeQuestion.verbalType === 'email_writing') {
        await practiceService.deleteQuestionDraft(activeQuestion._id).catch(() => {});
        lastSavedRef.current = '';
        setLastSavedTime(null);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429 && err.response?.data?.error === 'daily_quota_exhausted') {
        setShowSharedQuotaModal(true);
      } else if (err.response?.status === 429 && err.response?.data?.error === 'personal_quota_exhausted') {
        setShowPersonalQuotaModal(true);
      } else {
        alert(err.response?.data?.message || 'Answer evaluation failed. Please check key connection details.');
      }
      
      // Restart timer on failure
      if (isMockMode) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmit();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        timerRef.current = setInterval(() => {
          setTimeTaken(prev => prev + 1);
        }, 1000);
      }
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
          onClick={() => navigate(`/aptitude?section=${activeQuestion?.section || targetSection}`)}
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
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col md:flex-row md:h-screen md:overflow-hidden">
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
      <div className="w-full md:w-80 border-r border-darkBorder bg-darkCard/50 p-6 flex flex-col justify-between shrink-0 overflow-y-auto md:h-full">
        <div className="space-y-6">
          {/* Back Navigation Link */}
          <button 
            onClick={() => {
              if (topicKey === 'sentence-completion' && selectedSkill !== 'all') {
                handleSkillChange('all');
              } else {
                setSelectedSkill('all');
                navigate(`/aptitude?section=${activeQuestion?.section || targetSection}`);
              }
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span>
              {topicKey === 'sentence-completion' && selectedSkill !== 'all'
                ? 'Back to All Questions'
                : 'Back to Practice'}
            </span>
          </button>

          {(topicKey === 'email-writing' || topicKey === 'passage-recall') ? (
            <div className="space-y-6">
              {/* Category 1: Practice Set */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowPracticeList(!showPracticeList)}
                  className="w-full flex items-center justify-between text-[11px] uppercase font-black text-slate-500 tracking-widest select-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-slate-400 font-sans font-bold">
                    📁 Standard Practice Set ({questions.filter(q => q.isPublic !== false).length})
                  </span>
                  <span className="text-slate-600">{showPracticeList ? '▼' : '▶'}</span>
                </button>

                {showPracticeList && (
                  <div className="grid grid-cols-5 gap-2 pt-1 select-none">
                    {questions
                      .filter(q => q.isPublic !== false)
                      .map((q) => {
                        const globalIdx = questions.indexOf(q);
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
                            className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnClass}`}
                          >
                            {globalIdx + 1}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Category 2: Personal AI Scenarios */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setShowAIList(!showAIList)}
                  className="w-full flex items-center justify-between text-[11px] uppercase font-black text-slate-500 tracking-widest select-none cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-slate-400 font-sans font-bold">
                    ✨ Your AI Scenarios ({questions.filter(q => q.isPublic === false && q.createdBy === user?._id).length})
                  </span>
                  <span className="text-slate-600">{showAIList ? '▼' : '▶'}</span>
                </button>

                {showAIList && (
                  <div className="grid grid-cols-5 gap-2 pt-1 select-none">
                    {questions.filter(q => q.isPublic === false && q.createdBy === user?._id).length === 0 ? (
                      <div className="col-span-5 text-[10px] text-slate-600 text-center py-4 border border-dashed border-darkBorder rounded-xl font-bold uppercase tracking-wider select-none">
                        No private scenarios generated
                      </div>
                    ) : (
                      questions
                        .filter(q => q.isPublic === false && q.createdBy === user?._id)
                        .map((q, idx) => {
                          const isActive = activeQuestion?._id === q._id;
                          let btnClass = 'border-darkBorder bg-darkBg text-slate-400 hover:border-slate-500 hover:text-white';
                          
                          if (isActive) {
                            btnClass = 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/25';
                          } else if (q.isSolved) {
                            btnClass = 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/20';
                          } else if (q.isAttempted) {
                            btnClass = 'bg-rose-500/10 border-rose-500/35 text-rose-400 hover:bg-rose-500/20';
                          }

                          return (
                            <button
                              key={q._id}
                              onClick={() => handleSelectQuestion(q)}
                              className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${btnClass}`}
                              title={`${q.difficulty.toUpperCase()} • ${q.communicationType}`}
                            >
                              P{idx + 1}
                            </button>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-base font-extrabold text-white tracking-wide">
                  {activeQuestion ? activeQuestion.displayName : 'Questions'}
                </h2>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Topic Practice Set
                </p>
              </div>

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
          )}
        </div>

        {/* Sidebar Info Section & Action Buttons */}
        <div className="mt-8 border-t border-darkBorder/40 pt-4 space-y-4">
          {(topicKey === 'email-writing' || topicKey === 'passage-recall') && (
            <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider select-none pb-2">
              <button
                onClick={() => setShowGenModal(true)}
                className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow shadow-accentBlue/10"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>AI Scenario Generator</span>
              </button>
              <button
                onClick={() => setShowConvertModal(true)}
                className="w-full border border-darkBorder hover:bg-slate-800 text-slate-300 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Convert Situation</span>
              </button>
            </div>
          )}

          <div className="space-y-3 select-none text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
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
      </div>

      {/* Right Panel: Interactive Solving Section */}
      <div className="flex-grow overflow-y-auto md:h-full">
        <div className="p-6 md:p-8 flex flex-col justify-start max-w-4xl mx-auto w-full min-h-full space-y-6">
          {/* Skill Filter Pills (Fill in the Blanks) */}
          {topicKey === 'sentence-completion' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-darkBorder/40 scrollbar-none select-none shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest shrink-0 mr-1">
                Skill:
              </span>
              {FILL_BLANK_SKILLS_UI.map((item) => {
                const isSelected = selectedSkill === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSkillChange(item.key)}
                    title={item.full}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accentBlue text-white shadow-md shadow-accentBlue/20 border border-accentBlue'
                        : 'bg-darkCard border border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

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

                {activeQuestion.skills?.length > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-violet-500/10 text-violet-400 border-violet-500/20">
                    {activeQuestion.skills[0].replace(/-/g, ' ')}
                  </span>
                )}

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



                {/* Timer Tracker (Countdown for mock mode / Countup for practice) */}
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl select-none transition-all duration-300 ${
                  isMockMode 
                    ? timeLeft < 60
                      ? 'bg-rose-500/10 border border-rose-500/35 text-rose-400 animate-pulse'
                      : 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                    : 'bg-darkCard/60 border border-darkBorder text-slate-400'
                }`}>
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>
                    {isMockMode ? `Time Left: ${formatTime(timeLeft)}` : formatTime(timeTaken)}
                  </span>
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

                {/* ✨ Universal AI Coaching Toggle Control Bar (For Email & Passage Recall) */}
                {(activeQuestion.verbalType === 'email_writing' || activeQuestion.verbalType === 'passage_recall') && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-darkCard/60 border border-darkBorder rounded-2xl gap-3 mb-2">
                    <div className="flex items-center space-x-3 select-none">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-white">AI Coaching</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!aiCoachingEnabled) {
                            const activeKey = aiClient.getActiveKey('gemini');
                            if (!activeKey) {
                              setShowAICoachingModal(true);
                              setShowInlineKeyForm(false);
                            } else {
                              setAiCoachingEnabled(true);
                              triggerToast('✨ AI Coaching enabled with your Gemini Key.');
                            }
                          } else {
                            setAiCoachingEnabled(false);
                            triggerToast('✨ AI Coaching disabled (Rule Engine mode).');
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          aiCoachingEnabled ? 'bg-accentBlue' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiCoachingEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-[11px] font-bold text-slate-400">
                        {aiCoachingEnabled ? 'ON (Deep Coaching)' : 'OFF (Rule Engine Only)'}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-400 bg-darkBg/60 px-3 py-1.5 rounded-xl border border-darkBorder/60 flex items-center gap-2 select-none">
                      <span>✨ Shared AI Remaining Today:</span>
                      <strong className="text-violet-300 font-bold">{quotaRemaining} / 10</strong>
                    </div>
                  </div>
                )}

                {/* 2. Passage Recall */}
                {activeQuestion.verbalType === 'passage_recall' && (
                  <div className="space-y-4">
                    {isReadingPhase ? (
                      <div className="border border-accentBlue/25 bg-accentBlue/5 rounded-2xl p-6 space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-accentBlue/15 pb-3 select-none">
                          <span className="text-xs font-black uppercase text-accentBlue tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Reading Phase (30s Memory Window)
                          </span>
                          <span className="text-xs font-extrabold text-white bg-accentBlue/20 px-3 py-1 rounded-full border border-accentBlue/30">
                            Time Remaining: {readingTimeLeft}s
                          </span>
                        </div>
                        <p className="text-slate-100 text-base leading-relaxed font-semibold italic select-none p-4 bg-darkBg/60 border border-darkBorder rounded-xl">
                          "{activeQuestion.passageText}"
                        </p>
                        <div className="flex items-center justify-between pt-1 select-none">
                          <span className="text-[11px] text-slate-400 font-medium">Read carefully and remember key names, dates, numbers & locations.</span>
                          <button
                            type="button"
                            onClick={() => {
                              clearInterval(readingTimerRef.current);
                              setIsReadingPhase(false);
                            }}
                            className="bg-accentBlue hover:bg-accentBlue/90 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-accentBlue/20"
                          >
                            I'm Ready to Write
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fadeIn">
                        {!verdict && (
                          <div className="bg-accentBlue/10 border border-accentBlue/25 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-300 font-medium select-none">
                            <span className="flex items-center gap-2">
                              <span className="text-base">✍️</span>
                              <span><strong>Phase 2: Writing Phase</strong> — Reconstruct the passage as accurately as you can from memory.</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowPassageRecall(!showPassageRecall)}
                              className="text-accentBlue hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer bg-darkBg/60 px-3 py-1.5 rounded-xl border border-accentBlue/30 transition-colors"
                            >
                              {showPassageRecall ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{showPassageRecall ? 'Hide Passage' : 'Peek Passage'}</span>
                            </button>
                          </div>
                        )}

                        {showPassageRecall && !verdict && (
                          <div className="border border-accentBlue/30 bg-accentBlue/5 p-4 rounded-2xl text-slate-200 text-sm italic leading-relaxed animate-fadeIn">
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
                        {activeQuestion.guidelines?.length > 0 && !isMockMode && (
                          <div className="flex-1 space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">✅ Cover These Points</div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 select-none">
                              {activeQuestion.guidelines.map((guide, idx) => {
                                const words = guide.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                                const hasTyped = words.some(w => (verbalAnswers[0] || '').toLowerCase().includes(w));
                                return (
                                  <li key={idx} className="flex items-center gap-2 text-xs">
                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-black transition-all ${
                                      hasTyped 
                                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-extrabold' 
                                        : 'border-darkBorder bg-darkBg text-transparent'
                                    }`}>✓</span>
                                    <span className={hasTyped ? 'text-slate-300 line-through opacity-70' : 'text-slate-200'}>{guide}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-col justify-center items-start sm:items-end gap-1 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Length</div>
                          <div className="text-sm font-bold text-violet-400">
                            {Math.max(activeQuestion.minWords || 0, 100)} – {Math.max(activeQuestion.maxWords || 0, 250)} words
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
                            const minVal = Math.max(activeQuestion.minWords || 0, 100);
                            const maxVal = Math.max(activeQuestion.maxWords || 0, 250);
                            if (wc === 0) return 'text-violet-900 bg-violet-950/40';
                            if (wc < minVal) return 'text-violet-400 bg-violet-500/15';
                            if (wc > maxVal) return 'text-violet-300 bg-violet-400/25';
                            return 'text-violet-200 bg-violet-500/30';
                          })()
                        }`}>
                          {(verbalAnswers[0] || '').trim().split(/\s+/).filter(Boolean).length} / {Math.max(activeQuestion.maxWords || 0, 250)} words
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
                        const min = Math.max(activeQuestion.minWords || 0, 100);
                        const max = Math.max(activeQuestion.maxWords || 0, 250);
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
            {isSolved && verdict && (activeQuestion.kind === 'MCQQuestion' || activeQuestion.verbalType === 'sentence_completion') && (
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

                {/* Blank Answers Breakdown for Fill in the Blanks */}
                {activeQuestion.verbalType === 'sentence_completion' && (activeQuestion.blanks?.length > 0 || verdict.blanks?.length > 0) && (
                  <div className="space-y-3 pt-1">
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-slate-500" /> Answer Key & Acceptable Options
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
                      {(verdict.blanks || activeQuestion.blanks || []).map((blank, bIdx) => {
                        const studentVal = (verbalAnswers[blank.blankIndex ?? bIdx] || '').trim();
                        const acceptableList = blank.acceptableAnswers || [];
                        const isBlankCorrect = acceptableList.some(
                          acc => acc.trim().toLowerCase() === studentVal.toLowerCase()
                        );

                        return (
                          <div
                            key={bIdx}
                            className={`p-3.5 rounded-xl border space-y-1.5 ${
                              isBlankCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/30 text-red-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span>Blank #{ (blank.blankIndex ?? bIdx) + 1 }</span>
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                                isBlankCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                  : 'bg-red-500/20 border-red-500/40 text-red-400'
                              }`}>
                                {isBlankCorrect ? '✓ Correct' : '✕ Incorrect'}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200">
                              <span className="text-slate-400 font-normal">Your Answer: </span>
                              <strong>{studentVal || '(blank)'}</strong>
                            </div>
                            <div className="text-xs font-medium text-emerald-400">
                              <span className="text-slate-400 font-normal">Accepted Options: </span>
                              <span className="font-bold">{acceptableList.join(' / ') || 'None'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

            {/* Verdict explanation box (Verbal Graded: Passage Recall / Email) */}
            {isSolved && verdict && (activeQuestion.verbalType === 'passage_recall' || activeQuestion.verbalType === 'email_writing') && (
              <div className="border border-darkBorder bg-darkCard/40 rounded-2xl p-6 mt-6 space-y-6 animate-fadeIn">
                <FeedbackErrorBoundary
                  onReset={() => {
                    setVerdict(null);
                    setVerbalAnswers({ 0: '' });
                  }}
                >
                  <EvaluationFeedback
                    attemptId={verdict.attemptId || activeQuestion.lastAttempt?._id}
                    questionId={activeQuestion._id}
                    verbalEvaluation={verdict.verbalEvaluation}
                    deterministicData={verdict.deterministic}
                    aiData={verdict.ai}
                    aiStatus={verdict.aiStatus || verdict.ai?.status}
                    evaluationMode={verdict.evaluationMode || (aiCoachingEnabled ? 'AI_SHARED' : 'RULE_ONLY')}
                    submittedAnswer={[verbalAnswers[0] || '']}
                    onPracticeAgain={async () => {
                      await practiceService.deleteQuestionDraft(activeQuestion._id).catch(() => {});
                      setVerdict(null);
                      setVerbalAnswers({ 0: '' });
                      lastSavedRef.current = '';
                      setLastSavedTime(null);
                      if (isMockMode) {
                        setTimeLeft(activeQuestion.writingDurationSecEmail || 540);
                      } else {
                        setTimeTaken(0);
                      }
                    }}
                    onEnableAICoaching={() => {
                      const activeKey = aiClient.getActiveKey('gemini');
                      if (!activeKey) {
                        setShowAICoachingModal(true);
                        setShowInlineKeyForm(false);
                      } else {
                        setAiCoachingEnabled(true);
                        triggerToast('✨ AI Coaching enabled for your practice session.');
                        handleSubmitVerbal();
                      }
                    }}
                  />
                </FeedbackErrorBoundary>
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

      {/* Draft Recovery Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative text-center animate-in fade-in zoom-in duration-200">
            <div className="space-y-3">
              <span className="text-3xl">📝</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Unsaved Draft Found</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                We found an autosaved draft from your previous session on this question. Would you like to resume writing or start fresh?
              </p>
            </div>
            
            <div className="space-y-2 text-xs font-bold uppercase tracking-wider select-none">
              <button
                onClick={() => {
                  setVerbalAnswers({ 0: recoveredDraftText });
                  lastSavedRef.current = recoveredDraftText;
                  setShowDraftModal(false);
                }}
                className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-3 rounded-xl transition-colors cursor-pointer"
              >
                Continue Writing
              </button>
              <button
                onClick={async () => {
                  await practiceService.deleteQuestionDraft(activeQuestion._id).catch(() => {});
                  setShowDraftModal(false);
                }}
                className="w-full border border-darkBorder hover:bg-slate-800 text-slate-300 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Discard & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotation / Backup Key Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500/10 border border-amber-500/35 text-amber-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* AI Scenario Generator Input Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowGenModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <span className="text-3xl">✨</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">AI Scenario Generator</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {topicKey === 'passage-recall'
                  ? 'Generate a custom, realistic TCS NQT-style passage recall question.'
                  : 'Generate a custom, realistic TCS NQT-style email writing question.'}
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl p-2.5 text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              {topicKey !== 'passage-recall' && (
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">Communication Type</label>
                  <select
                    value={genCommType}
                    onChange={(e) => setGenCommType(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-xl p-2.5 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Internal">Internal Email</option>
                    <option value="Client">Client Email</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs font-bold uppercase tracking-wider select-none">
              <button
                onClick={handleGenerateAIQuestion}
                disabled={isGenerating}
                className="w-full bg-accentBlue hover:bg-accentBlue/90 disabled:opacity-50 text-white py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-accentBlue/10"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Drafting Scenario...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Scenario</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scenario Converter Input Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowConvertModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <span className="text-3xl">📝</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Scenario Converter</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {topicKey === 'passage-recall'
                  ? 'Enter your own passage or situation, and AI will convert it into a structured recall set.'
                  : 'Enter your own corporate situation, and AI will convert it into a structured placement set.'}
              </p>
            </div>

            <form onSubmit={handleCustomScenarioSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">Your Situation</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                  placeholder={
                    topicKey === 'passage-recall'
                      ? 'e.g. Rahul delivered the blood test reports to Apollo Hospital at 7:30 AM.'
                      : 'e.g. Write an email to team describing security patches updates.'
                  }
                  className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-xs text-slate-200 focus:outline-none placeholder-slate-600 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="space-y-2 text-xs font-bold uppercase tracking-wider select-none">
                <button
                  type="submit"
                  disabled={isGenerating || !customText.trim()}
                  className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/10"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Converting Scenario...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Convert Scenario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Quota Exhausted Modal */}
      {showSharedQuotaModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowSharedQuotaModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-3">
              <span className="text-3xl">🚫</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Daily Free Quota Exhausted</h3>
              <div className="text-slate-400 text-xs leading-relaxed text-left space-y-3">
                <div className="bg-violet-500/10 border border-violet-500/25 text-violet-300 p-3 rounded-xl flex items-start gap-2">
                  <span className="text-base">✅</span>
                  <span className="text-[11px] font-semibold">Your written answer and attempt record have been saved safely in your history.</span>
                </div>
                <p className="font-bold text-center text-white text-xs">Your free daily AI tokens are used up for today (0/10 remaining).</p>
                <p className="font-medium text-slate-300 text-[11px]">Please come back tomorrow, or connect your personal free Gemini API key to unlock unlimited AI practice instantly!</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-bold uppercase tracking-wider select-none">
              <button
                onClick={() => {
                  setShowSharedQuotaModal(false);
                  setShowAICoachingModal(true);
                  setShowInlineKeyForm(true);
                }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
              >
                <span>🔑</span> Connect My Free Gemini API Key
              </button>
              <button
                onClick={() => setShowSharedQuotaModal(false)}
                className="w-full border border-darkBorder hover:bg-slate-800 text-slate-300 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Continue in Rule Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Quota Exhausted Modal */}
      {showPersonalQuotaModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowPersonalQuotaModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Your Quota Exhausted</h3>
              <div className="text-slate-400 text-xs leading-relaxed text-left space-y-3">
                <p className="font-bold text-center text-slate-300">Your Gemini API key quota has been exhausted.</p>
                <p>You can:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 font-medium">
                  <li>Enter a backup API key</li>
                  <li>Wait until your Google Studio quota resets (usually resets every minute on free tier)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 text-xs font-bold uppercase tracking-wider select-none">
              <button
                onClick={() => {
                  setShowPersonalQuotaModal(false);
                  setShowAICoachingModal(true);
                  setShowInlineKeyForm(true);
                }}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-violet-600/20"
              >
                Enter Backup Key
              </button>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-darkBorder hover:bg-slate-800 text-slate-300 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Get Free API Key ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ✨ AI Coaching Onboarding & Inline Key Modal */}
      {showAICoachingModal && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => {
                setShowAICoachingModal(false);
                setShowInlineKeyForm(false);
              }}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {showInlineKeyForm ? (
              /* Inline API Key Form directly inside the modal */
              <form onSubmit={handleSaveInlineKey} className="space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-darkBorder pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Connect Personal Gemini Key</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInlineKeyForm(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Your key is saved safely inside your browser local storage. It is never stored in MongoDB or sent to server logs.
                </p>

                {inlineError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-300 text-xs font-semibold">
                    {inlineError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">API Key Value</label>
                  <input
                    type="password"
                    value={inlineKeyVal}
                    onChange={(e) => setInlineKeyVal(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Key Name</label>
                    <input
                      type="text"
                      value={inlineKeyName}
                      onChange={(e) => setInlineKeyName(e.target.value)}
                      placeholder="e.g. My Personal Key"
                      className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Model</label>
                    <select
                      value={inlineModel}
                      onChange={(e) => setInlineModel(e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 space-y-2 select-none">
                  <button
                    type="submit"
                    disabled={inlineSaving || !inlineKeyVal.trim()}
                    className="w-full bg-accentBlue hover:bg-accentBlue/90 disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-accentBlue/20"
                  >
                    {inlineSaving ? 'Validating Key...' : 'Validate & Save Key'}
                  </button>

                  <Link
                    to="/ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-accentBlue hover:underline text-[11px] font-bold py-1 transition-colors"
                  >
                    How do I get a free API key?
                  </Link>
                </div>
              </form>
            ) : (
              /* Choice View */
              <>
                <div className="text-center space-y-2 select-none">
                  <Sparkles className="w-8 h-8 text-accentBlue mx-auto animate-bounce" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Enable ✨ AI Coaching</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">
                    Choose how you would like to run AI evaluations for your practice session.
                  </p>
                </div>

                <div className="space-y-3 text-xs font-bold uppercase tracking-wider select-none">
                  <button
                    type="button"
                    onClick={() => setShowInlineKeyForm(true)}
                    className="w-full bg-accentBlue hover:bg-accentBlue/90 text-white py-3.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-accentBlue/20 flex items-center justify-center font-bold tracking-wider"
                  >
                    Use My Free Gemini Key (Unlimited)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAICoachingModal(false);
                      setAiCoachingEnabled(true);
                      triggerToast('✨ AI Coaching enabled in Shared Mode.');
                    }}
                    className="w-full border border-darkBorder hover:bg-slate-800 text-slate-200 py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center font-bold tracking-wider"
                  >
                    Continue with Free Shared AI ({quotaRemaining}/10 remaining)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAICoachingModal(false)}
                    className="w-full text-slate-500 hover:text-slate-300 text-[10px] pt-1 transition-colors cursor-pointer font-bold tracking-wider"
                  >
                    Cancel (Keep AI Coaching OFF)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeArena;
