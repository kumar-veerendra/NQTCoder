import React from 'react';
import { Award, Lock } from 'lucide-react';

const BadgesList = ({ badges = [] }) => {
  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4 overflow-visible">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
        <Award className="w-4 h-4 text-accentBlue mr-2" /> Badges & Achievements
      </h3>

      <div className="grid grid-cols-2 gap-3 overflow-visible">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative group border rounded-xl p-3 bg-gradient-to-br transition-all duration-300 flex flex-col items-center justify-center text-center select-none badge-card hover:z-50 ${badge.color}`}
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
    </div>
  );
};

export default BadgesList;
