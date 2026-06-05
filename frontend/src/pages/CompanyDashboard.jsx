import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import * as questionService from '../services/questionService';
import { AuthContext } from '../context/AuthContext';
import { Search, Shield, Filter, Code2, Tag, BookOpen, Layers, CheckCircle } from 'lucide-react';

const COMPANIES = ['TCS', 'Infosys', 'Accenture', 'Wipro', 'Cognizant', 'Capgemini', 'HCL'];
const TOPICS = [
  'Arrays', 'Strings', 'Sorting', 'Searching', 'Pattern',
  'Recursion', 'Math', 'HashMap', 'Matrix', 'Greedy', 'Miscellaneous'
];

const CompanyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [selectedCompany, selectedTopic, selectedDifficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await questionService.getQuestions({
        company: selectedCompany,
        topic: selectedTopic,
        difficulty: selectedDifficulty
      });
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch coding challenges. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCompany('');
    setSelectedTopic('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  // Local client filtering for instant search box
  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Easy-Medium':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/25';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Medium-Hard':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/25';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const isSolved = (questionId) => {
    return user?.solvedQuestions?.includes(questionId) || false;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 bg-darkBg text-slate-100 min-h-screen">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-darkBorder">
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-accentBlue" />
            Problem Set
          </h1>
          <p className="text-slate-400 text-xs">
            Prepare for top placement exams. Practice challenges from service-based companies.
          </p>
        </div>
        <div className="flex items-center space-x-6 mt-4 md:mt-0 text-xs font-semibold text-slate-400 select-none">
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-lg">
            Solved: <span className="text-emerald-400 font-bold">{user?.solvedQuestions?.length || 0}</span>
          </div>
          <div className="bg-darkCard border border-darkBorder px-3.5 py-1.5 rounded-lg">
            Total Challenges: <span className="text-accentBlue font-bold">{questions.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 py-2 select-none">
        
        {/* Search Input Box */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full bg-darkCard border border-darkBorder pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-accentBlue text-slate-200 transition-colors"
          />
        </div>

        {/* Company Dropdown */}
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-accentBlue cursor-pointer transition-colors"
        >
          <option value="">All Companies</option>
          {COMPANIES.map((comp) => (
            <option key={comp} value={comp}>{comp}</option>
          ))}
        </select>

        {/* Topic Dropdown */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-accentBlue cursor-pointer transition-colors"
        >
          <option value="">All Topics</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>

        {/* Difficulty Dropdown */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-darkCard border border-darkBorder px-3 py-1.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-accentBlue cursor-pointer transition-colors"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Easy-Medium">Easy-Medium</option>
          <option value="Medium">Medium</option>
          <option value="Medium-Hard">Medium-Hard</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Clear Filter Trigger */}
        {(selectedCompany || selectedTopic || selectedDifficulty || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-accentBlue hover:text-accentBlue/90 font-bold transition-colors select-none ml-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 3. Question Listing Panel (Full Width) */}
      <div className="bg-darkCard border border-darkBorder rounded-lg overflow-hidden shadow-sm">
        {error && (
          <div className="p-6 text-center text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue"></div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Syncing Challenge Library...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs font-bold">No questions match the active query.</div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-accentBlue hover:text-accentBlue/90 font-bold underline transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-darkBg/30 border-b border-darkBorder text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-6 w-16 text-center">Status</th>
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Topic</th>
                  <th className="py-3 px-6">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {filteredQuestions.map((q) => (
                  <tr
                    key={q._id}
                    className="hover:bg-darkBg/20 transition-colors group"
                  >
                    <td className="py-3.5 px-6 text-center select-none">
                      {isSolved(q._id) ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 mx-auto"></div>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <Link
                        to={`/problem/${q._id}`}
                        className="text-xs font-bold text-slate-200 hover:text-accentBlue transition-colors tracking-wide"
                      >
                        {q.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-6 select-none">
                      <div className="flex gap-1.5 flex-wrap">
                        {q.company.map((c) => (
                          <span
                            key={c}
                            className="text-[9px] font-bold bg-darkBg border border-darkBorder px-1.5 py-0.5 rounded text-slate-400 group-hover:border-accentBlue/25 transition-all"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 select-none">
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Tag className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
                        {q.topic}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 select-none">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyBadge(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CompanyDashboard;
