import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getWebDevQuestions } from '../../services/webDevService';
import { AuthContext } from '../../context/AuthContext';
import { 
  Code, Layout, Sparkles, CheckCircle2, Clock, 
  ArrowRight, Search, Filter, Layers, Award, Terminal, Compass
} from 'lucide-react';
import SEO from '../../components/SEO';

const CATEGORY_MAP = {
  all: 'All Categories',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  'html-css': 'HTML & CSS',
  'html-css-javascript': 'Full Stack Frontend',
};

const WebDevHub = () => {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (search.trim()) params.search = search.trim();

      const res = await getWebDevQuestions(params);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error('Error fetching web dev questions:', err);
      setError('Could not load web development challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  // Filter questions on client side for responsive search
  const filteredQuestions = questions.filter((q) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.description.toLowerCase().includes(query) ||
      (q.tags || []).some((t) => t.toLowerCase().includes(query))
    );
  });

  const totalSolved = filteredQuestions.filter((q) => q.userProgress?.solved).length;

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 font-sans pb-20">
      <SEO
        title="Web Development Practice Arena — HTML, CSS & JavaScript Practical Questions"
        description="Solve interactive frontend practical assessments with multi-file Monaco editor, live sandboxed preview, and behavioral test evaluation tailored for Cognizant & TCS recruitment."
        path="/web-development"
        keywords="web development practice, frontend coding questions, Cognizant frontend practical test, HTML CSS JavaScript practice questions, DOM manipulation test, TCS web dev test, interactive coding sandbox, live frontend compiler"
      />

      {/* Hero Header */}
      <section className="border-b border-darkBorder bg-darkCard/40 py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-accentBlue/10 text-accentBlue border border-accentBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Targeting TCS & Cognizant Practical Assessments 2026-27</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Web Development Practice Arena
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Build real UI components with HTML, CSS, and vanilla JavaScript. Test your code against real-time behavioral user interactions in an isolated sandbox.
              </p>
            </div>

            {/* User Stats Card */}
            {user && (
              <div className="bg-darkCard border border-darkBorder p-4 rounded-2xl flex items-center space-x-4 shrink-0 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Solved Progress</span>
                  <span className="text-lg font-black text-white">
                    {totalSolved} / {filteredQuestions.length} Completed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters and Catalog Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-darkCard border border-darkBorder p-4 rounded-2xl shadow-xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 select-none">
            {['all', 'javascript', 'html-css', 'html-css-javascript'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-accentBlue text-white shadow-md shadow-accentBlue/20'
                    : 'bg-darkBg text-slate-400 hover:text-slate-200 border border-darkBorder'
                }`}
              >
                {CATEGORY_MAP[cat] || cat}
              </button>
            ))}
          </div>

          {/* Difficulty and Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Difficulty Selector */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-slate-700 text-white border border-slate-500'
                      : 'bg-darkBg text-slate-400 hover:text-slate-200 border border-darkBorder'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search practical tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder px-3.5 py-1.5 pl-8.5 rounded-xl text-xs focus:outline-none focus:border-accentBlue text-slate-200"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue mx-auto"></div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Loading challenges...
            </span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          /* Empty Catalog State */
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl space-y-4">
            <Code className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Challenges Found</h3>
            <p className="text-xs text-slate-400">
              No practical coding tasks matched your selected filter criteria.
            </p>
          </div>
        ) : (
          /* Questions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((q) => {
              const isSolved = q.userProgress?.solved;
              const isAttempted = q.userProgress?.attempted && !isSolved;

              return (
                <div
                  key={q._id}
                  className="bg-darkCard border border-darkBorder hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="premium-shine rounded-3xl"></div>

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Category & Difficulty Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                          q.difficulty === 'easy'
                            ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                            : q.difficulty === 'medium'
                            ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
                            : 'text-rose-400 border-rose-500/25 bg-rose-500/10'
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Status / Solved Badge */}
                      {isSolved ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      ) : isAttempted ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          Attempted ({q.userProgress?.bestScore}%)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          {q.points || 100} pts
                        </span>
                      )}
                    </div>

                    {/* Challenge Title & Snippet */}
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-accentBlue transition-colors tracking-tight">
                        {q.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {q.description}
                      </p>
                    </div>

                    {/* Requirements Count & Tags */}
                    <div className="space-y-2 pt-2 border-t border-darkBorder/60">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accentBlue" />
                          <span>{q.requirements?.length || 0} Requirements</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>~{q.timeLimit || 20}m</span>
                        </span>
                      </div>

                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {q.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-darkBg border border-darkBorder px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-6 relative z-10">
                    <Link
                      to={`/web-development/${q.slug || q._id}`}
                      className="w-full bg-accentBtn hover:bg-accentBtnHover text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-accentBtn/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <span>{isSolved ? 'Review Solution' : 'Solve Challenge'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebDevHub;
