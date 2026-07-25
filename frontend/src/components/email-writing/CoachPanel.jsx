import React from 'react';
import { Sparkles } from 'lucide-react';

export const CoachPanel = ({ coachingSteps }) => {
  if (!coachingSteps || coachingSteps.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs">
        No coaching steps generated. Your email might already be near-perfect!
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans select-none text-xs">
      <div className="flex items-center gap-2 text-violet-400">
        <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
        <h4 className="font-extrabold uppercase tracking-wider text-white">Line-by-Line Coach Insights</h4>
      </div>
      <div className="space-y-3">
        {coachingSteps.map((step, idx) => (
          <div key={idx} className="bg-darkCard border border-darkBorder rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original sentence block */}
              <div className="space-y-1">
                <span className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Original</span>
                <p className="text-slate-400 font-mono italic leading-relaxed pt-1">"{step.originalSentence}"</p>
              </div>

              {/* Improved sentence block */}
              <div className="space-y-1">
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Improved</span>
                <p className="text-emerald-300 font-mono leading-relaxed pt-1">"{step.improvedSentence}"</p>
              </div>
            </div>

            {/* Explanation banner */}
            <div className="border-t border-darkBorder/30 pt-2 flex items-start gap-1.5 text-slate-400 leading-relaxed text-[11px]">
              <span className="text-accentBlue font-bold shrink-0">Reason:</span>
              <span>{step.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachPanel;
