import React from 'react';

const OddoCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    question = 'Which two grids share the exact same structural symmetry?',
    candidates = [],
    options = [],
  } = puzzle;

  const renderMiniMatrix = (grid) => {
    const colsCount = grid.length || 3;
    const is4x4 = colsCount === 4;

    return (
      <div
        className={`inline-grid border-2 border-slate-700 dark:border-slate-300 bg-white dark:bg-slate-900 rounded-lg overflow-hidden p-1 shadow-sm ${
          is4x4 ? 'grid-cols-4 gap-0.5' : 'grid-cols-3 gap-0.5'
        }`}
      >
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`${
                is4x4 ? 'w-5 h-5 sm:w-6 sm:h-6 text-[11px]' : 'w-7 h-7 sm:w-8 sm:h-8 text-sm'
              } flex items-center justify-center font-black text-slate-800 dark:text-slate-100`}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto py-1 select-none space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-base sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {question}
        </h2>
        <span className="text-[10px] font-bold text-accentBlue uppercase tracking-wider block">
          Structural Invariance & Matrix Topology
        </span>
      </div>

      {/* 4 Candidate Matrices (A, B, C, D) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full bg-slate-100 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-5 shadow-sm">
        {candidates.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">
              Grid {c.label}
            </span>
            {renderMiniMatrix(c.grid)}
          </div>
        ))}
      </div>

      {/* Answer Choices (Pairs: e.g. 'A and B', 'A and C') */}
      <div className="w-full grid grid-cols-2 gap-3.5">
        {options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;

          return (
            <button
              key={idx}
              disabled={feedbackState !== null}
              onClick={() => onSelectAnswer(opt)}
              className={`py-3.5 px-4 rounded-xl font-black text-sm sm:text-base border-2 transition-all cursor-pointer shadow-md ${
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

export default OddoCanvas;
