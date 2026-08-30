import React, { useState, useEffect } from 'react';
import { Eye, Brain, CheckCircle2 } from 'lucide-react';

const GridMemoryCanvas = ({
  puzzle,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    gridSize = 4,
    dotsCount = 3,
    dotKeys = [],
    correctAnswer = '3/3 cells',
  } = puzzle;

  // Phase: 'memorize' | 'distraction' | 'recall'
  const [phase, setPhase] = useState('memorize');
  const [countdown, setCountdown] = useState(4);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [distractionAnswer, setDistractionAnswer] = useState(null);

  useEffect(() => {
    setPhase('memorize');
    setCountdown(4);
    setSelectedKeys([]);
    setDistractionAnswer(null);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('distraction');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [puzzle]);

  const handleDistractionAnswer = (ans) => {
    setDistractionAnswer(ans);
    setTimeout(() => {
      setPhase('recall');
    }, 400);
  };

  const handleCellClick = (key) => {
    if (phase !== 'recall' || feedbackState !== null) return;

    let updated = [];
    if (selectedKeys.includes(key)) {
      updated = selectedKeys.filter((k) => k !== key);
    } else {
      if (selectedKeys.length < dotsCount) {
        updated = [...selectedKeys, key];
      } else {
        updated = selectedKeys;
      }
    }
    setSelectedKeys(updated);

    if (updated.length === dotsCount) {
      // Evaluate match
      const correctMatches = updated.filter((k) => dotKeys.includes(k)).length;
      const isPerfect = correctMatches === dotsCount;
      setTimeout(() => {
        onSelectAnswer(isPerfect ? correctAnswer : 'wrong');
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-5 sm:space-y-6 w-full max-w-lg mx-auto">
      {/* ─── PHASE 1: MEMORIZE ─── */}
      {phase === 'memorize' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-black uppercase">
            <Eye className="w-4 h-4" />
            <span>Memorize Dot Locations ({countdown}s)</span>
          </div>

          <p className="text-xs text-slate-300">
            Remember the positions of the <strong className="text-purple-400">{dotsCount} dots</strong> below:
          </p>

          <div className="p-3 bg-darkBg border border-darkBorder rounded-2xl shadow-inner inline-block">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: gridSize }).map((_, r) =>
                Array.from({ length: gridSize }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const hasDot = dotKeys.includes(key);

                  return (
                    <div
                      key={key}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all border ${
                        hasDot
                          ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/40 scale-105 animate-pulse'
                          : 'bg-darkCard/50 border-darkBorder/50'
                      }`}
                    >
                      {hasDot && <div className="w-4 h-4 rounded-full bg-white shadow-md" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PHASE 2: DISTRACTION INTERMEDIATE TASK ─── */}
      {phase === 'distraction' && (
        <div className="flex flex-col items-center space-y-5 text-center bg-darkBg border border-darkBorder p-6 rounded-2xl w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
            <Brain className="w-4 h-4" />
            <span>Intermediate Visual Check</span>
          </div>

          <h4 className="text-sm font-bold text-slate-200">
            Are these two geometric figures identical in orientation?
          </h4>

          <div className="flex items-center justify-center gap-8 py-2 text-3xl font-black text-slate-100">
            <div className="w-14 h-14 rounded-xl bg-darkCard border border-darkBorder flex items-center justify-center">
              ▶
            </div>
            <div className="w-14 h-14 rounded-xl bg-darkCard border border-darkBorder flex items-center justify-center">
              ▶
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <button
              onClick={() => handleDistractionAnswer('yes')}
              className="py-2.5 rounded-xl bg-accentBtn/20 hover:bg-accentBtn border border-accentBlue/40 text-accentBlue hover:text-white font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Yes, Identical
            </button>
            <button
              onClick={() => handleDistractionAnswer('no')}
              className="py-2.5 rounded-xl bg-darkCard hover:bg-slate-800 border border-darkBorder text-slate-300 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              No, Different
            </button>
          </div>
        </div>
      )}

      {/* ─── PHASE 3: RECALL RECALL ─── */}
      {phase === 'recall' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recall Phase ({selectedKeys.length}/{dotsCount} selected)</span>
          </div>

          <p className="text-xs text-slate-300">
            Tap the exact cells where you saw the dots:
          </p>

          <div className="p-3 bg-darkBg border border-darkBorder rounded-2xl shadow-inner inline-block">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: gridSize }).map((_, r) =>
                Array.from({ length: gridSize }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const isSelected = selectedKeys.includes(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellClick(key)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 scale-105'
                          : 'bg-darkCard hover:bg-slate-800 border-darkBorder hover:border-slate-500'
                      }`}
                    >
                      {isSelected && <div className="w-4 h-4 rounded-full bg-white shadow-md animate-scaleIn" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridMemoryCanvas;
