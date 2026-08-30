import React from 'react';

const ColourGridCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    examples = [],
    testGrid = [],
    options = ['Orange', 'Blue'],
  } = puzzle;

  const renderGridMatrix = (grid, isOrange) => {
    return (
      <div
        className={`p-2 rounded-xl border-2 transition-all shadow-sm ${
          isOrange
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
            : 'bg-blue-500/10 border-blue-500/40 text-blue-500'
        }`}
      >
        <div className="grid grid-cols-4 gap-1">
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center font-black text-xs sm:text-sm border ${
                  isOrange
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-300'
                    : 'bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-300'
                }`}
              >
                {cell}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderTestGrid = (grid) => {
    return (
      <div className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-600 rounded-2xl shadow-xl">
        <div className="grid grid-cols-4 gap-1.5">
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-black text-base sm:text-lg text-slate-800 dark:text-slate-100"
              >
                {cell}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-1 select-none space-y-6">
      
      {/* ─── DUAL PANEL: EXAMPLES ON LEFT, TEST TARGET ON RIGHT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 w-full items-center">
        
        {/* LEFT PANEL: 4 COLORED EXAMPLE GRIDS */}
        <div className="lg:col-span-6 bg-slate-100 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-6 space-y-3 shadow-sm">
          <div className="text-center space-y-0.5">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Study the Colored Example Grids
            </h3>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Discover the rule separating Orange vs Blue
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {examples.map((ex, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    ex.color === 'Orange'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {ex.color} Grid
                </span>
                {renderGridMatrix(ex.grid, ex.color === 'Orange')}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: TEST GRID TO CLASSIFY */}
        <div className="lg:col-span-6 bg-slate-100 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between space-y-5 shadow-sm">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              What color should this grid be?
            </h3>
            <span className="text-[10px] font-bold text-accentBlue uppercase tracking-wider block">
              Apply the discovered rule
            </span>
          </div>

          {/* Test Target Grid */}
          <div className="flex items-center justify-center">
            {renderTestGrid(testGrid)}
          </div>

          {/* Color Action Buttons (Orange / Blue) */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            {options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isOrange = opt === 'Orange';

              return (
                <button
                  key={idx}
                  disabled={feedbackState !== null}
                  onClick={() => onSelectAnswer(opt)}
                  className={`py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider border-2 transition-all cursor-pointer shadow-md ${
                    isOrange
                      ? isSelected && feedbackState === 'correct'
                        ? 'bg-amber-500 border-amber-400 text-white ring-4 ring-amber-500/30 scale-105'
                        : isSelected && feedbackState === 'wrong'
                        ? 'bg-rose-500 border-rose-400 text-white scale-95 ring-4 ring-rose-500/30'
                        : 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 hover:scale-103'
                      : isSelected && feedbackState === 'correct'
                      ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/30 scale-105'
                      : isSelected && feedbackState === 'wrong'
                      ? 'bg-rose-500 border-rose-400 text-white scale-95 ring-4 ring-rose-500/30'
                      : 'bg-blue-600 hover:bg-blue-700 border-blue-700 text-white hover:scale-103'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ColourGridCanvas;
