import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Brain, Zap, Target, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import GameCard from '../../components/games/GameCard';
import * as gameService from '../../services/gameService';
import SEO from '../../components/SEO';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Games' },
  { id: 'cognizant', label: 'Cognizant' },
  { id: 'capgemini', label: 'Capgemini' },
  { id: 'deductive', label: 'Deductive' },
  { id: 'inductive', label: 'Inductive' },
  { id: 'memory', label: 'Memory' },
  { id: 'spatial', label: 'Spatial' },
  { id: 'numerical', label: 'Numerical' },
];

const GamesHub = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    fetchGamesData();
  }, []);

  const fetchGamesData = async () => {
    setLoading(true);
    setError('');
    try {
      const [gamesData, statsData] = await Promise.all([
        gameService.getGames(),
        gameService.getUserAllGamesStats(),
      ]);
      setGames(gamesData || []);
      setUserStats(statsData?.summary || null);
    } catch (err) {
      console.error('Error fetching games hub:', err);
      setError('Could not load games at this time.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'cognizant') {
      return (game.companyNames || []).some((c) => c.toLowerCase().includes('cognizant'));
    }
    if (selectedFilter === 'capgemini') {
      return (game.companyNames || []).some((c) => c.toLowerCase().includes('capgemini'));
    }
    return game.category?.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEO
        title="Cognitive & Game-Based Assessment Practice | NQTCoder"
        description="Practice game-based aptitude challenges reported in Cognizant, Capgemini, and top placement assessments: Geo-Sudo, Grid Memory, Switch Challenge, and more."
        path="/games"
      />

      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-darkCard via-darkCard/90 to-darkBg border border-darkBorder p-6 sm:p-10 mb-10 overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentBlue/15 border border-accentBlue/30 text-accentBlue text-xs font-black uppercase tracking-wider mb-4">
            <Gamepad2 className="w-4 h-4 text-accentBlue" />
            <span>Placement Assessment Arcade</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Game-Based <span className="text-accentBlue">Cognitive Aptitude</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed font-medium">
            Practice cognitive and game-based assessment formats commonly reported in{' '}
            <strong className="text-white">Cognizant</strong>, <strong className="text-white">Capgemini</strong>, and top placement drives. Improve accuracy, speed, memory, and reasoning through multi-level procedural challenges.
          </p>

          {/* Quick Metrics Bar if user has stats */}
          {userStats && (userStats.totalXP > 0 || userStats.totalChallengesSolved > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-darkBorder/60">
              <div className="bg-darkBg/60 border border-darkBorder rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Arcade XP</span>
                <span className="text-lg font-black text-purple-400">+{userStats.totalXP} XP</span>
              </div>
              <div className="bg-darkBg/60 border border-darkBorder rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Levels Mastered</span>
                <span className="text-lg font-black text-emerald-400">{userStats.totalLevelsCompleted}</span>
              </div>
              <div className="bg-darkBg/60 border border-darkBorder rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Challenges Solved</span>
                <span className="text-lg font-black text-sky-400">{userStats.totalChallengesSolved}</span>
              </div>
              <div className="bg-darkBg/60 border border-darkBorder rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Best Streak</span>
                <span className="text-lg font-black text-amber-400">{userStats.bestStreak} 🔥</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-thin select-none">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-accentBtn text-white shadow-lg shadow-accentBlue/20'
                  : 'bg-darkCard text-slate-400 hover:text-white border border-darkBorder hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search games or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-darkCard border border-darkBorder rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accentBlue transition-colors"
          />
        </div>
      </div>

      {/* Game Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Loading Cognitive Game Catalog...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-darkCard border border-darkBorder rounded-2xl p-6">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchGamesData}
            className="bg-accentBtn hover:bg-accentBtnHover text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-darkCard border border-darkBorder rounded-2xl p-8 space-y-3">
          <Brain className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No games found</h3>
          <p className="text-xs text-slate-400">Try adjusting your category filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game._id || game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesHub;
