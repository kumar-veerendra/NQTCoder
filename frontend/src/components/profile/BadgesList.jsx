import React, { useState } from 'react';
import { Award, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const BadgesList = ({ badges = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to determine responsive class based on index
  const getResponsiveClass = (index) => {
    if (isExpanded) return 'block';

    // Show 2 full rows on each screen size
    if (index < 4) return 'block'; // Mobile (2 cols * 2 rows = 4 items)
    if (index < 6) return 'hidden sm:block'; // Tablet (3 cols * 2 rows = 6 items)
    if (index < 8) return 'hidden md:block'; // Desktop MD (4 cols * 2 rows = 8 items)
    if (index < 10) return 'hidden lg:block'; // Desktop LG (5 cols * 2 rows = 10 items)
    return 'hidden'; // Hide anything past 2 rows
  };

  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-5 overflow-visible">
      <div className="flex justify-between items-center select-none">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
          <Award className="w-4 h-4 text-accentBlue mr-2" /> Badges & Achievements
        </h3>
        <span className="text-[10px] text-slate-500 font-bold bg-darkBg border border-darkBorder px-2 py-0.5 rounded">
          Total: {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-visible">
        {badges.map((badge, index) => (
          <div 
            key={badge.id}
            className={`${getResponsiveClass(index)} relative group border rounded-xl p-3 bg-gradient-to-br transition-all duration-300 flex flex-col items-center justify-center text-center select-none badge-card hover:z-50 ${badge.color}`}
          >
            {/* Premium shimmer overlay */}
            <div className="premium-shine rounded-xl"></div>
            
            {/* Icon Container */}
            <div className={`p-2 rounded-full mb-1.5 bg-darkBg/60 border border-slate-700/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-current relative z-10 ${badge.isUnlocked ? 'animate-pulse-slow' : ''}`}>
              {badge.icon}
              {!badge.isUnlocked && (
                <div className="absolute -bottom-1 -right-1 bg-slate-950 p-0.5 rounded-full border border-slate-800 text-slate-500 flex items-center justify-center">
                  <Lock className="w-2 h-2" />
                </div>
              )}
            </div>

            {/* Text labels */}
            <div className="text-[11px] font-black tracking-wide truncate max-w-full leading-tight relative z-10">
              {badge.title}
            </div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full mt-0.5 relative z-10">
              {badge.subtitle}
            </div>

            {/* Status Label */}
            <div className="mt-1 text-[8px] font-bold select-none relative z-10">
              {badge.isUnlocked ? (
                <span className="flex items-center justify-center text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  Unlocked
                </span>
              ) : (
                <span className="text-slate-500 flex items-center justify-center">
                  Locked
                </span>
              )}
            </div>

            {/* Premium Tooltip */}
            <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-48 bg-slate-950/95 border border-slate-800 rounded-lg p-2.5 shadow-2xl pointer-events-none transition-all duration-200 backdrop-blur-sm text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-white text-[10px] tracking-wide">{badge.title}</span>
                <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${badge.isUnlocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700/20'}`}>
                  {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <p className="text-[9px] text-slate-300 leading-normal font-medium">{badge.desc}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex justify-center select-none">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-darkBg hover:bg-darkCard text-slate-300 hover:text-white border border-darkBorder px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow hover:shadow-lg"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Less Badges</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>View All Badges ({badges.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BadgesList;
