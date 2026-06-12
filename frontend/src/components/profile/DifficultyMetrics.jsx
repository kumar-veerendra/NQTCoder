import React from 'react';
import { CircleDot } from 'lucide-react';

const DifficultyMetrics = ({ solvedCount = {}, difficultyTotals = {} }) => {
  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
        <CircleDot className="w-4 h-4 text-accentBlue mr-2" /> Difficulty Metrics
      </h3>

      <div className="space-y-4">
        {/* Easy Solved Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-emerald-400">Easy</span>
            <span className="text-slate-300 font-mono">
              {solvedCount.easy || 0} / {difficultyTotals.easy || 0} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded transition-all duration-500" 
              style={{ width: `${(difficultyTotals.easy || 0) > 0 ? Math.min(((solvedCount.easy || 0) / difficultyTotals.easy) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Medium Solved Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-amber-400">Medium</span>
            <span className="text-slate-300 font-mono">
              {solvedCount.medium || 0} / {difficultyTotals.medium || 0} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded transition-all duration-500" 
              style={{ width: `${(difficultyTotals.medium || 0) > 0 ? Math.min(((solvedCount.medium || 0) / difficultyTotals.medium) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Hard Solved Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-rose-400">Hard</span>
            <span className="text-slate-300 font-mono">
              {solvedCount.hard || 0} / {difficultyTotals.hard || 0} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded transition-all duration-500" 
              style={{ width: `${(difficultyTotals.hard || 0) > 0 ? Math.min(((solvedCount.hard || 0) / difficultyTotals.hard) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyMetrics;
