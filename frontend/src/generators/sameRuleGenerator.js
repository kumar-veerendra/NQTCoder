/**
 * The Same Rule Generator (Capgemini Cognitive Assessment)
 * Generates rule transfer challenges where candidate sequences must obey
 * a governing structural relationship with progressive difficulty scaling across Levels 1-5.
 */

const SYMBOLS_POOL = ['▲', '●', '■', '★', '◆', '⬡', '✚', '○', '△', '□', '◇'];

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomShapes(count) {
  const pool = shuffle(SYMBOLS_POOL);
  return pool.slice(0, count);
}

// Generate sequence given a template pattern (e.g. ['A', 'B', 'A', 'B']) and a shape mapping { A: '▲', B: '●' }
function applyTemplate(template, mapping) {
  return template.map((key) => mapping[key]);
}

// ─── PROGRESSIVE DIFFICULTY RULES PER LEVEL ───
const LEVEL_RULE_TEMPLATES = {
  // ─── LEVEL 1: 4 ELEMENTS, 2 SYMBOLS (Basic Alternation & Pairs) ───
  1: [
    {
      name: 'Strict Alternation (A B A B)',
      template: ['A', 'B', 'A', 'B'],
      distractors: [
        ['A', 'A', 'B', 'B'],
        ['A', 'B', 'B', 'A'],
        ['B', 'B', 'B', 'A'],
      ],
      explanation: 'The governing rule is strict alternating sequence of two shapes (A B A B).',
    },
    {
      name: 'Bilateral Symmetry (A B B A)',
      template: ['A', 'B', 'B', 'A'],
      distractors: [
        ['A', 'B', 'A', 'B'],
        ['A', 'A', 'B', 'B'],
        ['B', 'A', 'A', 'B'],
      ],
      explanation: 'The governing rule is bilateral horizontal symmetry: Outer items match, inner items match (A B B A).',
    },
    {
      name: 'Equal Twin Pairs (A A B B)',
      template: ['A', 'A', 'B', 'B'],
      distractors: [
        ['A', 'B', 'A', 'B'],
        ['A', 'B', 'B', 'A'],
        ['A', 'A', 'A', 'B'],
      ],
      explanation: 'The governing rule is consecutive twin pairs (A A B B).',
    },
    {
      name: 'Triad with Suffix Cap (A A A B)',
      template: ['A', 'A', 'A', 'B'],
      distractors: [
        ['A', 'A', 'B', 'B'],
        ['A', 'B', 'A', 'B'],
        ['A', 'B', 'B', 'B'],
      ],
      explanation: 'The governing rule is 3 identical shapes followed by 1 unique cap shape (A A A B).',
    },
  ],

  // ─── LEVEL 2: 5 ELEMENTS, 3 SYMBOLS (Palindromes & Triad Centers) ───
  2: [
    {
      name: '5-Element Palindrome (A B C B A)',
      template: ['A', 'B', 'C', 'B', 'A'],
      distractors: [
        ['A', 'B', 'C', 'A', 'B'],
        ['A', 'B', 'B', 'C', 'A'],
        ['A', 'C', 'B', 'C', 'B'],
      ],
      explanation: 'The governing rule is a 5-element palindrome centered on the middle shape (A B C B A).',
    },
    {
      name: 'Bookend Double with Center Triad (A B B B A)',
      template: ['A', 'B', 'B', 'B', 'A'],
      distractors: [
        ['A', 'B', 'B', 'A', 'B'],
        ['B', 'A', 'A', 'A', 'B'],
        ['A', 'A', 'B', 'B', 'A'],
      ],
      explanation: 'The governing rule is matching outer bookends enclosing a central triplet (A B B B A).',
    },
    {
      name: 'Twin Bridge with Single Cap (A A B C C)',
      template: ['A', 'A', 'B', 'C', 'C'],
      distractors: [
        ['A', 'B', 'B', 'C', 'C'],
        ['A', 'A', 'B', 'B', 'C'],
        ['A', 'B', 'C', 'A', 'B'],
      ],
      explanation: 'The governing rule is twin pair, single separator, twin pair (A A B C C).',
    },
    {
      name: 'Anchor Alternation (A B A C A)',
      template: ['A', 'B', 'A', 'C', 'A'],
      distractors: [
        ['A', 'B', 'C', 'B', 'A'],
        ['A', 'A', 'B', 'C', 'A'],
        ['B', 'A', 'C', 'A', 'B'],
      ],
      explanation: 'The governing rule is an anchor shape in positions 1, 3, 5 alternating with unique shapes (A B A C A).',
    },
  ],

  // ─── LEVEL 3: 6 ELEMENTS, 3-4 SYMBOLS (Double Palindromes & Wave Reflections) ───
  3: [
    {
      name: '6-Element Full Mirror (A B C C B A)',
      template: ['A', 'B', 'C', 'C', 'B', 'A'],
      distractors: [
        ['A', 'B', 'C', 'A', 'B', 'C'],
        ['A', 'B', 'C', 'C', 'A', 'B'],
        ['A', 'C', 'B', 'B', 'C', 'A'],
      ],
      explanation: 'The governing rule is perfect 6-element bilateral mirror symmetry (A B C C B A).',
    },
    {
      name: 'Triplet Blocks (A A B B C C)',
      template: ['A', 'A', 'B', 'B', 'C', 'C'],
      distractors: [
        ['A', 'B', 'A', 'B', 'C', 'C'],
        ['A', 'A', 'B', 'C', 'C', 'B'],
        ['A', 'B', 'C', 'A', 'B', 'C'],
      ],
      explanation: 'The governing rule is three consecutive doublets in strict succession (A A B B C C).',
    },
    {
      name: 'Alternating Wave with Terminal Double (A B A B C C)',
      template: ['A', 'B', 'A', 'B', 'C', 'C'],
      distractors: [
        ['A', 'B', 'C', 'A', 'B', 'C'],
        ['A', 'A', 'B', 'B', 'C', 'C'],
        ['A', 'B', 'A', 'C', 'B', 'C'],
      ],
      explanation: 'The governing rule is 4-element alternation followed by a terminal identical pair (A B A B C C).',
    },
    {
      name: 'Dual Enclosed Diamonds (A B B A C C)',
      template: ['A', 'B', 'B', 'A', 'C', 'C'],
      distractors: [
        ['A', 'B', 'C', 'C', 'B', 'A'],
        ['A', 'A', 'B', 'B', 'C', 'C'],
        ['A', 'B', 'B', 'C', 'C', 'A'],
      ],
      explanation: 'The governing rule is a 4-element palindrome followed by an independent terminal pair (A B B A C C).',
    },
  ],

  // ─── LEVEL 4: 6-7 ELEMENTS (Cyclic Shift Triplets & Cluster Expansions) ───
  4: [
    {
      name: 'Cyclic Permutation Shift (A B C  B C A)',
      template: ['A', 'B', 'C', 'B', 'C', 'A'],
      distractors: [
        ['A', 'B', 'C', 'A', 'B', 'C'],
        ['A', 'B', 'C', 'C', 'B', 'A'],
        ['A', 'C', 'B', 'B', 'C', 'A'],
      ],
      explanation: 'The governing rule is a cyclic left-shift of a 3-element block: [A, B, C] followed by [B, C, A].',
    },
    {
      name: 'Expanding Cluster Length (A  B B  C C C)',
      template: ['A', 'B', 'B', 'C', 'C', 'C'],
      distractors: [
        ['A', 'A', 'B', 'B', 'C', 'C'],
        ['A', 'B', 'C', 'C', 'C', 'C'],
        ['A', 'B', 'B', 'C', 'C', 'B'],
      ],
      explanation: 'The governing rule is arithmetic cluster expansion: 1 of shape A, 2 of shape B, 3 of shape C.',
    },
    {
      name: '7-Element Pure Palindrome (A B C D C B A)',
      template: ['A', 'B', 'C', 'D', 'C', 'B', 'A'],
      distractors: [
        ['A', 'B', 'C', 'D', 'B', 'C', 'A'],
        ['A', 'B', 'D', 'C', 'D', 'B', 'A'],
        ['A', 'C', 'B', 'D', 'B', 'C', 'A'],
      ],
      explanation: 'The governing rule is a 7-element full palindrome centered on vertex D (A B C D C B A).',
    },
  ],

  // ─── LEVEL 5: MASTER (8 ELEMENTS, Double Palindromes & Higher-Order Modulation) ───
  5: [
    {
      name: '8-Element Octa-Mirror (A B C D D C B A)',
      template: ['A', 'B', 'C', 'D', 'D', 'C', 'B', 'A'],
      distractors: [
        ['A', 'B', 'C', 'D', 'C', 'D', 'B', 'A'],
        ['A', 'B', 'D', 'C', 'C', 'D', 'B', 'A'],
        ['A', 'C', 'B', 'D', 'D', 'B', 'C', 'A'],
      ],
      explanation: 'The governing rule is an 8-element complex bilateral reflection across the center (A B C D D C B A).',
    },
    {
      name: 'Twin 4-Element Palindromes (A B B A  C D D C)',
      template: ['A', 'B', 'B', 'A', 'C', 'D', 'D', 'C'],
      distractors: [
        ['A', 'B', 'B', 'A', 'C', 'C', 'D', 'D'],
        ['A', 'B', 'A', 'B', 'C', 'D', 'C', 'D'],
        ['A', 'B', 'B', 'C', 'C', 'D', 'D', 'A'],
      ],
      explanation: 'The governing rule is two consecutive independent 4-element palindromes: [A B B A] + [C D D C].',
    },
    {
      name: 'Expanding Arithmetic Quartets (A  B B  C C C  D D D D)',
      template: ['A', 'B', 'B', 'C', 'C', 'C', 'D', 'D'],
      distractors: [
        ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D'],
        ['A', 'B', 'C', 'D', 'C', 'B', 'A', 'D'],
        ['A', 'B', 'B', 'C', 'C', 'D', 'D', 'D'],
      ],
      explanation: 'The governing rule is expanding frequency clusters: 1 of A, 2 of B, 3 of C, followed by D.',
    },
  ],
};

export function generateSameRulePuzzle(levelConfig = {}) {
  const levelNum = Math.max(1, Math.min(5, levelConfig.levelNumber || 1));
  const roundIdx = Math.max(0, (levelConfig.round || 1) - 1);

  const levelRules = LEVEL_RULE_TEMPLATES[levelNum] || LEVEL_RULE_TEMPLATES[1];
  const selectedRule = levelRules[roundIdx % levelRules.length] || levelRules[0];

  // Unique shapes needed for this rule's keys ('A', 'B', 'C', 'D'...)
  const keys = Array.from(new Set(selectedRule.template));
  const numKeys = keys.length;

  // 1. Generate 3 distinct example sequences following this exact rule
  const examples = [];
  for (let i = 0; i < 3; i++) {
    const shapes = getRandomShapes(numKeys);
    const mapping = {};
    keys.forEach((k, idx) => {
      mapping[k] = shapes[idx];
    });
    examples.push(applyTemplate(selectedRule.template, mapping).join('  '));
  }

  // 2. Generate 1 valid target sequence for the correct option
  const targetShapes = getRandomShapes(numKeys);
  const targetMapping = {};
  keys.forEach((k, idx) => {
    targetMapping[k] = targetShapes[idx];
  });
  const correctOption = applyTemplate(selectedRule.template, targetMapping).join('  ');

  // 3. Generate 3 subtle distractor sequences using the distractor templates
  const distractorOptions = selectedRule.distractors.map((dTemplate) => {
    const distractorShapes = getRandomShapes(numKeys);
    const dMapping = {};
    keys.forEach((k, idx) => {
      dMapping[k] = distractorShapes[idx] || distractorShapes[0];
    });
    return applyTemplate(dTemplate, dMapping).join('  ');
  });

  const options = shuffle([correctOption, ...distractorOptions]);

  return {
    ruleName: selectedRule.name,
    levelNumber: levelNum,
    examples,
    options,
    correctAnswer: correctOption,
    explanation: selectedRule.explanation,
  };
}
