import React from 'react';

const RecruitmentTimeline = ({ stages }) => {
  if (!stages || stages.length === 0) return null;

  const sorted = [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="relative p-2">
      {sorted.map((stage, i) => (
        <div key={stage._id || i} className="flex items-start space-x-4 mb-6 last:mb-0">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-accentBlue border-2 border-accentBlue flex items-center justify-center shrink-0 z-10 shadow-lg shadow-accentBlue/20">
              <span className="text-white font-black text-[10px]">{i + 1}</span>
            </div>
            {i < sorted.length - 1 && (
              <div className="w-0.5 bg-gradient-to-b from-accentBlue to-darkBorder flex-1 min-h-6 mt-1" />
            )}
          </div>
          <div className="flex-1 pb-1">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">{stage.name}</h4>
            {stage.description && (
              <p className="text-slate-700 dark:text-slate-400 text-xs leading-relaxed">{stage.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecruitmentTimeline;
