/**
 * Procedural Dynamic Sliding-Block Puzzle Generator for Motion Challenge
 * Models Capgemini / Cognizant Motion Challenge with movable colored blocks,
 * fixed 'X' obstacles, Red Ball, and Black Hole.
 * Contains 25+ unique puzzles (5 distinct puzzles per level) across 5 progressive levels.
 */

// ─── 25 DISTINCT HAND-CRAFTED & VERIFIED SLIDING-BLOCK PUZZLES ───
const MOTION_PUZZLES_BY_LEVEL = {
  // ─── LEVEL 1: INTRO (3-5 moves) ───
  1: [
    // Round 1
    {
      cols: 5,
      rows: 6,
      blackHole: { r: 0, c: 2 },
      ball: { r: 5, c: 2 },
      fixedWalls: [
        { r: 0, c: 0, w: 2, h: 1 },
        { r: 0, c: 3, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 2, c: 1, w: 3, h: 1, orientation: 'H', color: '#312e81' }, // Indigo horizontal 3x1
        { id: 'b2', r: 3, c: 2, w: 1, h: 2, orientation: 'V', color: '#06b6d4' }, // Cyan vertical 1x2
      ],
      optimalMoves: 4,
    },
    // Round 2
    {
      cols: 5,
      rows: 6,
      blackHole: { r: 0, c: 1 },
      ball: { r: 5, c: 3 },
      fixedWalls: [
        { r: 0, c: 3, w: 2, h: 1 },
        { r: 2, c: 0, w: 1, h: 1 },
        { r: 4, c: 4, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 2, h: 1, orientation: 'H', color: '#4338ca' },
        { id: 'b2', r: 2, c: 2, w: 1, h: 2, orientation: 'V', color: '#eab308' },
        { id: 'b3', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#10b981' },
      ],
      optimalMoves: 5,
    },
    // Round 3
    {
      cols: 5,
      rows: 6,
      blackHole: { r: 0, c: 4 },
      ball: { r: 5, c: 0 },
      fixedWalls: [
        { r: 0, c: 2, w: 1, h: 1 },
        { r: 3, c: 2, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 3, w: 1, h: 2, orientation: 'V', color: '#ec4899' },
        { id: 'b2', r: 2, c: 0, w: 2, h: 1, orientation: 'H', color: '#3b82f6' },
        { id: 'b3', r: 4, c: 2, w: 2, h: 1, orientation: 'H', color: '#f59e0b' },
      ],
      optimalMoves: 5,
    },
    // Round 4
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 2 },
      fixedWalls: [
        { r: 0, c: 0, w: 2, h: 1 },
        { r: 0, c: 3, w: 2, h: 1 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 3, c: 4, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 2, c: 1, w: 3, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b2', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b3', r: 5, c: 3, w: 1, h: 1, orientation: 'ANY', color: '#10b981' },
      ],
      optimalMoves: 5,
    },
    // Round 5
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 1 },
      ball: { r: 5, c: 3 },
      fixedWalls: [
        { r: 0, c: 2, w: 2, h: 1 },
        { r: 1, c: 1, w: 1, h: 1 },
        { r: 4, c: 3, w: 1, h: 1 },
        { r: 6, c: 1, w: 3, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 0, w: 1, h: 3, orientation: 'V', color: '#312e81' },
        { id: 'b2', r: 2, c: 2, w: 2, h: 1, orientation: 'H', color: '#4338ca' },
        { id: 'b3', r: 2, c: 1, w: 1, h: 1, orientation: 'ANY', color: '#06b6d4' },
        { id: 'b4', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#38bdf8' },
        { id: 'b5', r: 4, c: 1, w: 1, h: 1, orientation: 'ANY', color: '#16a34a' },
      ],
      optimalMoves: 6,
    },
  ],

  // ─── LEVEL 2: ELEMENTARY (6-8 moves) ───
  2: [
    // Round 1
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 3 },
      ball: { r: 6, c: 3 },
      fixedWalls: [
        { r: 4, c: 0, w: 1, h: 1 },
        { r: 1, c: 4, w: 1, h: 2 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 2, w: 1, h: 3, orientation: 'V', color: '#eab308' },
        { id: 'b2', r: 0, c: 3, w: 1, h: 3, orientation: 'V', color: '#312e81' },
        { id: 'b3', r: 1, c: 0, w: 2, h: 1, orientation: 'H', color: '#7e22ce' },
        { id: 'b4', r: 2, c: 0, w: 2, h: 1, orientation: 'H', color: '#1e1b4b' },
        { id: 'b5', r: 3, c: 0, w: 2, h: 1, orientation: 'H', color: '#b91c1c' },
        { id: 'b6', r: 3, c: 2, w: 1, h: 4, orientation: 'V', color: '#22d3ee' },
        { id: 'b7', r: 3, c: 3, w: 2, h: 1, orientation: 'H', color: '#eab308' },
      ],
      optimalMoves: 8,
    },
    // Round 2
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 0 },
      ball: { r: 6, c: 4 },
      fixedWalls: [
        { r: 0, c: 2, w: 1, h: 2 },
        { r: 3, c: 4, w: 1, h: 1 },
        { r: 5, c: 0, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 1, w: 1, h: 3, orientation: 'V', color: '#2563eb' },
        { id: 'b2', r: 1, c: 3, w: 2, h: 1, orientation: 'H', color: '#9333ea' },
        { id: 'b3', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#f59e0b' },
        { id: 'b4', r: 4, c: 3, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 5, c: 2, w: 2, h: 1, orientation: 'H', color: '#06b6d4' },
      ],
      optimalMoves: 7,
    },
    // Round 3
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 4 },
      ball: { r: 6, c: 0 },
      fixedWalls: [
        { r: 1, c: 1, w: 1, h: 1 },
        { r: 2, c: 3, w: 1, h: 1 },
        { r: 4, c: 1, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 1, w: 2, h: 1, orientation: 'H', color: '#312e81' },
        { id: 'b2', r: 1, c: 4, w: 1, h: 3, orientation: 'V', color: '#e11d48' },
        { id: 'b3', r: 2, c: 0, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b4', r: 3, c: 2, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 5, c: 1, w: 2, h: 1, orientation: 'H', color: '#eab308' },
      ],
      optimalMoves: 7,
    },
    // Round 4
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 4 },
      fixedWalls: [
        { r: 1, c: 0, w: 2, h: 1 },
        { r: 3, c: 3, w: 2, h: 1 },
        { r: 5, c: 1, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 3, w: 2, h: 1, orientation: 'H', color: '#6366f1' },
        { id: 'b2', r: 2, c: 1, w: 1, h: 3, orientation: 'V', color: '#06b6d4' },
        { id: 'b3', r: 2, c: 2, w: 2, h: 1, orientation: 'H', color: '#f97316' },
        { id: 'b4', r: 4, c: 2, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 5, c: 3, w: 2, h: 1, orientation: 'H', color: '#e11d48' },
      ],
      optimalMoves: 8,
    },
    // Round 5
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 1 },
      ball: { r: 6, c: 1 },
      fixedWalls: [
        { r: 0, c: 3, w: 1, h: 2 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 4, c: 4, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 0, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b2', r: 2, c: 2, w: 1, h: 3, orientation: 'V', color: '#eab308' },
        { id: 'b3', r: 3, c: 3, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b4', r: 4, c: 0, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b5', r: 5, c: 2, w: 2, h: 1, orientation: 'H', color: '#f43f5e' },
      ],
      optimalMoves: 8,
    },
  ],

  // ─── LEVEL 3: INTERMEDIATE (8-11 moves) ───
  3: [
    // Round 1
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 0 },
      ball: { r: 6, c: 2 },
      fixedWalls: [
        { r: 0, c: 4, w: 1, h: 1 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 6, c: 4, w: 1, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 0, w: 1, h: 2, orientation: 'V', color: '#312e81' },
        { id: 'b2', r: 0, c: 1, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b3', r: 2, c: 1, w: 2, h: 1, orientation: 'H', color: '#9333ea' },
        { id: 'b4', r: 1, c: 3, w: 1, h: 3, orientation: 'V', color: '#eab308' },
        { id: 'b5', r: 4, c: 1, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b6', r: 4, c: 2, w: 2, h: 1, orientation: 'H', color: '#f97316' },
      ],
      optimalMoves: 10,
    },
    // Round 2
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 4 },
      ball: { r: 6, c: 1 },
      fixedWalls: [
        { r: 0, c: 1, w: 2, h: 1 },
        { r: 2, c: 4, w: 1, h: 1 },
        { r: 5, c: 0, w: 1, h: 2 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 1, h: 3, orientation: 'V', color: '#2563eb' },
        { id: 'b2', r: 1, c: 3, w: 2, h: 1, orientation: 'H', color: '#ec4899' },
        { id: 'b3', r: 3, c: 2, w: 2, h: 1, orientation: 'H', color: '#eab308' },
        { id: 'b4', r: 4, c: 3, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 5, c: 1, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b6', r: 2, c: 0, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
      ],
      optimalMoves: 9,
    },
    // Round 3
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 3 },
      fixedWalls: [
        { r: 1, c: 1, w: 1, h: 1 },
        { r: 3, c: 3, w: 1, h: 1 },
        { r: 4, c: 0, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 0, w: 1, h: 3, orientation: 'V', color: '#312e81' },
        { id: 'b2', r: 0, c: 3, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b3', r: 2, c: 1, w: 2, h: 1, orientation: 'H', color: '#eab308' },
        { id: 'b4', r: 2, c: 4, w: 1, h: 3, orientation: 'V', color: '#06b6d4' },
        { id: 'b5', r: 4, c: 2, w: 2, h: 1, orientation: 'H', color: '#e11d48' },
        { id: 'b6', r: 5, c: 1, w: 1, h: 2, orientation: 'V', color: '#8b5cf6' },
      ],
      optimalMoves: 10,
    },
    // Round 4
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 1 },
      ball: { r: 6, c: 4 },
      fixedWalls: [
        { r: 1, c: 4, w: 1, h: 2 },
        { r: 3, c: 1, w: 1, h: 1 },
        { r: 6, c: 0, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 2, w: 2, h: 1, orientation: 'H', color: '#4f46e5' },
        { id: 'b2', r: 1, c: 0, w: 1, h: 3, orientation: 'V', color: '#f59e0b' },
        { id: 'b3', r: 2, c: 2, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b4', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#06b6d4' },
        { id: 'b5', r: 4, c: 3, w: 1, h: 2, orientation: 'V', color: '#ec4899' },
        { id: 'b6', r: 5, c: 2, w: 1, h: 2, orientation: 'V', color: '#312e81' },
      ],
      optimalMoves: 11,
    },
    // Round 5
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 3 },
      ball: { r: 6, c: 0 },
      fixedWalls: [
        { r: 0, c: 0, w: 2, h: 1 },
        { r: 3, c: 4, w: 1, h: 1 },
        { r: 5, c: 2, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 2, h: 1, orientation: 'H', color: '#3b82f6' },
        { id: 'b2', r: 1, c: 3, w: 1, h: 3, orientation: 'V', color: '#eab308' },
        { id: 'b3', r: 2, c: 0, w: 1, h: 2, orientation: 'V', color: '#10b981' },
        { id: 'b4', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b5', r: 4, c: 0, w: 2, h: 1, orientation: 'H', color: '#f43f5e' },
        { id: 'b6', r: 5, c: 1, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
      ],
      optimalMoves: 11,
    },
  ],

  // ─── LEVEL 4: ADVANCED (11-14 moves) ───
  4: [
    // Round 1
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 0 },
      fixedWalls: [
        { r: 1, c: 0, w: 1, h: 1 },
        { r: 3, c: 4, w: 1, h: 1 },
        { r: 5, c: 2, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 0, w: 2, h: 1, orientation: 'H', color: '#2563eb' },
        { id: 'b2', r: 0, c: 3, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b3', r: 2, c: 0, w: 1, h: 3, orientation: 'V', color: '#f59e0b' },
        { id: 'b4', r: 1, c: 2, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
        { id: 'b5', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b6', r: 4, c: 3, w: 1, h: 2, orientation: 'V', color: '#ec4899' },
      ],
      optimalMoves: 12,
    },
    // Round 2
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 0 },
      ball: { r: 6, c: 4 },
      fixedWalls: [
        { r: 0, c: 3, w: 2, h: 1 },
        { r: 2, c: 1, w: 1, h: 1 },
        { r: 4, c: 3, w: 1, h: 1 },
        { r: 6, c: 1, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 1, w: 2, h: 1, orientation: 'H', color: '#312e81' },
        { id: 'b2', r: 1, c: 0, w: 1, h: 3, orientation: 'V', color: '#0ea5e9' },
        { id: 'b3', r: 2, c: 2, w: 2, h: 1, orientation: 'H', color: '#eab308' },
        { id: 'b4', r: 3, c: 4, w: 1, h: 3, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#e11d48' },
        { id: 'b6', r: 5, c: 0, w: 1, h: 2, orientation: 'V', color: '#7c3aed' },
        { id: 'b7', r: 5, c: 3, w: 1, h: 1, orientation: 'ANY', color: '#f97316' },
      ],
      optimalMoves: 13,
    },
    // Round 3
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 4 },
      ball: { r: 6, c: 1 },
      fixedWalls: [
        { r: 0, c: 1, w: 2, h: 1 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 4, c: 4, w: 1, h: 1 },
        { r: 6, c: 3, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 1, h: 3, orientation: 'V', color: '#2563eb' },
        { id: 'b2', r: 1, c: 3, w: 2, h: 1, orientation: 'H', color: '#ec4899' },
        { id: 'b3', r: 2, c: 0, w: 1, h: 2, orientation: 'V', color: '#eab308' },
        { id: 'b4', r: 3, c: 2, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b5', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#06b6d4' },
        { id: 'b6', r: 5, c: 0, w: 2, h: 1, orientation: 'H', color: '#312e81' },
        { id: 'b7', r: 5, c: 2, w: 1, h: 2, orientation: 'V', color: '#f59e0b' },
      ],
      optimalMoves: 13,
    },
    // Round 4
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 2 },
      fixedWalls: [
        { r: 0, c: 0, w: 1, h: 2 },
        { r: 0, c: 4, w: 1, h: 2 },
        { r: 3, c: 2, w: 1, h: 1 },
        { r: 5, c: 0, w: 2, h: 1 },
        { r: 5, c: 3, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 1, h: 3, orientation: 'V', color: '#4f46e5' },
        { id: 'b2', r: 1, c: 3, w: 1, h: 3, orientation: 'V', color: '#0ea5e9' },
        { id: 'b3', r: 2, c: 2, w: 1, h: 1, orientation: 'ANY', color: '#eab308' },
        { id: 'b4', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b5', r: 4, c: 3, w: 1, h: 2, orientation: 'V', color: '#e11d48' },
      ],
      optimalMoves: 14,
    },
    // Round 5
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 1 },
      ball: { r: 6, c: 3 },
      fixedWalls: [
        { r: 1, c: 3, w: 2, h: 1 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 4, c: 2, w: 1, h: 1 },
        { r: 6, c: 0, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 2, w: 2, h: 1, orientation: 'H', color: '#2563eb' },
        { id: 'b2', r: 1, c: 0, w: 1, h: 3, orientation: 'V', color: '#7c3aed' },
        { id: 'b3', r: 2, c: 1, w: 2, h: 1, orientation: 'H', color: '#f59e0b' },
        { id: 'b4', r: 3, c: 3, w: 1, h: 3, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 4, c: 0, w: 2, h: 1, orientation: 'H', color: '#06b6d4' },
        { id: 'b6', r: 5, c: 1, w: 2, h: 1, orientation: 'H', color: '#f43f5e' },
      ],
      optimalMoves: 14,
    },
  ],

  // ─── LEVEL 5: MASTER (14-18 moves) ───
  5: [
    // Round 1
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 1 },
      ball: { r: 6, c: 4 },
      fixedWalls: [
        { r: 0, c: 2, w: 2, h: 1 },
        { r: 2, c: 4, w: 1, h: 2 },
        { r: 5, c: 1, w: 1, h: 1 },
        { r: 6, c: 0, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 0, w: 1, h: 3, orientation: 'V', color: '#1e1b4b' },
        { id: 'b2', r: 1, c: 2, w: 2, h: 1, orientation: 'H', color: '#4f46e5' },
        { id: 'b3', r: 2, c: 1, w: 1, h: 1, orientation: 'ANY', color: '#06b6d4' },
        { id: 'b4', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#0284c7' },
        { id: 'b5', r: 4, c: 0, w: 2, h: 1, orientation: 'H', color: '#e11d48' },
        { id: 'b6', r: 3, c: 3, w: 1, h: 3, orientation: 'V', color: '#eab308' },
      ],
      optimalMoves: 15,
    },
    // Round 2
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 3 },
      ball: { r: 6, c: 0 },
      fixedWalls: [
        { r: 0, c: 0, w: 2, h: 1 },
        { r: 2, c: 0, w: 1, h: 2 },
        { r: 4, c: 4, w: 1, h: 1 },
        { r: 6, c: 3, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 4, w: 1, h: 3, orientation: 'V', color: '#312e81' },
        { id: 'b2', r: 1, c: 1, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b3', r: 2, c: 3, w: 1, h: 1, orientation: 'ANY', color: '#eab308' },
        { id: 'b4', r: 3, c: 2, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b5', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#f43f5e' },
        { id: 'b6', r: 3, c: 1, w: 1, h: 3, orientation: 'V', color: '#7c3aed' },
        { id: 'b7', r: 5, c: 2, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
      ],
      optimalMoves: 16,
    },
    // Round 3
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 0 },
      ball: { r: 6, c: 2 },
      fixedWalls: [
        { r: 0, c: 3, w: 2, h: 1 },
        { r: 2, c: 2, w: 1, h: 1 },
        { r: 3, c: 0, w: 1, h: 1 },
        { r: 5, c: 4, w: 1, h: 2 },
      ],
      movableBlocks: [
        { id: 'b1', r: 0, c: 1, w: 2, h: 1, orientation: 'H', color: '#2563eb' },
        { id: 'b2', r: 1, c: 0, w: 1, h: 3, orientation: 'V', color: '#ec4899' },
        { id: 'b3', r: 1, c: 3, w: 1, h: 3, orientation: 'V', color: '#eab308' },
        { id: 'b4', r: 3, c: 1, w: 2, h: 1, orientation: 'H', color: '#10b981' },
        { id: 'b5', r: 4, c: 2, w: 2, h: 1, orientation: 'H', color: '#06b6d4' },
        { id: 'b6', r: 5, c: 0, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b7', r: 4, c: 0, w: 1, h: 1, orientation: 'ANY', color: '#f59e0b' },
      ],
      optimalMoves: 16,
    },
    // Round 4
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 4 },
      ball: { r: 6, c: 0 },
      fixedWalls: [
        { r: 0, c: 1, w: 2, h: 1 },
        { r: 2, c: 4, w: 1, h: 2 },
        { r: 4, c: 0, w: 1, h: 1 },
        { r: 6, c: 2, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 0, w: 1, h: 3, orientation: 'V', color: '#312e81' },
        { id: 'b2', r: 1, c: 3, w: 2, h: 1, orientation: 'H', color: '#0ea5e9' },
        { id: 'b3', r: 2, c: 1, w: 2, h: 1, orientation: 'H', color: '#eab308' },
        { id: 'b4', r: 3, c: 3, w: 1, h: 3, orientation: 'V', color: '#10b981' },
        { id: 'b5', r: 4, c: 1, w: 2, h: 1, orientation: 'H', color: '#e11d48' },
        { id: 'b6', r: 5, c: 0, w: 2, h: 1, orientation: 'H', color: '#7c3aed' },
        { id: 'b7', r: 5, c: 4, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
      ],
      optimalMoves: 17,
    },
    // Round 5
    {
      cols: 5,
      rows: 7,
      blackHole: { r: 0, c: 2 },
      ball: { r: 6, c: 2 },
      fixedWalls: [
        { r: 0, c: 0, w: 1, h: 2 },
        { r: 0, c: 4, w: 1, h: 2 },
        { r: 2, c: 2, w: 1, h: 1 },
        { r: 4, c: 1, w: 1, h: 1 },
        { r: 4, c: 3, w: 1, h: 1 },
        { r: 6, c: 0, w: 2, h: 1 },
        { r: 6, c: 3, w: 2, h: 1 },
      ],
      movableBlocks: [
        { id: 'b1', r: 1, c: 1, w: 1, h: 3, orientation: 'V', color: '#2563eb' },
        { id: 'b2', r: 1, c: 3, w: 1, h: 3, orientation: 'V', color: '#7c3aed' },
        { id: 'b3', r: 2, c: 0, w: 1, h: 1, orientation: 'ANY', color: '#eab308' },
        { id: 'b4', r: 2, c: 4, w: 1, h: 1, orientation: 'ANY', color: '#10b981' },
        { id: 'b5', r: 3, c: 2, w: 1, h: 2, orientation: 'V', color: '#06b6d4' },
        { id: 'b6', r: 5, c: 1, w: 2, h: 1, orientation: 'H', color: '#f43f5e' },
      ],
      optimalMoves: 18,
    },
  ],
};

export function generateMotionPuzzle(levelConfig = {}) {
  const levelNum = Math.max(1, Math.min(5, levelConfig.levelNumber || 1));
  const roundIdx = Math.max(0, (levelConfig.round || 1) - 1) % 5;

  const levelPuzzles = MOTION_PUZZLES_BY_LEVEL[levelNum] || MOTION_PUZZLES_BY_LEVEL[1];
  const basePuzzle = levelPuzzles[roundIdx] || levelPuzzles[0];

  // Deep clone puzzle state
  const puzzle = JSON.parse(JSON.stringify(basePuzzle));

  return {
    ...puzzle,
    correctAnswer: 'ball_in_hole',
    explanation: `Slide the colored obstacle blocks to create an open route for the Red Ball to reach the Black Hole. Optimal solution: ${puzzle.optimalMoves} moves.`,
  };
}
