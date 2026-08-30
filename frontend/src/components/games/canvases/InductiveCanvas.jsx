import React, { useState, useEffect } from 'react';
import GeometricShape from '../common/GeometricShape';

const InductiveCanvas = ({
  puzzle,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    exampleGrid1 = [],
    exampleGrid2 = [],
    choices = [],
    correctIndices = [],
    correctAnswer = '',
  } = puzzle;

  // Track which 2 choices are selected: array of choice IDs [0, 1]
  const [selectedChoices, setSelectedChoices] = useState([]);

  useEffect(() => {
    setSelectedChoices([]);
  }, [puzzle]);

  const handleGridClick = (choiceId) => {
    if (feedbackState !== null) return;

    let updated = [];
    if (selectedChoices.includes(choiceId)) {
      updated = selectedChoices.filter((id) => id !== choiceId);
    } else {
      if (selectedChoices.length < 2) {
        updated = [...selectedChoices, choiceId];
      } else {
        // If already 2 selected, replace the 2nd one
        updated = [selectedChoices[0], choiceId];
      }
    }

    setSelectedChoices(updated);

    // If 2 grids are now selected, check answer
    if (updated.length === 2) {
      const sortedSelected = [...updated].sort((a, b) => a - b).join(',');
      const isCorrect = sortedSelected === correctAnswer;

      setTimeout(() => {
        onSelectAnswer(isCorrect ? correctAnswer : 'wrong');
      }, 400);
    }
  };

  // Helper to render a 3x3 mini grid
  const render3x3Matrix = (grid, sizeClasses = 'w-9 h-9 sm:w-11 sm:h-11') => {
    return (
      <div className="inline-grid grid-cols-3 border-2 border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`${sizeClasses} border border-slate-400 dark:border-slate-700 flex items-center justify-center p-1 sm:p-1.5`}
            >
              {cell && (
                <GeometricShape
                  symbol={cell.symbol}
                  shapeType={cell.shapeType}
                  color={cell.color}
                  className="w-full h-full"
                />
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-1 select-none space-y-4">
      
      {/* ─── DUAL SPLIT SCREEN: LEFT EXAMPLE VS RIGHT CHOICES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 w-full items-stretch">
        
        {/* ─── LEFT PANEL: THE 2 EXAMPLE RULE GRIDS ─── */}
        <div className="lg:col-span-5 bg-slate-100/90 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between space-y-4 shadow-sm">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 text-center tracking-tight">
            These two grids follow a rule.
          </h3>

          <div className="flex flex-col items-center gap-4 sm:gap-6 my-auto">
            {/* Example Grid 1 (Top) */}
            <div className="flex flex-col items-center">
              {render3x3Matrix(exampleGrid1, 'w-11 h-11 sm:w-13 sm:h-13')}
            </div>

            {/* Transform Arrow */}
            <div className="text-accentBlue font-black text-xs uppercase tracking-wider flex items-center gap-1">
              <span>↓ Transforms to ↓</span>
            </div>

            {/* Example Grid 2 (Bottom) */}
            <div className="flex flex-col items-center">
              {render3x3Matrix(exampleGrid2, 'w-11 h-11 sm:w-13 sm:h-13')}
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL: WHICH TWO FOLLOW THE SAME RULE? (4 CHOICES) ─── */}
        <div className="lg:col-span-7 bg-slate-100/90 dark:bg-darkBg/90 border border-slate-300 dark:border-darkBorder rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-between space-y-4 shadow-sm">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Which two of these grids follow the same rule?
            </h3>
            <span className="text-[10px] font-bold text-accentBlue uppercase tracking-wider block">
              Tap 2 grids ({selectedChoices.length}/2 selected)
            </span>
          </div>

          {/* 2x2 Grid of Candidate Grids */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-md mx-auto my-auto">
            {choices.map((choice) => {
              const isSelected = selectedChoices.includes(choice.id);

              return (
                <button
                  key={choice.id}
                  disabled={feedbackState !== null}
                  onClick={() => handleGridClick(choice.id)}
                  className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm ${
                    isSelected && feedbackState === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-4 ring-emerald-500/25 scale-103'
                      : isSelected && feedbackState === 'wrong'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-4 ring-rose-500/25 scale-98'
                      : isSelected
                      ? 'bg-white dark:bg-slate-800 border-accentBlue ring-4 ring-accentBlue/25 scale-102 shadow-md'
                      : 'bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-darkBorder hover:border-slate-400 hover:scale-101 active:scale-98'
                  }`}
                >
                  {render3x3Matrix(choice.grid, 'w-8 h-8 sm:w-10 sm:h-10')}
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-wider">
                    Grid {choice.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default InductiveCanvas;
