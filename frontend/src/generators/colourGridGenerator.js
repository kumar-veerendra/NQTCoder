/**
 * Colour the Grid Generator (Capgemini Cognitive Assessment)
 * Generates rule-based colored grids (Orange vs Blue) based on structural features:
 * - Count threshold (e.g. >= 4 'Z' characters -> Orange, otherwise Blue)
 * - Corner equality rule
 * - Diagonal line continuity
 */

const SYMBOLS_POOL = ['Z', 'X', 'O', 'Y', 'W', 'V'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createGrid(dim, fillSymbol, count, targetSymbol) {
  const total = dim * dim;
  const cells = Array(total).fill(fillSymbol);
  
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < count; i++) {
    cells[indices[i]] = targetSymbol;
  }

  const grid = [];
  for (let r = 0; r < dim; r++) {
    grid.push(cells.slice(r * dim, (r + 1) * dim));
  }
  return grid;
}

export function generateColourGridPuzzle(levelConfig = {}) {
  const dim = 4;
  const targetSymbol = 'Z';
  const backgroundSymbol = 'X';
  const threshold = 4;

  // Rule: Grids with >= 4 'Z's are Orange. Grids with < 4 'Z's are Blue.
  // 1. Generate 2 Orange Example Grids
  const orangeExample1 = createGrid(dim, backgroundSymbol, getRandomInt(4, 6), targetSymbol);
  const orangeExample2 = createGrid(dim, backgroundSymbol, getRandomInt(5, 7), targetSymbol);

  // 2. Generate 2 Blue Example Grids
  const blueExample1 = createGrid(dim, backgroundSymbol, getRandomInt(1, 3), targetSymbol);
  const blueExample2 = createGrid(dim, backgroundSymbol, getRandomInt(0, 2), targetSymbol);

  // 3. Generate Test Target Grid
  const isTargetOrange = Math.random() > 0.5;
  const testCount = isTargetOrange ? getRandomInt(4, 7) : getRandomInt(1, 3);
  const testGrid = createGrid(dim, backgroundSymbol, testCount, targetSymbol);

  const correctAnswer = isTargetOrange ? 'Orange' : 'Blue';
  const options = ['Orange', 'Blue'];

  const explanation = `The rule is: Grids containing 4 or more "${targetSymbol}" symbols are colored Orange; grids with fewer than 4 "${targetSymbol}" symbols are Blue. The test grid contains ${testCount} "${targetSymbol}" symbols, so its correct classification is ${correctAnswer}.`;

  return {
    targetSymbol,
    threshold,
    examples: [
      { color: 'Orange', grid: orangeExample1, label: 'Orange Example' },
      { color: 'Blue', grid: blueExample1, label: 'Blue Example' },
      { color: 'Orange', grid: orangeExample2, label: 'Orange Example' },
      { color: 'Blue', grid: blueExample2, label: 'Blue Example' },
    ],
    testGrid,
    correctAnswer,
    options,
    explanation,
  };
}
