import React from 'react';

const DoesntFitCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const { question = 'Identify the figure that DOES NOT fit the rule:', options = [] } = puzzle;

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-lg mx-auto py-2 select-none">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-black uppercase tracking-widest text-rose-500">
          Anomaly & Outlier Detection
        </span>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
          {question}
        </h3>
      </div>

      {/* Options Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt, oIdx) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={oIdx}
              disabled={feedbackState !== null}
              onClick={() => onSelectAnswer(opt)}
              className={`p-4 rounded-2xl text-xs sm:text-sm font-black tracking-wide border-2 transition-all cursor-pointer text-left flex items-center justify-between shadow-md ${
                isSelected && feedbackState === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-102 ring-4 ring-emerald-500/25'
                  : isSelected && feedbackState === 'wrong'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 scale-98 ring-4 ring-rose-500/25'
                  : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder text-slate-800 dark:text-slate-100 hover:border-accentBlue'
              }`}
            >
              <span>{opt}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-100 dark:bg-darkBg border border-slate-300 dark:border-darkBorder">
                Option {String.fromCharCode(65 + oIdx)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoesntFitCanvas;
