import React from 'react';

const DigitChallengeCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const { target = 0, digits = [], options = [] } = puzzle;

  return (
    <div className="flex flex-col items-center space-y-6 sm:space-y-8 w-full max-w-lg mx-auto py-2 select-none">
      {/* Target Banner */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-accentBlue">
          Target Number
        </span>
        <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 px-8 py-3 rounded-2xl inline-block shadow-lg">
          {target}
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Combine single-use digits: <strong className="text-slate-800 dark:text-white">[{digits.join(', ')}]</strong>
        </p>
      </div>

      {/* Equation Option Choices */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt, oIdx) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={oIdx}
              disabled={feedbackState !== null}
              onClick={() => onSelectAnswer(opt)}
              className={`p-4 rounded-2xl text-xs sm:text-sm font-black tracking-wide border-2 transition-all cursor-pointer shadow-md ${
                isSelected && feedbackState === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/25 scale-102 ring-4 ring-emerald-500/20'
                  : isSelected && feedbackState === 'wrong'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/25 scale-98 ring-4 ring-rose-500/20'
                  : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder text-slate-800 dark:text-slate-100 hover:border-accentBlue hover:scale-101 active:scale-98'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DigitChallengeCanvas;
