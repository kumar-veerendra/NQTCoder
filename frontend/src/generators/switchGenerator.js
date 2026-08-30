/**
 * Switch Challenge Generator
 * Generates permutation mapping matching Cognizant / Capgemini Switch Challenge format.
 */

export const SWITCH_SHAPES = [
  { id: 'triangle', symbol: '▲', name: 'Triangle', shapeType: 'triangle' },
  { id: 'square', symbol: '■', name: 'Square', shapeType: 'square' },
  { id: 'circle', symbol: '●', name: 'Circle', shapeType: 'circle' },
  { id: 'plus', symbol: '✚', name: 'Plus', shapeType: 'plus' },
  { id: 'star', symbol: '★', name: 'Star', shapeType: 'star' },
  { id: 'diamond', symbol: '◆', name: 'Diamond', shapeType: 'diamond' },
];

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateSwitchPuzzle(levelConfig = {}) {
  const shapeCount = Math.min(levelConfig.shapeCount || 4, SWITCH_SHAPES.length);
  const activeShapes = SWITCH_SHAPES.slice(0, shapeCount);

  const inputSequence = shuffle(activeShapes);
  
  // Ensure permutation is not just identity [0, 1, 2, 3]
  let permutation = shuffle(Array.from({ length: shapeCount }, (_, i) => i));
  let attempts = 0;
  while (permutation.every((val, idx) => val === idx) && attempts < 10) {
    attempts++;
    permutation = shuffle(Array.from({ length: shapeCount }, (_, i) => i));
  }

  const outputSequence = permutation.map((idx) => inputSequence[idx]);
  const correctCode = permutation.map((idx) => idx + 1).join('');

  const options = [correctCode];
  while (options.length < 4) {
    const fakePerm = shuffle(Array.from({ length: shapeCount }, (_, i) => i));
    const fakeCode = fakePerm.map((idx) => idx + 1).join('');
    if (!options.includes(fakeCode)) {
      options.push(fakeCode);
    }
  }

  const explanation = `Output position 1 takes element from input slot ${permutation[0] + 1} (${outputSequence[0].name}), output position 2 takes from slot ${permutation[1] + 1} (${outputSequence[1].name}), position 3 from slot ${permutation[2] + 1} (${outputSequence[2]?.name || ''}), position 4 from slot ${permutation[3] + 1} (${outputSequence[3]?.name || ''}). Answer code: ${correctCode}.`;

  return {
    inputSequence,
    outputSequence,
    correctAnswer: correctCode,
    options: shuffle(options),
    explanation,
  };
}
