import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, Target, Zap, Layers, Flame, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import * as gameService from '../../services/gameService';

const GamePerformanceCard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await gameService.getUserAllGamesStats();
      setStatsData(data);
    } catch (err) {
      console.error('Error fetching profile game stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-darkCard border border-darkBorder rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accentBlue" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Retrieving Game Performance...
        </span>
      </div>
    );
  }

  const summary = statsData?.summary || {
    totalXP: 0,
    totalGamesPlayed: 0,
    totalLevelsCompleted: 0,
    totalChallengesSolved: 0,
    overallAccuracy: 0,
    bestStreak: 0,
  };

  const gamesProgress = statsData?.gamesProgress || [];
  const recentAttempts = statsData?.recentAttempts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-darkBorder pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-accentBlue" />
            <span>Placement Cognitive Game Performance</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Performance analytics across Cognizant, Capgemini & placement cognitive assessment games
          </p>
        </div>
        <Link
          to="/games"
          className="text-[10px] font-black uppercase tracking-wider text-accentBlue hover:text-accentBlueHover flex items-center gap-1"
        >
          <span>Explore Arcade</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total XP */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Total XP</span>
          </div>
          <span className="text-base font-black text-purple-400">+{summary.totalXP.toLocaleString()}</span>
        </div>

        {/* Levels Completed */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Levels Mastered</span>
          </div>
          <span className="text-base font-black text-white">{summary.totalLevelsCompleted}</span>
        </div>

        {/* Challenges Solved */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
            <span>Challenges</span>
          </div>
          <span className="text-base font-black text-white">{summary.totalChallengesSolved}</span>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Target className="w-3 h-3 text-amber-400" />
            <span>Accuracy</span>
          </div>
          <span className="text-base font-black text-amber-400">{summary.overallAccuracy}%</span>
        </div>

        {/* Best Streak */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Best Streak</span>
          </div>
          <span className="text-base font-black text-rose-400">{summary.bestStreak} 🔥</span>
        </div>

        {/* Games Active */}
        <div className="bg-darkCard border border-darkBorder rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Gamepad2 className="w-3 h-3 text-indigo-400" />
            <span>Games Played</span>
          </div>
          <span className="text-base font-black text-white">{summary.totalGamesPlayed}</span>
        </div>
      </div>

      {/* Per-Game Progress Grid */}
      {gamesProgress.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Per-Game Progress</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamesProgress.map((p) => {
              const gameObj = p.gameId || {};
              return (
                <div
                  key={p._id}
                  className="bg-darkCard border border-darkBorder hover:border-accentBlue/40 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{gameObj.name || p.gameSlug}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-darkBg text-slate-400 border border-darkBorder">
                        Level {p.highestUnlockedLevel}/5
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Best: <strong className="text-amber-400">{p.bestScore} pts</strong></span>
                      <span>Acc: <strong className="text-emerald-400">{p.bestAccuracy}%</strong></span>
                    </div>
                  </div>

                  <Link
                    to={`/games/${gameObj.slug || p.gameSlug}`}
                    className="bg-accentBtn/15 hover:bg-accentBtn text-accentBlue hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                  >
                    Play
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-3">
          <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-xs font-bold text-white uppercase">No placement games played yet</h4>
          <p className="text-xs text-slate-400">
            Start solving cognitive games like Geo-Sudo to build your placement aptitude score.
          </p>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 bg-accentBtn hover:bg-accentBtnHover text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
          >
            <span>Play First Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Game Attempts */}
      {recentAttempts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Recent Game Activity</h4>
          <div className="bg-darkCard border border-darkBorder rounded-2xl divide-y divide-darkBorder overflow-hidden">
            {recentAttempts.map((att) => (
              <div key={att._id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      att.passed ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-white">{att.gameId?.name || att.gameSlug}</span>
                    <span className="text-slate-400 ml-2 text-[11px]">Level {att.levelNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-bold">
                  <span className="text-amber-400">{att.score} pts</span>
                  <span className={att.passed ? 'text-emerald-400' : 'text-rose-400'}>
                    {att.accuracy}% Acc
                  </span>
                  <span className="text-slate-500 hidden sm:inline">
                    {new Date(att.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePerformanceCard;
