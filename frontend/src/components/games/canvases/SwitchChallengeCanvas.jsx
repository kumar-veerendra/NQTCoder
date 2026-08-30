import React from 'react';
import GeometricShape from '../common/GeometricShape';

const SwitchChallengeCanvas = ({
  puzzle,
  selectedAnswer,
  feedbackState,
  onSelectAnswer,
}) => {
  const { inputSequence = [], outputSequence = [], options = [] } = puzzle;

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-xl mx-auto py-2 space-y-6 sm:space-y-8 select-none">
      
      {/* ─── 1. TOP ROW: INPUT SHAPES (Elevated White Cards with Lime-Green Shapes) ─── */}
      <div className="flex flex-col items-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Input Sequence
        </span>
        <div className="flex items-center justify-center gap-2.5 sm:gap-4">
          {inputSequence.map((item, idx) => (
            <div
              key={idx}
              className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-white dark:bg-darkCard border-2 border-slate-200 dark:border-darkBorder shadow-lg flex items-center justify-center p-2.5 sm:p-3"
            >
              <GeometricShape
                symbol={item.symbol || item}
                shapeType={item.shapeType}
                color="#84cc16"
                className="w-10 h-10 sm:w-14 sm:h-14"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ─── 2. CENTER: GREEN DOUBLE ARROW WITH 4-CODE ANSWER PANEL ─── */}
      <div className="relative flex flex-col items-center justify-center w-full my-2">
        {/* Background Vertical Double Arrow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
          <svg viewBox="0 0 100 200" className="h-40 sm:h-48 text-lime-500 fill-current">
            {/* Top Arrowhead */}
            <polygon points="50,10 85,55 62,55 62,145 85,145 50,190 15,145 38,145 38,55 15,55" />
          </svg>
        </div>

        {/* Horizontal Row of 4 Code Options Buttons */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-lg px-2">
          {options.map((code, cIdx) => {
            const isSelected = selectedAnswer === code;

            return (
              <button
                key={cIdx}
                disabled={feedbackState !== null}
                onClick={() => onSelectAnswer(code)}
                className={`py-3.5 sm:py-4 px-3 rounded-2xl font-mono text-base sm:text-xl font-black tracking-widest border-2 transition-all cursor-pointer shadow-md ${
                  isSelected && feedbackState === 'correct'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-110 shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                    : isSelected && feedbackState === 'wrong'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-600 dark:text-rose-400 scale-95 shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/20'
                    : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder text-slate-800 dark:text-slate-100 hover:border-accentBlue hover:scale-105 active:scale-95'
                }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. BOTTOM ROW: OUTPUT SHAPES ─── */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center justify-center gap-2.5 sm:gap-4">
          {outputSequence.map((item, idx) => (
            <div
              key={idx}
              className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl bg-white dark:bg-darkCard border-2 border-slate-200 dark:border-darkBorder shadow-lg flex items-center justify-center p-2.5 sm:p-3"
            >
              <GeometricShape
                symbol={item.symbol || item}
                shapeType={item.shapeType}
                color="#84cc16"
                className="w-10 h-10 sm:w-14 sm:h-14"
              />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Transformed Output Sequence
        </span>
      </div>

    </div>
  );
};

export default SwitchChallengeCanvas;
