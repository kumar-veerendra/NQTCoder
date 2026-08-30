import React from 'react';
import GeometricShape from '../common/GeometricShape';

const GeoSudoCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const { grid = [], gridSize = 3, targetCell = {}, options = [] } = puzzle;

  return (
    <div className="flex flex-col items-center space-y-7 sm:space-y-9 w-full max-w-xl mx-auto py-2">
      {/* Capgemini Exact Header Prompt */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          Please choose the correct answer
        </h2>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
          Deductive Latin-Square ({gridSize}×{gridSize})
        </span>
      </div>

      {/* Grid Container matching the screenshot */}
      <div className="p-3 sm:p-4 bg-slate-200/80 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl shadow-xl inline-block">
        <div
          className="grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isTarget = cell === '?';

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center transition-all border ${
                    isTarget
                      ? 'bg-white dark:bg-slate-800 border-2 border-accentBlue shadow-lg scale-105 animate-pulse'
                      : cell === ''
                      ? 'bg-white/80 dark:bg-darkCard/40 border border-slate-300/80 dark:border-darkBorder/60 shadow-sm'
                      : 'bg-white dark:bg-darkCard border border-slate-300 dark:border-darkBorder shadow-md hover:shadow-lg'
                  }`}
                >
                  {isTarget ? (
                    <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 select-none">
                      ?
                    </span>
                  ) : cell !== '' ? (
                    <GeometricShape
                      symbol={cell}
                      className="w-10 h-10 sm:w-14 sm:h-14 transition-transform hover:scale-105"
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Shape Selection Palette matching the screenshot */}
      <div className="w-full space-y-3 text-center pt-2">
        <div className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
          {options.map((opt, oIdx) => {
            const isSelected = selectedAnswer === opt.symbol;
            return (
              <button
                key={oIdx}
                disabled={feedbackState !== null}
                onClick={() => onSelectAnswer(opt.symbol)}
                className={`w-18 h-18 sm:w-22 sm:h-22 p-3 sm:p-4 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer shadow-md ${
                  isSelected && feedbackState === 'correct'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 scale-110 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                    : isSelected && feedbackState === 'wrong'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 scale-95 shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/20'
                    : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder hover:border-accentBlue hover:scale-105 active:scale-95'
                }`}
                title={opt.name || opt.symbol}
              >
                <GeometricShape
                  symbol={opt.symbol}
                  shapeType={opt.shapeType}
                  className="w-10 h-10 sm:w-14 sm:h-14"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GeoSudoCanvas;
