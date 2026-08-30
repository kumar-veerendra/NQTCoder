import { generateGeoSudoPuzzle } from './geoSudoGenerator';

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─────────────────────────────────────────────────────────────
// 1. DIGIT CHALLENGE GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateDigitPuzzle(levelConfig = {}) {
  const digitsCount = levelConfig.digitsCount || 3;
  const availableOps = levelConfig.operators || ['+', '-'];

  const digits = [];
  while (digits.length < digitsCount) {
    const d = getRandomInt(2, 9);
    if (!digits.includes(d)) digits.push(d);
  }

  // Generate valid arithmetic expression
  let target = 0;
  let expression = '';
  let tries = 0;

  while (tries < 20) {
    tries++;
    const shuffledDigits = shuffle(digits);
    let currentVal = shuffledDigits[0];
    let expStr = `${shuffledDigits[0]}`;
    let valid = true;

    for (let i = 1; i < digitsCount; i++) {
      const op = availableOps[Math.floor(Math.random() * availableOps.length)];
      const nextD = shuffledDigits[i];

      if (op === '+') {
        currentVal += nextD;
        expStr += ` + ${nextD}`;
      } else if (op === '-') {
        if (currentVal - nextD <= 0) {
          valid = false;
          break;
        }
        currentVal -= nextD;
        expStr += ` - ${nextD}`;
      } else if (op === '*') {
        currentVal *= nextD;
        expStr += ` × ${nextD}`;
      } else if (op === '/') {
        if (currentVal % nextD !== 0 || nextD === 0) {
          valid = false;
          break;
        }
        currentVal /= nextD;
        expStr += ` ÷ ${nextD}`;
      }
    }

    if (valid && currentVal > 0 && currentVal <= 100) {
      target = currentVal;
      expression = expStr;
      break;
    }
  }

  // Fallback if random search failed
  if (!expression) {
    const d1 = digits[0], d2 = digits[1], d3 = digits[2] || 2;
    target = d1 * d2 + d3;
    expression = `${d1} × ${d2} + ${d3}`;
  }

  // Create 3 distractor expressions with same digits
  const options = [expression];
  const ops = ['+', '-', '×'];
  while (options.length < 4) {
    const sD = shuffle(digits);
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    const candidate = sD.length === 3 ? `${sD[0]} ${op1} ${sD[1]} ${op2} ${sD[2]}` : `${sD[0]} ${op1} ${sD[1]}`;
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  return {
    target,
    digits,
    correctAnswer: expression,
    options: shuffle(options),
    explanation: `${expression} = ${target}`,
  };
}

// ─────────────────────────────────────────────────────────────
// 2. SWITCH CHALLENGE GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateSwitchPuzzle(levelConfig = {}) {
  const shapeCount = levelConfig.shapeCount || 4;
  const shapesPool = ['○', '△', '□', '★', '⬡', '◇'];
  const activeShapes = shapesPool.slice(0, shapeCount);

  const inputSequence = shuffle(activeShapes);
  const permutation = shuffle(Array.from({ length: shapeCount }, (_, i) => i));

  // permutation[i] is the 0-indexed position from input that goes into output index i
  const outputSequence = permutation.map((idx) => inputSequence[idx]);
  const correctCode = permutation.map((idx) => idx + 1).join('-');

  // Generate 3 distractor codes
  const options = [correctCode];
  while (options.length < 4) {
    const fakePerm = shuffle(Array.from({ length: shapeCount }, (_, i) => i));
    const fakeCode = fakePerm.map((idx) => idx + 1).join('-');
    if (!options.includes(fakeCode)) {
      options.push(fakeCode);
    }
  }

  const explanation = `Output position 1 takes element from input slot ${permutation[0] + 1} (${outputSequence[0]}), output position 2 takes from slot ${permutation[1] + 1} (${outputSequence[1]}), etc. Code: ${correctCode}`;

  return {
    inputSequence,
    outputSequence,
    correctAnswer: correctCode,
    options: shuffle(options),
    explanation,
  };
}

// ─────────────────────────────────────────────────────────────
// 3. INDUCTIVE CHALLENGE (SPACIO) GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateInductivePuzzle(levelConfig = {}) {
  const rules = [
    {
      name: 'Horizontal Mirror / Swap',
      apply: (a, b) => [b, a],
      exampleA: ['▲', '○'],
      exampleB: ['■', '●'],
      testInput: ['★', '◆'],
      explanation: 'The horizontal swap rule exchanges left and right positions.',
    },
    {
      name: 'Rotate 90° Clockwise',
      apply: (a, b) => ['↷ ' + a, '↷ ' + b],
      exampleA: ['▲', '▶'],
      exampleB: ['▶', '▼'],
      testInput: ['▲', '▲'],
      explanation: 'The rotation rule turns each shape 90 degrees clockwise.',
    },
    {
      name: 'Color Invert',
      apply: (a, b) => ['White ' + a, 'White ' + b],
      exampleA: ['●', '■'],
      exampleB: ['○', '□'],
      testInput: ['▲', '★'],
      explanation: 'The shading inversion rule changes filled black shapes into outlined white shapes.',
    },
    {
      name: 'Duplicate & Stack',
      apply: (a, b) => [a + a, b + b],
      exampleA: ['○', '△'],
      exampleB: ['○○', '△△'],
      testInput: ['□', '★'],
      explanation: 'The doubling rule duplicates each symbol into pairs.',
    },
  ];

  const selectedRule = rules[Math.floor(Math.random() * rules.length)];
  const correctOutput = selectedRule.apply(selectedRule.testInput[0], selectedRule.testInput[1]).join(' ');

  const distractors = [
    [selectedRule.testInput[0], selectedRule.testInput[0]].join(' '),
    [selectedRule.testInput[1], selectedRule.testInput[1]].join(' '),
    [selectedRule.testInput[1], '▲'].join(' '),
  ];

  const options = [correctOutput, ...distractors];

  return {
    ruleName: selectedRule.name,
    exampleA: selectedRule.exampleA.join(' ') + ' ➔ ' + selectedRule.apply(...selectedRule.exampleA).join(' '),
    exampleB: selectedRule.exampleB.join(' ') + ' ➔ ' + selectedRule.apply(...selectedRule.exampleB).join(' '),
    testInput: selectedRule.testInput.join(' '),
    correctAnswer: correctOutput,
    options: shuffle(options),
    explanation: selectedRule.explanation,
  };
}

// ─────────────────────────────────────────────────────────────
// 4. DOESN'T FIT THE RULE GENERATOR
// ─────────────────────────────────────────────────────────────
export function generateDoesntFitPuzzle(levelConfig = {}) {
  const patterns = [
    {
      figures: ['↗ (45°)', '↗ (45°)', '↗ (45°)', '↘ (135°)'],
      outlier: '↘ (135°)',
      reason: 'Three arrows point upward-right (45°), while the outlier points downward-right (135°).',
    },
    {
      figures: ['● ● ● (3 dots)', '■ ■ ■ (3 squares)', '▲ ▲ ▲ (3 triangles)', '◆ ◆ (2 diamonds)'],
      outlier: '◆ ◆ (2 diamonds)',
      reason: 'All groups contain exactly 3 shapes except the outlier which has only 2.',
    },
    {
      figures: ['Symmetric (○)', 'Symmetric (□)', 'Symmetric (△)', 'Asymmetric (☈)'],
      outlier: 'Asymmetric (☈)',
      reason: 'All other symbols have bilateral symmetry while the outlier is completely asymmetric.',
    },
    {
      figures: ['4 Sides (Square)', '4 Sides (Rectangle)', '4 Sides (Rhombus)', '5 Sides (Pentagon)'],
      outlier: '5 Sides (Pentagon)',
      reason: 'The outlier is a 5-sided polygon whereas all others are 4-sided quadrilaterals.',
    },
  ];

  const p = patterns[Math.floor(Math.random() * patterns.length)];

  return {
    question: 'Identify the figure that DOES NOT fit the common rule:',
    options: shuffle([...p.figures]),
    correctAnswer: p.outlier,
    explanation: p.reason,
  };
}

// ─────────────────────────────────────────────────────────────
// MASTER DISPATCHER: GENERATE PUZZLE BY GAME TYPE
// ─────────────────────────────────────────────────────────────
export function generatePuzzleForGame(gameType, levelConfig = {}) {
  switch (gameType) {
    case 'geo-sudo':
      return { type: 'geo-sudo', ...generateGeoSudoPuzzle(levelConfig) };
    case 'digit':
      return { type: 'digit', ...generateDigitPuzzle(levelConfig) };
    case 'switch':
      return { type: 'switch', ...generateSwitchPuzzle(levelConfig) };
    case 'inductive':
      return { type: 'inductive', ...generateInductivePuzzle(levelConfig) };
    case 'doesnt-fit':
    case 'same-rule':
    case 'colour-grid':
    case 'grid-memory':
    case 'motion':
    case 'oddo':
    default:
      // If specialized engine is in development, fall back to Geo-Sudo or Doesn't Fit
      if (gameType === 'doesnt-fit' || gameType === 'same-rule') {
        return { type: 'doesnt-fit', ...generateDoesntFitPuzzle(levelConfig) };
      }
      return { type: 'geo-sudo', ...generateGeoSudoPuzzle(levelConfig) };
  }
}
