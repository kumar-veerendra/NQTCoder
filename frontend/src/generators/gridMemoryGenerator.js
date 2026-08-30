function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateGridMemoryPuzzle(levelConfig = {}) {
  const gridSize = levelConfig.gridSize || 4;
  const dotsCount = levelConfig.dots || 3;

  const allCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      allCells.push({ r, c, key: `${r}-${c}` });
    }
  }

  const selectedCells = shuffle(allCells).slice(0, dotsCount);
  const dotKeys = selectedCells.map((c) => c.key);

  const answerStr = `${dotsCount} dot coordinates on ${gridSize}x${gridSize} matrix`;

  return {
    gridSize,
    dotsCount,
    dotKeys,
    selectedCells,
    correctAnswer: answerStr,
    options: [answerStr],
    explanation: `Memorized ${dotsCount} dot locations across the ${gridSize}×${gridSize} grid.`,
  };
}
