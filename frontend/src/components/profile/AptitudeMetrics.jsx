import React from 'react';
import { Target, Zap, BarChart2, Clock, BookOpen } from 'lucide-react';

const AptitudeMetrics = ({ progress = [] }) => {
  // Sum solved and total questions per section
  const quantSolved = progress.filter(p => p.section === 'quant').reduce((sum, p) => sum + (p.solved || 0), 0);
  const quantTotal = progress.filter(p => p.section === 'quant').reduce((sum, p) => sum + (p.totalQuestions || 0), 0);
  
  const logicalSolved = progress.filter(p => p.section === 'logical').reduce((sum, p) => sum + (p.solved || 0), 0);
  const logicalTotal = progress.filter(p => p.section === 'logical').reduce((sum, p) => sum + (p.totalQuestions || 0), 0);

  const verbalSolved = progress.filter(p => p.section === 'verbal').reduce((sum, p) => sum + (p.solved || 0), 0);
  const verbalTotal = progress.filter(p => p.section === 'verbal').reduce((sum, p) => sum + (p.totalQuestions || 0), 0);

  // Overall accuracy and average time
  const averageAccuracy = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + (p.accuracy || 0), 0) / progress.length)
    : 0;

  const averageTime = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + (p.averageTime || 0), 0) / progress.length)
    : 0;

  const quantPercent = quantTotal > 0 ? Math.round((quantSolved / quantTotal) * 100) : 0;
  const logicalPercent = logicalTotal > 0 ? Math.round((logicalSolved / logicalTotal) * 100) : 0;
  const verbalPercent = verbalTotal > 0 ? Math.round((verbalSolved / verbalTotal) * 100) : 0;

  return (
    <div className="bg-darkCard border border-darkBorder rounded-lg p-5 space-y-4 shadow-sm">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center select-none">
        <Target className="w-4 h-4 text-accentBlue mr-2" /> Aptitude & Reasoning Progress
      </h3>

      <div className="space-y-4">
        {/* Quant Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-accentBlue flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Quantitative Aptitude
            </span>
            <span className="text-slate-300 font-mono">
              {quantSolved} / {quantTotal} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-accentBlue h-full rounded transition-all duration-500" 
              style={{ width: `${quantPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Logical Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-purple-400 flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" /> Logical Reasoning
            </span>
            <span className="text-slate-300 font-mono">
              {logicalSolved} / {logicalTotal} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded transition-all duration-500" 
              style={{ width: `${logicalPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Verbal Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold select-none">
            <span className="text-pink-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Verbal Ability
            </span>
            <span className="text-slate-300 font-mono">
              {verbalSolved} / {verbalTotal} Solved
            </span>
          </div>
          <div className="w-full bg-darkBg border border-darkBorder h-2 rounded overflow-hidden">
            <div 
              className="bg-pink-500 h-full rounded transition-all duration-500" 
              style={{ width: `${verbalPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Mini stats footer */}
        {progress.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-darkBorder/40 text-[10px] text-slate-500 font-semibold uppercase tracking-wider select-none">
            <div className="bg-darkBg/30 border border-darkBorder/40 p-2 rounded-lg text-center">
              <div className="text-white text-xs font-black mb-0.5">{averageAccuracy}%</div>
              <span>Accuracy</span>
            </div>
            <div className="bg-darkBg/30 border border-darkBorder/40 p-2 rounded-lg text-center">
              <div className="text-white text-xs font-black mb-0.5 flex items-center justify-center gap-0.5">
                <Clock className="w-3 h-3 text-slate-500" /> {averageTime}s
              </div>
              <span>Avg Speed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeMetrics;
