import React from 'react';

const SameRuleCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    examples = [],
    options = [],
    ruleName = 'Pattern Relationship',
  } = puzzle;

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto py-2 select-none space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          These examples follow a hidden rule:
        </h2>
        <span className="text-[10px] font-bold text-accentBlue uppercase tracking-wider block">
          Rule Transfer & Sequence Relationship
        </span>
      </div>

      {/* Examples Stack */}
      <div className="w-full bg-slate-100 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
        {examples.map((ex, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white dark:bg-darkCard border border-slate-300 dark:border-darkBorder px-4 py-2.5 rounded-xl shadow-xs"
          >
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">
              Example {idx + 1}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-widest">
              {ex}
            </div>
          </div>
        ))}
      </div>

      {/* Question Prompt */}
      <div className="text-center space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
          Which option follows the EXACT same rule?
        </h3>
      </div>

      {/* 4 Candidate Options */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;

          return (
            <button
              key={idx}
              disabled={feedbackState !== null}
              onClick={() => onSelectAnswer(opt)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center font-black text-lg sm:text-xl tracking-widest shadow-md ${
                isSelected && feedbackState === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-103 ring-4 ring-emerald-500/25'
                  : isSelected && feedbackState === 'wrong'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 scale-98 ring-4 ring-rose-500/25'
                  : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder text-slate-800 dark:text-slate-100 hover:border-accentBlue hover:scale-102 active:scale-98'
              }`}
            >
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default SameRuleCanvas;
