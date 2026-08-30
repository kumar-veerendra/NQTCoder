/**
 * Procedural Dynamic Puzzle Generator for Inductive Challenge (Capgemini / Cognizant)
 * Generates 3x3 pattern transformation grids and 4 candidate grids for dual-selection.
 */

const SYMBOLS = [
  { id: 'circle', symbol: '●', color: '#a855f7', shapeType: 'circle', name: 'Purple Circle' },
  { id: 'plus', symbol: '✚', color: '#ea580c', shapeType: 'plus', name: 'Orange Plus' },
  { id: 'square', symbol: '■', color: '#16a34a', shapeType: 'square', name: 'Green Square' },
  { id: 'triangle', symbol: '▲', color: '#1d4ed8', shapeType: 'triangle', name: 'Blue Triangle' },
];

function getRandomSymbol(isDominant = false) {
  // Purple circle is dominant background symbol in Capgemini tests (~50% frequency)
  if (isDominant && Math.random() < 0.55) {
    return SYMBOLS[0];
  }
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function generateRandom3x3Grid() {
  const grid = [];
  // Ensure we place distinctive non-circle items
  const nonCircles = [SYMBOLS[1], SYMBOLS[2], SYMBOLS[3]];
  const positions = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      positions.push({ r, c });
    }
  }

  // Fill all with dominant circle first
  for (let r = 0; r < 3; r++) {
    const row = [];
    for (let c = 0; c < 3; c++) {
      row.push(SYMBOLS[0]);
    }
    grid.push(row);
  }

  // Shuffle and place 3-4 distinct shapes (Plus, Square, Triangle)
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  positions.slice(0, 3).forEach((pos, idx) => {
    grid[pos.r][pos.c] = nonCircles[idx % nonCircles.length];
  });

  return grid;
}

// ─── TRANSFORMATION OPERATORS ───
function rotate90Clockwise(grid) {
  const n = 3;
  const res = Array.from({ length: n }, () => Array(n).fill(null));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][n - 1 - r] = grid[r][c];
    }
  }
  return res;
}

function rotate90CounterClockwise(grid) {
  const n = 3;
  const res = Array.from({ length: n }, () => Array(n).fill(null));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[n - 1 - c][r] = grid[r][c];
    }
  }
  return res;
}

function flipHorizontal(grid) {
  return grid.map((row) => [...row].reverse());
}

function flipVertical(grid) {
  return [...grid].reverse().map((row) => [...row]);
}

function transposeGrid(grid) {
  const n = 3;
  const res = Array.from({ length: n }, () => Array(n).fill(null));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      res[c][r] = grid[r][c];
    }
  }
  return res;
}

const RULES = [
  {
    id: 'rotate90CW',
    name: '90° Clockwise Rotation',
    apply: rotate90Clockwise,
    description: 'Each shape rotates 90 degrees clockwise.',
  },
  {
    id: 'rotate90CCW',
    name: '90° Counter-Clockwise Rotation',
    apply: rotate90CounterClockwise,
    description: 'Each shape rotates 90 degrees counter-clockwise.',
  },
  {
    id: 'flipH',
    name: 'Horizontal Mirror Reflection',
    apply: flipHorizontal,
    description: 'Left and right columns are mirrored.',
  },
  {
    id: 'flipV',
    name: 'Vertical Mirror Reflection',
    apply: flipVertical,
    description: 'Top and bottom rows are flipped.',
  },
  {
    id: 'transpose',
    name: 'Diagonal Transposition',
    apply: transposeGrid,
    description: 'Rows and columns are transposed across main diagonal.',
  },
];

function gridsEqual(g1, g2) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (g1[r][c]?.id !== g2[r][c]?.id) return false;
    }
  }
  return true;
}

export function generateInductivePuzzle(levelConfig = {}) {
  const selectedRule = RULES[Math.floor(Math.random() * RULES.length)];

  // 1. Generate Left Example Grids
  let exampleA = generateRandom3x3Grid();
  let exampleB = selectedRule.apply(exampleA);

  // Ensure exampleA and exampleB are actually different
  while (gridsEqual(exampleA, exampleB)) {
    exampleA = generateRandom3x3Grid();
    exampleB = selectedRule.apply(exampleA);
  }

  // 2. Generate Right Target Candidate Pair
  let testA = generateRandom3x3Grid();
  let testB = selectedRule.apply(testA);

  while (gridsEqual(testA, testB) || gridsEqual(testA, exampleA)) {
    testA = generateRandom3x3Grid();
    testB = selectedRule.apply(testA);
  }

  // 3. Generate 2 Distractor Grids
  let distractor1 = generateRandom3x3Grid();
  let distractor2 = flipHorizontal(testB);

  while (gridsEqual(distractor1, testA) || gridsEqual(distractor1, testB)) {
    distractor1 = generateRandom3x3Grid();
  }

  // 4. Place candidate grids in choices array [A, B, C, D]
  const rawChoices = [
    { grid: testA, isPairA: true },
    { grid: testB, isPairB: true },
    { grid: distractor1, isDistractor: true },
    { grid: distractor2, isDistractor: true },
  ];

  // Shuffle choices
  const shuffledChoices = [];
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  indices.forEach((idx, newPos) => {
    shuffledChoices.push({
      id: newPos,
      label: String.fromCharCode(65 + newPos), // 'A', 'B', 'C', 'D'
      grid: rawChoices[idx].grid,
      isCorrectPart: rawChoices[idx].isPairA || rawChoices[idx].isPairB,
    });
  });

  const correctIndices = shuffledChoices
    .filter((c) => c.isCorrectPart)
    .map((c) => c.id)
    .sort((a, b) => a - b);

  const correctLabels = correctIndices.map((i) => String.fromCharCode(65 + i)).join(' and ');
  const correctAnswer = correctIndices.join(',');

  const explanation = `The rule connecting the two example grids is "${selectedRule.name}". Among the four choices, Grids ${correctLabels} follow this exact transformation rule.`;

  return {
    ruleName: selectedRule.name,
    exampleGrid1: exampleA,
    exampleGrid2: exampleB,
    choices: shuffledChoices,
    correctIndices,
    correctAnswer,
    options: [correctAnswer],
    explanation,
  };
}
