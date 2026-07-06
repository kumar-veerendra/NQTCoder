import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as practiceService from '../services/practiceService';
import { AuthContext } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { 
  BookOpen, Play, CheckCircle2, TrendingUp, Compass, Award, 
  BarChart2, Clock, Zap, Target, ChevronRight, HelpCircle,
  Bookmark as BookmarkIcon, AlertTriangle, ArrowRight, ShieldAlert, MoreVertical 
} from 'lucide-react';
import SEO from '../components/SEO';

const AptitudeDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [revisionQueue, setRevisionQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    if (['quant', 'logical', 'verbal', 'bookmarks', 'revision'].includes(sec)) {
      return sec;
    }
    return 'quant';
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    if (sec && ['quant', 'logical', 'verbal', 'bookmarks', 'revision'].includes(sec)) {
      setActiveSection(sec);
    }
  }, [window.location.search]);

  const handleSectionChange = (sec) => {
    setActiveSection(sec);
    navigate(`/aptitude?section=${sec}`, { replace: true });
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Topics are public — always fetch
      const topicsData = await practiceService.getSyllabusTopics();
      setTopics(topicsData);

      // Progress, bookmarks, revision queue require auth — skip for guests
      if (user) {
        const [progressData, bookmarksData, revisionData] = await Promise.all([
          practiceService.getPracticeProgress(),
          practiceService.getBookmarks(),
          practiceService.getRevisionQueue()
        ]);
        setProgress(progressData);
        setBookmarks(bookmarksData);
        setRevisionQueue(revisionData);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve aptitude modules. Please check connection.');
    } finally {
      setLoading(false);
    }
  };


  const handleStartSession = async (topicKey) => {
    if (!user) {
      navigate(`/aptitude/arena/${topicKey}?section=${activeSection}`);
      return;
    }
    try {
      const session = await practiceService.startPracticeSession({
        section: activeSection,
        topic: topicKey,
        mode: 'practice'
      });
      navigate(`/aptitude/arena/${topicKey}?sessionId=${session._id}&section=${activeSection}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start practice session.');
    }
  };

  // Filter topics for the active section (quant / logical)
  const filteredTopics = topics.filter(t => t.section === activeSection);

  // Compute overall aggregates
  const totalSolved = progress.reduce((sum, p) => sum + (p.solved || 0), 0);
  const averageAccuracy = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + (p.accuracy || 0), 0) / progress.length)
    : 0;
  
  const averageSolveTime = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + (p.averageTime || 0), 0) / progress.length)
    : 0;

  const completedTopicsCount = progress.filter(p => p.solved >= p.totalQuestions && p.totalQuestions > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100 min-h-screen">
      <SEO
        title="Aptitude & Logical Reasoning Practice Arena"
        description="Master Quantitative Aptitude and Logical Reasoning placement questions for TCS NQT, Infosys, Wipro, and Accenture."
        path="/aptitude"
      />

      {/* Auth Modal for guests */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode="aptitude"
      />

      {/* 1. Dashboard Hero Section */}
      <div className="bg-gradient-to-r from-darkCard via-darkCard/90 to-accentBlue/5 border border-darkBorder p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-3 text-center md:text-left z-10">
          <div className="text-xs text-accentBlue uppercase font-black tracking-widest flex items-center justify-center md:justify-start gap-1.5">
            <Compass className="w-4 h-4 animate-spin-slow" /> Aptitude & Reasoning Prep
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            Cognitive <span className="text-accentBlue">Practice Arena</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Elevate your logical and arithmetic capabilities. Solve real placements mock MCQs dynamically tailored to corporate syllabus weights.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto z-10 shrink-0">
          <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl text-center shadow">
            <HelpCircle className="w-5 h-5 mx-auto text-accentBlue mb-1.5" />
            <div className="text-xl font-extrabold text-white">{totalSolved}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Solved</div>
          </div>

          <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl text-center shadow">
            <Target className="w-5 h-5 mx-auto text-accentBlue mb-1.5" />
            <div className="text-xl font-extrabold text-white">{averageAccuracy}%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accuracy</div>
          </div>

          <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl text-center shadow">
            <Clock className="w-5 h-5 mx-auto text-accentBlue mb-1.5" />
            <div className="text-xl font-extrabold text-white">{averageSolveTime}s</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Time</div>
          </div>

          <div className="bg-darkBg/60 border border-darkBorder p-4 rounded-xl text-center shadow">
            <Award className="w-5 h-5 mx-auto text-accentBlue mb-1.5" />
            <div className="text-xl font-extrabold text-white">{completedTopicsCount}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed</div>
          </div>
        </div>
      </div>

      {/* 2. Category Toggles */}
      <div className="flex items-center justify-between border-b border-darkBorder pb-4 select-none relative">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSectionChange('quant')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'quant'
                ? 'bg-accentBlue border-accentBlue text-white shadow-lg shadow-accentBlue/10'
                : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" /> Quantitative Aptitude
          </button>

          <button
            onClick={() => handleSectionChange('logical')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'logical'
                ? 'bg-accentBlue border-accentBlue text-white shadow-lg shadow-accentBlue/10'
                : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Logical Reasoning
          </button>

          <button
            onClick={() => handleSectionChange('verbal')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'verbal'
                ? 'bg-accentBlue border-accentBlue text-white shadow-lg shadow-accentBlue/10'
                : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Verbal Ability
          </button>

          <button
            onClick={() => handleSectionChange('di')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'di'
                ? 'bg-accentBlue border-accentBlue text-white shadow-lg shadow-accentBlue/10'
                : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Data Interpretation
          </button>
        </div>

        {/* Right side: three-dot menu dropdown for Non-Syllabus options */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2.5 border rounded-xl transition-all cursor-pointer ${
              menuOpen || activeSection === 'bookmarks' || activeSection === 'revision'
                ? 'bg-darkBg border-slate-700 text-slate-200 shadow-md'
                : 'bg-darkCard border-darkBorder text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Additional Practice Views"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Invisible Backdrop Click handler */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-52 bg-darkCard border border-darkBorder rounded-2xl py-2 shadow-2xl z-20 animate-fadeIn select-none">
                <button
                  onClick={() => {
                    setActiveSection('bookmarks');
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-black tracking-wide uppercase flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeSection === 'bookmarks'
                      ? 'bg-accentBlue/15 text-accentBlue border-l-2 border-accentBlue'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-darkBg/60 border-l-2 border-transparent'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4 text-slate-400" />
                  <span>Bookmarks ({bookmarks.length})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('revision');
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-black tracking-wide uppercase flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeSection === 'revision'
                      ? 'bg-accentBlue/15 text-accentBlue border-l-2 border-accentBlue'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-darkBg/60 border-l-2 border-transparent'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <span>Revision Queue ({revisionQueue.length})</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Topics Grid Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-5 rounded-xl text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Structuring syllabus elements...</span>
        </div>
      ) : activeSection === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-xl text-slate-500 space-y-3">
            <BookmarkIcon className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-xs font-bold">No bookmarks saved yet.</p>
            <p className="text-xs text-slate-500">Flag questions inside the solver arena to save them to your custom notebook.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {bookmarks.map((bItem) => {
              const q = bItem.questionId;
              if (!q) return null;

              return (
                <div 
                  key={bItem._id} 
                  className="bg-darkCard border border-darkBorder hover:border-accentBlue rounded-2xl p-6 flex flex-col justify-between shadow transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg border border-darkBorder text-slate-400">
                        {q.section || 'quant'}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        q.difficulty === 'easy'
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-slate-200 text-xs font-semibold leading-relaxed line-clamp-3">
                      {q.content.statement}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/aptitude/arena/${q.topic}?section=bookmarks`)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-darkBorder hover:border-slate-500 mt-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Solve Bookmarked Set</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : activeSection === 'revision' ? (
        revisionQueue.length === 0 ? (
          <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-xl text-slate-500 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-violet-500 animate-pulse" />
            <p className="text-xs font-bold text-violet-400">Your Revision Queue is Empty!</p>
            <p className="text-xs text-slate-500">Solve questions and resolve flagged errors. Double-missed questions populate here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {revisionQueue.map((rItem) => {
              const q = rItem.questionId;
              if (!q) return null;

              return (
                <div 
                  key={rItem._id} 
                  className="bg-darkCard border border-rose-500/20 hover:border-rose-500 rounded-2xl p-6 flex flex-col justify-between shadow transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Double-Missed
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">
                        Topic: {q.topic}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                      {q.content.statement}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/aptitude/arena/${q.topic}?section=revision`)}
                    className="w-full bg-rose-950 hover:bg-rose-900 border border-rose-500/35 text-rose-300 mt-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Resolve Flags</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : filteredTopics.length === 0 ? (
        <div className="text-center py-20 bg-darkCard border border-darkBorder rounded-xl text-slate-500 space-y-3">
          <Target className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-xs font-bold">No practice topics found for this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topicItem) => {
            // Find corresponding progress
            const prog = progress.find(p => p.topic === topicItem.topic);
            const solvedCount = prog ? prog.solved : 0;
            const totalQCount = prog ? prog.totalQuestions : 0;
            const accuracyVal = prog ? prog.accuracy : 0;
            const avgTimeVal = prog ? prog.averageTime : 0;

            const isCompleted = totalQCount > 0 && solvedCount >= totalQCount;
            const progressPercent = totalQCount > 0 ? Math.round((solvedCount / totalQCount) * 100) : 0;

            // LLM-powered topics or topics with 0 database questions — not yet available
            const comingSoon = ['passage-recall', 'email-writing'].includes(topicItem.topic) || topicItem.questionCount === 0;

            return (
              <div 
                key={topicItem._id} 
                className={`bg-darkCard border border-darkBorder rounded-2xl p-6 flex flex-col justify-between shadow transition-all duration-300 group relative ${
                  comingSoon ? 'opacity-50 cursor-not-allowed select-none' : 'hover:border-accentBlue'
                }`}
              >
                <div className="space-y-4">
                  {/* Subject and exam weight badges */}
                  <div className="flex items-center justify-between select-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg border border-darkBorder text-slate-400">
                      {topicItem.examPattern || 'Placements'}
                    </span>
                    {comingSoon ? (
                      <span className="text-[8px] bg-slate-500/10 text-slate-400 border border-slate-500/25 px-2 py-0.5 rounded uppercase font-black tracking-wider flex items-center gap-1">
                        🔒 Coming Soon
                      </span>
                    ) : topicItem.isAdvanced ? (
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                        Advanced Section
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-white tracking-wide group-hover:text-accentBlue transition-colors">
                      {topicItem.displayName}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                      Syllabus: {topicItem.subTopics.join(', ')}
                    </p>
                  </div>

                  {/* Company and Stats Tags */}
                  <div className="flex flex-wrap gap-2 pt-1 select-none">
                    <span className="text-[9px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-lg font-bold text-slate-400">
                      Weight: {topicItem.expectedQuestions?.min || 1}-{topicItem.expectedQuestions?.max || 3} Qs
                    </span>
                    {prog && (
                      <>
                        <span className="text-[9px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-lg font-bold text-slate-400">
                          {accuracyVal}% Acc
                        </span>
                        <span className="text-[9px] bg-darkBg border border-darkBorder px-2.5 py-0.5 rounded-lg font-bold text-slate-400">
                          {avgTimeVal}s Avg
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="mt-6 pt-4 border-t border-darkBorder/40 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500 flex items-center">
                      {isCompleted ? (
                        <>
                           <CheckCircle2 className="w-4 h-4 text-violet-400 mr-1.5 shrink-0" />
                          <span className="text-violet-400">Topic Mastered</span>
                        </>
                      ) : (
                        <span>Solved: {solvedCount} Qs</span>
                      )}
                    </span>
                    {totalQCount > 0 && (
                      <span className={isCompleted ? 'text-violet-400' : 'text-slate-300'}>
                        {progressPercent}%
                      </span>
                    )}
                  </div>

                  {/* Progress Line Bar */}
                  {totalQCount > 0 && (
                    <div className="h-1.5 w-full bg-darkBg rounded-full overflow-hidden border border-darkBorder/30">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-violet-500' : 'bg-accentBlue'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="pt-1 flex gap-3">
                    {comingSoon ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 bg-slate-800/50 border border-slate-700/40 text-slate-500 cursor-not-allowed"
                      >
                        <span>🔒 Coming Soon</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartSession(topicItem.topic)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                          isCompleted
                            ? 'bg-violet-500/10 border border-violet-500/35 text-violet-400 hover:bg-violet-500/20'
                            : 'bg-accentBlue hover:bg-accentBlue/90 text-white shadow-lg shadow-accentBlue/10'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 shrink-0" />
                        <span>{isCompleted ? 'Review Set' : solvedCount > 0 ? 'Resume' : 'Start Practice'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AptitudeDashboard;
