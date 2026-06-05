import React, { useState, useEffect } from 'react';
import * as executionService from '../services/executionService';
import { Trophy, Award, Search, Sparkles } from 'lucide-react';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await executionService.getLeaderboard();
      setRankings(data);
    } catch (err) {
      console.error(err);
      setError('Could not download global rank metrics. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = rankings.filter((r) =>
    r.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/20 w-7 h-7 rounded-lg font-black text-xs">
          🥇
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center bg-slate-400/10 text-slate-300 border border-slate-400/20 w-7 h-7 rounded-lg font-black text-xs">
          🥈
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center bg-amber-700/10 text-amber-600 border border-amber-700/20 w-7 h-7 rounded-lg font-black text-xs">
          🥉
        </div>
      );
    }
    return (
      <span className="text-xs text-slate-400 font-mono font-bold pl-2.5">
        {rank}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 bg-darkBg text-slate-100">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-darkCard border border-darkBorder p-6 rounded-lg flex items-center justify-between shadow">
        <div className="space-y-2">
          <div className="text-[10px] text-accentBlue uppercase font-black tracking-widest flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Global Hall of Fame
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            Leaderboard Rankings
          </h1>
          <p className="text-slate-400 text-xs max-w-md">
            Rankings are determined by total questions solved. Ties are broken by fewer compilation attempts.
          </p>
        </div>
        <Trophy className="w-12 h-12 text-slate-600 opacity-30 shrink-0" />
      </div>

      {/* 2. Top Controls & Listing table */}
      <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4">
        
        {/* Search bar */}
        <div className="relative max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username..."
            className="w-full bg-darkBg border border-darkBorder pl-9 pr-3 py-1.5 rounded-md text-xs focus:outline-none focus:border-accentBlue text-slate-200"
          />
        </div>

        {error && (
          <div className="text-center p-6 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accentBlue"></div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sorting rankings...</span>
          </div>
        ) : filteredRankings.length === 0 ? (
          <div className="text-center p-12 text-slate-500 text-xs font-bold uppercase tracking-wider">
            No coders found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-darkBorder/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-darkBg/60 border-b border-darkBorder/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-6 w-20 text-center">Rank</th>
                  <th className="py-3 px-6">Coder</th>
                  <th className="py-3 px-6 text-center">Questions Solved</th>
                  <th className="py-3 px-6 text-center font-mono">Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {filteredRankings.map((userRow, index) => (
                  <tr
                    key={userRow._id}
                    className="hover:bg-darkBg/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(index + 1)}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-200 text-sm tracking-wide">
                      {userRow.username}
                    </td>
                    <td className="py-3.5 px-6 text-center text-sm font-bold text-accentBlue">
                      {userRow.solvedQuestionsCount}
                    </td>
                    <td className="py-3.5 px-6 text-center text-xs text-slate-400 font-mono">
                      {userRow.submissionsCount}
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

export default Leaderboard;
