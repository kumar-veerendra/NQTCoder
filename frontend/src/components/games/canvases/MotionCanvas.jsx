import React, { useState, useEffect } from 'react';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const CELL_SIZE = 50; // px per cell
const GAP = 6; // px between cells
const PADDING = 10; // inner container padding in px

const MotionCanvas = ({
  puzzle,
  feedbackState,
  onSelectAnswer,
}) => {
  const {
    cols = 5,
    rows = 7,
    blackHole = { r: 0, c: 1 },
    ball: initialBall = { r: 5, c: 3 },
    fixedWalls = [],
    movableBlocks: initialBlocks = [],
  } = puzzle;

  const [ball, setBall] = useState(initialBall);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [movesCount, setMovesCount] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [isBallSelected, setIsBallSelected] = useState(true);
  const [reachedHole, setReachedHole] = useState(false);

  useEffect(() => {
    setBall(initialBall);
    setBlocks(JSON.parse(JSON.stringify(initialBlocks)));
    setMovesCount(0);
    setSelectedBlockId(null);
    setIsBallSelected(true);
    setReachedHole(false);
  }, [puzzle]);

  // Total board dimensions
  const boardWidth = cols * CELL_SIZE + (cols - 1) * GAP + PADDING * 2;
  const boardHeight = rows * CELL_SIZE + (rows - 1) * GAP + PADDING * 2;

  // Check what occupies a cell (r, c)
  const getOccupantAt = (r, c, currentBall, currentBlocks) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
      return { type: 'OUT_OF_BOUNDS' };
    }

    // Check fixed walls
    for (const w of fixedWalls) {
      if (r >= w.r && r < w.r + (w.h || 1) && c >= w.c && c < w.c + (w.w || 1)) {
        return { type: 'FIXED_WALL', wall: w };
      }
    }

    // Check ball
    if (r === currentBall.r && c === currentBall.c) {
      return { type: 'BALL' };
    }

    // Check movable blocks
    for (const b of currentBlocks) {
      if (r >= b.r && r < b.r + (b.h || 1) && c >= b.c && c < b.c + (b.w || 1)) {
        return { type: 'BLOCK', block: b };
      }
    }

    // Check black hole (empty space that blocks can slide over, but ball falls into)
    if (r === blackHole.r && c === blackHole.c) {
      return { type: 'HOLE' };
    }

    return { type: 'EMPTY' };
  };

  // Move Red Ball 1 step
  const moveBall = (dr, dc) => {
    if (reachedHole || feedbackState !== null) return;

    const nr = ball.r + dr;
    const nc = ball.c + dc;

    const occ = getOccupantAt(nr, nc, ball, blocks);

    // Ball can only move into EMPTY or HOLE
    if (occ.type === 'EMPTY' || occ.type === 'HOLE') {
      const newBall = { r: nr, c: nc };
      setBall(newBall);
      setMovesCount((prev) => prev + 1);

      // Check if reached hole
      if (nr === blackHole.r && nc === blackHole.c) {
        setReachedHole(true);
        setTimeout(() => {
          onSelectAnswer('ball_in_hole');
        }, 500);
      }
    }
  };

  // Move a colored sliding block
  const moveBlock = (blockId, dr, dc) => {
    if (reachedHole || feedbackState !== null) return;

    const b = blocks.find((item) => item.id === blockId);
    if (!b) return;

    // Check allowed direction by orientation
    if (b.orientation === 'H' && dr !== 0) return;
    if (b.orientation === 'V' && dc !== 0) return;

    const nr = b.r + dr;
    const nc = b.c + dc;

    // Check bounds
    if (nr < 0 || nr + b.h > rows || nc < 0 || nc + b.w > cols) return;

    // Check if new occupied cells are free
    const otherBlocks = blocks.filter((item) => item.id !== blockId);

    let canMove = true;
    for (let r = nr; r < nr + b.h; r++) {
      for (let c = nc; c < nc + b.w; c++) {
        const occ = getOccupantAt(r, c, ball, otherBlocks);
        if (occ.type !== 'EMPTY' && occ.type !== 'HOLE') {
          canMove = false;
          break;
        }
      }
      if (!canMove) break;
    }

    if (canMove) {
      setBlocks((prev) =>
        prev.map((item) => (item.id === blockId ? { ...item, r: nr, c: nc } : item))
      );
      setMovesCount((prev) => prev + 1);
    }
  };

  // Keyboard navigation for ball or selected block
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (selectedBlockId) moveBlock(selectedBlockId, -1, 0);
        else moveBall(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        if (selectedBlockId) moveBlock(selectedBlockId, 1, 0);
        else moveBall(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        if (selectedBlockId) moveBlock(selectedBlockId, 0, -1);
        else moveBall(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        if (selectedBlockId) moveBlock(selectedBlockId, 0, 1);
        else moveBall(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ball, blocks, selectedBlockId, reachedHole, feedbackState]);

  const handleReset = () => {
    setBall(initialBall);
    setBlocks(JSON.parse(JSON.stringify(initialBlocks)));
    setMovesCount(0);
    setSelectedBlockId(null);
    setIsBallSelected(true);
    setReachedHole(false);
  };

  // Check valid directions for ball
  const canBallMoveUp = ['EMPTY', 'HOLE'].includes(getOccupantAt(ball.r - 1, ball.c, ball, blocks).type);
  const canBallMoveDown = ['EMPTY', 'HOLE'].includes(getOccupantAt(ball.r + 1, ball.c, ball, blocks).type);
  const canBallMoveLeft = ['EMPTY', 'HOLE'].includes(getOccupantAt(ball.r, ball.c - 1, ball, blocks).type);
  const canBallMoveRight = ['EMPTY', 'HOLE'].includes(getOccupantAt(ball.r, ball.c + 1, ball, blocks).type);

  return (
    <div
      onClick={() => {
        setSelectedBlockId(null);
        setIsBallSelected(false);
      }}
      className="flex flex-col items-center w-full max-w-lg mx-auto py-1 select-none space-y-4"
    >
      {/* Top Controls Row */}
      <div className="flex items-center justify-between w-full max-w-xs text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
        <span>Slide blocks to open a path</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-accentBlue dark:hover:text-accentBlue transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* ─── MAIN SLIDING PUZZLE BOARD ─── */}
      <div
        className="relative bg-slate-200 dark:bg-slate-800 rounded-2xl border-4 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden"
        style={{
          width: `${boardWidth}px`,
          height: `${boardHeight}px`,
        }}
      >
        {/* Background Empty Grid Cells */}
        <div
          className="absolute inset-0 p-[10px] grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
            gap: `${GAP}px`,
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const isHole = r === blackHole.r && c === blackHole.c;

              return (
                <div
                  key={`${r}-${c}`}
                  className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-300/80 dark:border-slate-600/30 flex items-center justify-center relative shadow-xs"
                >
                  {isHole && (
                    <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-slate-700 shadow-inner flex items-center justify-center animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-slate-900" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ─── FIXED UNMOVABLE WALLS (White 'X' Envelope boxes) ─── */}
        {fixedWalls.map((w, idx) => {
          const wWidth = (w.w || 1) * CELL_SIZE + ((w.w || 1) - 1) * GAP;
          const wHeight = (w.h || 1) * CELL_SIZE + ((w.h || 1) - 1) * GAP;
          const topPos = PADDING + w.r * (CELL_SIZE + GAP);
          const leftPos = PADDING + w.c * (CELL_SIZE + GAP);

          return (
            <div
              key={`wall-${idx}`}
              className="absolute rounded-xl bg-white dark:bg-slate-100 border border-slate-300 shadow-md flex items-center justify-center pointer-events-none"
              style={{
                top: `${topPos}px`,
                left: `${leftPos}px`,
                width: `${wWidth}px`,
                height: `${wHeight}px`,
                zIndex: 10,
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full p-1 opacity-40">
                <line x1="0" y1="0" x2="100" y2="100" stroke="#64748b" strokeWidth="6" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="#64748b" strokeWidth="6" />
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="#94a3b8" strokeWidth="4" />
              </svg>
            </div>
          );
        })}

        {/* ─── MOVABLE COLORED SLIDING BLOCKS ─── */}
        {blocks.map((b) => {
          const isSelected = selectedBlockId === b.id;
          const bWidth = (b.w || 1) * CELL_SIZE + ((b.w || 1) - 1) * GAP;
          const bHeight = (b.h || 1) * CELL_SIZE + ((b.h || 1) - 1) * GAP;
          const topPos = PADDING + b.r * (CELL_SIZE + GAP);
          const leftPos = PADDING + b.c * (CELL_SIZE + GAP);

          return (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlockId(isSelected ? null : b.id);
                setIsBallSelected(false);
              }}
              className={`absolute rounded-xl shadow-lg cursor-pointer transition-all duration-150 flex items-center justify-center group ${
                isSelected ? 'ring-4 ring-white shadow-2xl scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{
                top: `${topPos}px`,
                left: `${leftPos}px`,
                width: `${bWidth}px`,
                height: `${bHeight}px`,
                backgroundColor: b.color || '#3b82f6',
                zIndex: isSelected ? 20 : 15,
              }}
            >
              {/* Slide Control Handles on block hover/selection */}
              <div
                className={`flex items-center justify-center gap-2 w-full h-full p-1 transition-opacity duration-150 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {b.orientation === 'H' || b.orientation === 'ANY' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(b.id, 0, -1);
                      }}
                      className="w-7 h-7 rounded-md bg-slate-950 text-white hover:bg-black border border-white/50 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      title="Slide Left"
                    >
                      <ArrowLeft className="w-4 h-4 stroke-[3] text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(b.id, 0, 1);
                      }}
                      className="w-7 h-7 rounded-md bg-slate-950 text-white hover:bg-black border border-white/50 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      title="Slide Right"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[3] text-white" />
                    </button>
                  </div>
                ) : null}

                {b.orientation === 'V' || b.orientation === 'ANY' ? (
                  <div className="flex flex-col gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(b.id, -1, 0);
                      }}
                      className="w-7 h-7 rounded-md bg-slate-950 text-white hover:bg-black border border-white/50 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      title="Slide Up"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[3] text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(b.id, 1, 0);
                      }}
                      className="w-7 h-7 rounded-md bg-slate-950 text-white hover:bg-black border border-white/50 shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      title="Slide Down"
                    >
                      <ArrowDown className="w-4 h-4 stroke-[3] text-white" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* ─── RED BALL (Player Object) ─── */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsBallSelected(true);
            setSelectedBlockId(null);
          }}
          className={`absolute rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 z-25 cursor-pointer ${
            isBallSelected ? 'ring-4 ring-red-400 scale-105 animate-pulse' : 'hover:scale-105'
          }`}
          style={{
            top: `${PADDING + ball.r * (CELL_SIZE + GAP) + 4}px`,
            left: `${PADDING + ball.c * (CELL_SIZE + GAP) + 4}px`,
            width: `${CELL_SIZE - 8}px`,
            height: `${CELL_SIZE - 8}px`,
            backgroundColor: '#dc2626',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.6)',
          }}
        />

        {/* ─── ADJACENT CELL STEP ARROW BUTTONS FOR RED BALL (Capgemini Style) ─── */}
        {isBallSelected && (
          <>
            {canBallMoveUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveBall(-1, 0);
                }}
                className="absolute z-30 w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-900 text-white border border-white/40 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-120 active:scale-95"
                style={{
                  top: `${PADDING + (ball.r - 1) * (CELL_SIZE + GAP) + 11}px`,
                  left: `${PADDING + ball.c * (CELL_SIZE + GAP) + 11}px`,
                }}
                title="Move Ball Up"
              >
                <ArrowUp className="w-4 h-4 stroke-[3] text-white" />
              </button>
            )}

            {canBallMoveRight && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveBall(0, 1);
                }}
                className="absolute z-30 w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-900 text-white border border-white/40 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-120 active:scale-95"
                style={{
                  top: `${PADDING + ball.r * (CELL_SIZE + GAP) + 11}px`,
                  left: `${PADDING + (ball.c + 1) * (CELL_SIZE + GAP) + 11}px`,
                }}
                title="Move Ball Right"
              >
                <ArrowRight className="w-4 h-4 stroke-[3] text-white" />
              </button>
            )}

            {canBallMoveDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveBall(1, 0);
                }}
                className="absolute z-30 w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-900 text-white border border-white/40 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-120 active:scale-95"
                style={{
                  top: `${PADDING + (ball.r + 1) * (CELL_SIZE + GAP) + 11}px`,
                  left: `${PADDING + ball.c * (CELL_SIZE + GAP) + 11}px`,
                }}
                title="Move Ball Down"
              >
                <ArrowDown className="w-4 h-4 stroke-[3] text-white" />
              </button>
            )}

            {canBallMoveLeft && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveBall(0, -1);
                }}
                className="absolute z-30 w-7 h-7 rounded-md bg-slate-700 hover:bg-slate-900 text-white border border-white/40 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-120 active:scale-95"
                style={{
                  top: `${PADDING + ball.r * (CELL_SIZE + GAP) + 11}px`,
                  left: `${PADDING + (ball.c - 1) * (CELL_SIZE + GAP) + 11}px`,
                }}
                title="Move Ball Left"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3] text-white" />
              </button>
            )}
          </>
        )}
      </div>

      {/* ─── BOTTOM MOVE COUNTER CAPSULE ─── */}
      <div className="flex items-center justify-center pt-1">
        <div className="bg-slate-900 text-white font-black text-xl px-9 py-2.5 rounded-2xl shadow-xl border border-slate-700 tracking-wider flex items-center justify-center min-w-[80px]">
          <span className="text-white font-mono">{movesCount}</span>
        </div>
      </div>

      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
        Click a block or the red ball to slide • Or use Arrow Keys
      </span>
    </div>
  );
};

export default MotionCanvas;
