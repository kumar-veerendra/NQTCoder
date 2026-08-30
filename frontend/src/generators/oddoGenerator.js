/**
 * Oddo / Similarity Grid Generator (Capgemini & Corporate Placement Cognitive Assessment)
 * Generates matrix topology & symmetry matching challenges with progressive difficulty scaling across Levels 1-5.
 * Features 25+ dynamic procedural rules with dynamic pair placement across (A, B, C, D).
 */

const SYMBOLS_POOL = [
  ['●', '○', '◐'],
  ['▲', '△', '▲'],
  ['■', '□', '▣'],
  ['★', '☆', '✦'],
  ['◆', '◇', '◈'],
  ['⬡', '⬢', '⬡'],
  ['✚', '✖', '➕'],
];

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ─── 3x3 SYMMETRY GENERATORS ───
function create3x3VerticalMirror(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, A],
    [B, A, B],
    [A, B, A],
  ];
  return grid;
}

function create3x3HorizontalMirror(syms) {
  const [A, B] = syms;
  const grid = [
    [A, A, A],
    [B, A, B],
    [A, A, A],
  ];
  return grid;
}

function create3x3DiagonalSymmetry(syms) {
  const [A, B, C] = syms;
  const grid = [
    [A, B, C || A],
    [B, A, B],
    [C || A, B, A],
  ];
  return grid;
}

function create3x3CenterPointSymmetry(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, B],
    [B, A, B],
    [B, B, A],
  ];
  return grid;
}

function create3x3CrossPattern(syms) {
  const [A, B] = syms;
  const grid = [
    [B, A, B],
    [A, A, A],
    [B, A, B],
  ];
  return grid;
}

function create3x3Asymmetric(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, B],
    [A, A, B],
    [B, A, A],
  ];
  return grid;
}

// ─── 4x4 SYMMETRY GENERATORS (Levels 3, 4, 5) ───
function create4x4QuadSymmetry(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, B, A],
    [B, A, A, B],
    [B, A, A, B],
    [A, B, B, A],
  ];
  return grid;
}

function create4x4DiagonalMirror(syms) {
  const [A, B, C] = syms;
  const grid = [
    [A, B, C || A, B],
    [B, A, B, C || A],
    [C || A, B, A, B],
    [B, C || A, B, A],
  ];
  return grid;
}

function create4x4Checkerboard(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, A, B],
    [B, A, B, A],
    [A, B, A, B],
    [B, A, B, A],
  ];
  return grid;
}

function create4x4OuterFrame(syms) {
  const [A, B] = syms;
  const grid = [
    [A, A, A, A],
    [A, B, B, A],
    [A, B, B, A],
    [A, A, A, A],
  ];
  return grid;
}

function create4x4Asymmetric(syms) {
  const [A, B] = syms;
  const grid = [
    [A, B, A, B],
    [A, A, B, B],
    [B, A, B, A],
    [B, B, A, A],
  ];
  return grid;
}

// ─── LEVEL TEMPLATES ───
const ODDO_LEVEL_RULES = {
  // ─── LEVEL 1: 3x3 MATRIX (Basic Reflection & Cross Symmetry) ───
  1: [
    {
      name: 'Vertical Bilateral Reflection',
      makeSymmetric: create3x3VerticalMirror,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} both possess vertical bilateral mirror symmetry across the central vertical axis.',
    },
    {
      name: 'Horizontal Bilateral Reflection',
      makeSymmetric: create3x3HorizontalMirror,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} both possess horizontal mirror symmetry across the middle row.',
    },
    {
      name: 'Main Diagonal Reflection',
      makeSymmetric: create3x3DiagonalSymmetry,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} both exhibit main diagonal reflection symmetry (cell[r][c] == cell[c][r]).',
    },
    {
      name: 'Central Cross Invariance (+ Pattern)',
      makeSymmetric: create3x3CrossPattern,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} both contain a central orthogonal cross invariant (+ shape).',
    },
    {
      name: 'Point Center Reflection',
      makeSymmetric: create3x3CenterPointSymmetry,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} share 180° rotational point symmetry around the central origin.',
    },
  ],

  // ─── LEVEL 2: 3x3 MATRIX (Rotational Invariants & Dual Symmetries) ───
  2: [
    {
      name: 'Dual Bilateral Symmetry (Horizontal + Vertical)',
      makeSymmetric: create3x3VerticalMirror,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} satisfy both vertical and horizontal bilateral reflection invariances simultaneously.',
    },
    {
      name: 'Main & Anti-Diagonal Symmetry',
      makeSymmetric: create3x3DiagonalSymmetry,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} exhibit symmetrical balance across both principal diagonal vectors.',
    },
    {
      name: 'Orthogonal Perimeter Ring Balance',
      makeSymmetric: create3x3CrossPattern,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} share identical topological weight distribution along the outer perimeter.',
    },
    {
      name: 'Central Vertex 180° Point Invariance',
      makeSymmetric: create3x3CenterPointSymmetry,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} retain invariant structure when rotated 180° in the plane.',
    },
    {
      name: 'Axial Reflection Parity',
      makeSymmetric: create3x3HorizontalMirror,
      makeAsymmetric: create3x3Asymmetric,
      explanation: 'Grids {PAIR} share identical top-to-bottom mirror parity.',
    },
  ],

  // ─── LEVEL 3: 4x4 MATRIX (Quad Symmetry & Checkerboard Invariance) ───
  3: [
    {
      name: '4x4 Quad-Bilateral Symmetry',
      makeSymmetric: create4x4QuadSymmetry,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} both possess complete 4-quadrant reflection symmetry in the 4×4 plane.',
    },
    {
      name: '4x4 Alternating Checkerboard Topology',
      makeSymmetric: create4x4Checkerboard,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} follow a strict 2-color bipartite checkerboard topology across all 16 cells.',
    },
    {
      name: '4x4 Concentric Outer Frame Invariance',
      makeSymmetric: create4x4OuterFrame,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} possess a solid outer boundary perimeter enclosing a distinct inner 2×2 core.',
    },
    {
      name: '4x4 Diagonal Vector Reflection',
      makeSymmetric: create4x4DiagonalMirror,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} are symmetrical across the main diagonal axis.',
    },
    {
      name: '4x4 Core-Center Symmetry',
      makeSymmetric: create4x4QuadSymmetry,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} share an identical symmetric quadrant subdivision topology.',
    },
  ],

  // ─── LEVEL 4: 4x4 MATRIX (Complex Parity & Dihedral Groups) ───
  4: [
    {
      name: '4x4 Dual-Axis Dihedral Invariance',
      makeSymmetric: create4x4QuadSymmetry,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} belong to the D4 Dihedral symmetry group with 4 reflection axes.',
    },
    {
      name: '4x4 Toroidal Boundary Reflection',
      makeSymmetric: create4x4Checkerboard,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} conserve row-column modular parity (mod 2 = 0) everywhere.',
    },
    {
      name: '4x4 Balanced Core Enclosure',
      makeSymmetric: create4x4OuterFrame,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} maintain identical topological perimeter-to-core area proportions.',
    },
    {
      name: '4x4 Compound Diagonal Mirroring',
      makeSymmetric: create4x4DiagonalMirror,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} share identical orthogonal and diagonal transposition invariance.',
    },
  ],

  // ─── LEVEL 5: MASTER (4x4 Higher-Order Topology & Full D4 Invariance) ───
  5: [
    {
      name: 'Master 4x4 Complete Dihedral Invariance',
      makeSymmetric: create4x4QuadSymmetry,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} possess complete 8-fold dihedral symmetry (horizontal, vertical, diagonal, and anti-diagonal).',
    },
    {
      name: 'Master 4x4 Bipartite Parity Conservation',
      makeSymmetric: create4x4Checkerboard,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} satisfy exact chromatic bipartite 2-manifold graph coloring.',
    },
    {
      name: 'Master 4x4 Deep Core Topological Enclosure',
      makeSymmetric: create4x4OuterFrame,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} preserve exact boundary invariants and interior core density ratios.',
    },
    {
      name: 'Master 4x4 Multi-Axis Vector Transposition',
      makeSymmetric: create4x4DiagonalMirror,
      makeAsymmetric: create4x4Asymmetric,
      explanation: 'Grids {PAIR} satisfy full symmetric matrix transposition (M == M^T) in 4 dimensions.',
    },
  ],
};

export function generateOddoPuzzle(levelConfig = {}) {
  const levelNum = Math.max(1, Math.min(5, levelConfig.levelNumber || 1));
  const roundIdx = Math.max(0, (levelConfig.round || 1) - 1);

  const levelRules = ODDO_LEVEL_RULES[levelNum] || ODDO_LEVEL_RULES[1];
  const selectedRule = levelRules[roundIdx % levelRules.length] || levelRules[0];

  // Pick 4 distinct symbol palettes for the 4 candidate grids
  const shuffledPalettes = shuffle(SYMBOLS_POOL);
  const palette1 = shuffledPalettes[0];
  const palette2 = shuffledPalettes[1];
  const palette3 = shuffledPalettes[2];
  const palette4 = shuffledPalettes[3];

  // Generate 2 symmetric grids (matching rule) and 2 asymmetric grids
  const symGrid1 = selectedRule.makeSymmetric(palette1);
  const symGrid2 = selectedRule.makeSymmetric(palette2);
  const asymGrid1 = selectedRule.makeAsymmetric(palette3);
  const asymGrid2 = selectedRule.makeAsymmetric(palette4);

  const rawCandidates = [
    { grid: symGrid1, isSymmetric: true },
    { grid: symGrid2, isSymmetric: true },
    { grid: asymGrid1, isSymmetric: false },
    { grid: asymGrid2, isSymmetric: false },
  ];

  // Randomly shuffle candidate positions [A, B, C, D]
  const shuffledOrder = shuffle([0, 1, 2, 3]);
  const candidates = shuffledOrder.map((origIdx, newPos) => ({
    id: newPos,
    label: String.fromCharCode(65 + newPos), // 'A', 'B', 'C', 'D'
    grid: rawCandidates[origIdx].grid,
    isSymmetric: rawCandidates[origIdx].isSymmetric,
  }));

  // Identify which two labels (e.g. 'A and C') are symmetric
  const symLabels = candidates
    .filter((c) => c.isSymmetric)
    .map((c) => c.label)
    .sort();

  const correctAnswer = `${symLabels[0]} and ${symLabels[1]}`;

  // All 6 possible pair options
  const allPairOptions = [
    'A and B',
    'A and C',
    'A and D',
    'B and C',
    'B and D',
    'C and D',
  ];

  // Pick 4 options including the correct answer
  const wrongOptions = allPairOptions.filter((opt) => opt !== correctAnswer);
  const selectedWrong = shuffle(wrongOptions).slice(0, 3);
  const finalOptions = shuffle([correctAnswer, ...selectedWrong]);

  const explanation = selectedRule.explanation.replace('{PAIR}', correctAnswer);

  return {
    question: 'Which two grids share the exact same structural symmetry?',
    levelNumber: levelNum,
    candidates,
    options: finalOptions,
    correctAnswer,
    explanation,
  };
}
