/**
 * Procedural Dynamic Puzzle Generator for Geo-Sudo / Deductive Challenge
 * Generates mathematically valid Latin squares matching Cognizant & Capgemini formats.
 */

export const SHAPES_POOL = [
  { id: 'triangle', symbol: '▲', name: 'Blue Triangle', color: '#1d4ed8', shapeType: 'triangle' },
  { id: 'circle', symbol: '●', name: 'Green Circle', color: '#65a30d', shapeType: 'circle' },
  { id: 'square', symbol: '■', name: 'Red Square', color: '#dc2626', shapeType: 'square' },
  { id: 'star', symbol: '★', name: 'Gold Star', color: '#eab308', shapeType: 'star' },
  { id: 'diamond', symbol: '◆', name: 'Purple Diamond', color: '#9333ea', shapeType: 'diamond' },
  { id: 'hexagon', symbol: '⬡', name: 'Cyan Hexagon', color: '#06b6d4', shapeType: 'hexagon' },
];

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateGeoSudoPuzzle(levelConfig = {}) {
  const gridSize = levelConfig.gridSize || 3;
  const missingCellsCount = levelConfig.missingCells || 3;

  // 1. Select active shapes pool
  const activeShapes = SHAPES_POOL.slice(0, gridSize);
  const symbolChars = activeShapes.map((s) => s.symbol);

  // 2. Generate standard Latin Square (r + c) % gridSize
  const rawGrid = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push((r + c) % gridSize);
    }
    rawGrid.push(row);
  }

  // 3. Permute rows and columns
  const rowPerm = shuffle(Array.from({ length: gridSize }, (_, i) => i));
  const colPerm = shuffle(Array.from({ length: gridSize }, (_, i) => i));
  const symbolPerm = shuffle(symbolChars);

  const fullGrid = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      const val = rawGrid[rowPerm[r]][colPerm[c]];
      row.push(symbolPerm[val]);
    }
    fullGrid.push(row);
  }

  // 4. Select the target missing question mark cell (prefer center or near center)
  const targetR = Math.floor(Math.random() * gridSize);
  const targetC = Math.floor(Math.random() * gridSize);
  const correctAnswer = fullGrid[targetR][targetC];

  // 5. Build puzzle grid by removing cells
  const puzzleGrid = fullGrid.map((row) => [...row]);
  puzzleGrid[targetR][targetC] = '?';

  // Get all other cell coordinates
  const otherCoords = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (r === targetR && c === targetC) continue;
      otherCoords.push({ r, c });
    }
  }

  const shuffledCoords = shuffle(otherCoords);
  const toHide = Math.min(missingCellsCount, shuffledCoords.length);

  let hiddenCount = 0;
  for (const { r, c } of shuffledCoords) {
    if (hiddenCount >= toHide) break;

    // Ensure we keep sufficient clues in intersecting row or column
    const rowVisible = puzzleGrid[targetR].filter((v) => v !== '' && v !== '?').length;
    const colVisible = puzzleGrid.map((row) => row[targetC]).filter((v) => v !== '' && v !== '?').length;

    if (r === targetR && rowVisible <= 1 && colVisible <= 1) {
      continue;
    }

    puzzleGrid[r][c] = '';
    hiddenCount++;
  }

  const rowClues = puzzleGrid[targetR].filter((v) => v && v !== '?');
  const colClues = puzzleGrid.map((row) => row[targetC]).filter((v) => v && v !== '?');

  const explanation = `Row ${targetR + 1} contains [${rowClues.join(', ')}]. Column ${targetC + 1} contains [${colClues.join(', ')}]. By Latin-Square elimination, the missing shape is "${correctAnswer}".`;

  return {
    gridSize,
    grid: puzzleGrid,
    targetCell: { r: targetR, c: targetC },
    correctAnswer,
    symbols: activeShapes,
    options: shuffle(activeShapes),
    explanation,
    fullSolution: fullGrid,
  };
}
