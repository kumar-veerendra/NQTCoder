import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Layers, Brain, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS = {
  deductive: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  inductive: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  memory: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  spatial: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  numerical: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  classification: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  pattern: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const GameCard = ({ game }) => {
  const {
    name,
    slug,
    shortDescription,
    category = 'deductive',
    difficulty = 'Medium',
    totalLevels = 5,
    companyNames = [],
    progress = {},
  } = game;

  const unlocked = progress?.highestUnlockedLevel || 1;
  const completedCount = progress?.completedLevelsCount || 0;
  const bestScore = progress?.bestScore || 0;
  const bestAccuracy = progress?.bestAccuracy || 0;

  const categoryColorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.deductive;

  return (
    <div className="group relative bg-darkCard/90 hover:bg-darkCard border border-darkBorder hover:border-accentBlue/50 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-accentBlue/10 flex flex-col justify-between overflow-hidden">
      {/* Top ambient glow accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-accentBlue/5 rounded-full blur-3xl group-hover:bg-accentBlue/10 transition-all pointer-events-none" />

      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5 select-none">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${categoryColorClass}`}>
            {category}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-darkBg/80 px-2.5 py-1 rounded-md border border-darkBorder">
            {difficulty}
          </span>
        </div>

        {/* Title */}
        <Link to={`/games/${slug}`} className="block group-hover:text-accentBlue transition-colors">
          <h3 className="text-base sm:text-lg font-black text-white tracking-wide group-hover:text-accentBlue transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2rem]">
          {shortDescription}
        </p>

        {/* Company Association Tags */}
        <div className="mt-4 pt-3.5 border-t border-darkBorder/60 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported In:</span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {companyNames && companyNames.length > 0 ? (
              companyNames.map((cName, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-darkBg text-slate-300 border border-darkBorder"
                >
                  {cName}
                </span>
              ))
            ) : (
              <span className="text-[10px] font-bold text-slate-500">Placement Assessment</span>
            )}
          </div>
        </div>

        {/* Progress and Level Status */}
        <div className="mt-3.5 bg-darkBg/60 border border-darkBorder/80 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accentBlue" />
            <span className="text-[11px] font-bold text-slate-300">
              Levels: <span className="text-white">{unlocked}/{totalLevels}</span>
            </span>
          </div>
          {bestScore > 0 ? (
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>{bestScore.toLocaleString()} pts</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 uppercase">Not Played</span>
          )}
        </div>
      </div>

      {/* Action CTA Button */}
      <Link
        to={`/games/${slug}`}
        className="mt-5 w-full bg-accentBtn/15 hover:bg-accentBtn text-accentBlue hover:text-white border border-accentBlue/30 hover:border-accentBtn py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
      >
        <span>Practice Game</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
};

export default GameCard;
