import Game from '../models/Game.js';
import GameLevel from '../models/GameLevel.js';
import Company from '../models/Company.js';

export const gamesData = [
  {
    name: 'Geo-Sudo',
    slug: 'geo-sudo',
    shortDescription: 'Visual logical reasoning game based on completing geometric Latin-square grids using unique shapes.',
    description: 'Geo-Sudo is a visual logical reasoning game based on the idea of completing a grid using different shapes. Instead of using numbers like traditional Sudoku, Geo-Sudo uses symbols or geometric shapes. Your job is to study the grid, understand the pattern, and find the correct shape that should be placed in the missing position.',
    category: 'deductive',
    skills: [
      'Identify visual patterns',
      'Think logically without guessing',
      'Eliminate incorrect possibilities',
      'Remember visual information',
      'Concentrate under time pressure',
      'Maintain accuracy while working quickly'
    ],
    difficulty: 'Medium to Hard',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Geo-Sudo tests your ability to spot constraints, perform rapid visual elimination, and maintain 100% accuracy under strict time pressure—a core skill in Cognizant and Capgemini game-based cognitive assessments.',
    objective: 'Complete the grid by selecting the correct missing shape according to the Latin-square rule: each shape appears only once in each row and once in each column.',
    howToThink: 'Observe the complete grid before picking. Look at the row containing the missing cell, then check the column. Use elimination: if 3 shapes are already present in the intersecting row/column, the 4th shape must be the answer.',
    commonRules: [
      {
        title: 'Rule 1 — Observe the complete grid',
        description: 'Look at the entire grid before selecting anything. Compare both the intersecting row and column.',
        example: 'Row misses {○, △} and Column misses {△, ★} ➔ Shared missing shape is △.'
      },
      {
        title: 'Rule 2 — Look for missing shapes',
        description: 'Identify which shapes are already present in the active row.',
        example: 'If Row has [○, △, ?, ★], the missing shape is likely □.'
      },
      {
        title: 'Rule 3 — Check the column',
        description: 'Verify your row deduction by checking whether the column also lacks that exact shape.',
        example: 'Prevents careless misclicks by cross-checking two axes.'
      },
      {
        title: 'Rule 4 — Use elimination',
        description: 'Eliminate options that already exist in that row or column until only one valid shape remains.',
        example: 'If ○, △, ★ appear in row/col, □ is guaranteed to be correct.'
      }
    ],
    instructions: [
      'Step 1 — Observe: Look carefully at the grid without rushing.',
      'Step 2 — Find the pattern: Check the active row and column for missing symbols.',
      'Step 3 — Eliminate options: Remove shapes that cannot possibly fit.',
      'Step 4 — Select your answer: Click the shape you believe is correct.',
      'Step 5 — Get feedback: Earn points and maintain your streak!'
    ],
    rules: [
      'No duplicate symbols in the same horizontal row.',
      'No duplicate symbols in the same vertical column.',
      'Each puzzle has exactly ONE mathematically valid answer.',
      'Wrong answers reset your active streak counter.'
    ],
    tips: [
      'Don\'t guess immediately: random guessing hurts your score and streak.',
      'Check rows first: if the answer is obvious from the row, verify with column and submit.',
      'Use elimination: finding 3 impossible options is just as good as finding the answer directly.',
      'Practice accuracy before speed: Accuracy > Speed initially, then Accuracy + Speed.',
      'Learn from mistakes: ask yourself if you missed a row, column, or rushed.'
    ],
    timerDescription: 'Each challenge has a time limit (40-60s). Placement assessments evaluate both speed and accuracy under pressure.',
    placementGoal: 'Beginner ➔ Understand rules ➔ Improve accuracy (90%+) ➔ Reduce solving time ➔ Placement-ready consistency.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1 — Learn the Game',
        description: 'Smaller 4x4 grids with abundant clues and generous 60s timer.',
        focus: 'Understand row/col elimination mechanics.'
      },
      {
        levelNumber: 2,
        title: 'Level 2 — Build Confidence',
        description: '4x4 grid with fewer clues requiring routine row ➔ column ➔ elimination checks.',
        focus: 'Reduce time spent staring at the puzzle.'
      },
      {
        levelNumber: 3,
        title: 'Level 3 — Medium Challenge',
        description: 'More missing cells and tighter 45s timer.',
        focus: 'Maintain accuracy without guessing.'
      },
      {
        levelNumber: 4,
        title: 'Level 4 — Hard (5x5 Matrix)',
        description: '5x5 grid with 5 distinct symbols (○, △, □, ★, ⬡).',
        focus: 'Fast multi-symbol elimination across 5 axes.'
      },
      {
        levelNumber: 5,
        title: 'Level 5 — Expert Challenge',
        description: 'Maximum missing cells with high 40s time pressure.',
        focus: 'Placement-ready speed and 100% precision.'
      }
    ],
    example: {
      question: 'Find the missing symbol in cell (Row 3, Col 3) for this 4x4 Geo-Sudo grid.',
      grid: [
        ['○', '△', '□', '★'],
        ['△', '□', '★', '○'],
        ['□', '★', '?', '△'],
        ['★', '○', '△', '□']
      ],
      options: ['○', '△', '□', '★'],
      correctAnswer: '○',
      explanation: 'Row 3 contains □, ★, and △. Column 3 contains □, ★, and △. The only symbol missing in both Row 3 and Column 3 is ○.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points per puzzle + speed bonus (0-30 pts) multiplied by level difficulty multiplier.',
    gameType: 'geo-sudo',
    isActive: true,
    order: 1,
    levels: [
      {
        levelNumber: 1,
        name: '4x4 Basic Deduction',
        description: '4x4 grid with abundant clues. Direct row/column intersection reveals the answer.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 60,
        difficultyConfig: { gridSize: 4, missingCells: 3, symbolsCount: 4 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: '4x4 Moderate Constraints',
        description: '4x4 grid with fewer given clues requiring two-step deduction.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { gridSize: 4, missingCells: 6, symbolsCount: 4 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '4x4 Fast Elimination',
        description: '4x4 grid with sparse clues under tighter 45s timer.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 4, missingCells: 8, symbolsCount: 4 },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: '5x5 Complex Matrix',
        description: '5x5 grid introducing 5 unique geometric symbols (Circle, Triangle, Square, Star, Hexagon).',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { gridSize: 5, missingCells: 8, symbolsCount: 5 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: '5x5 Grandmaster Blitz',
        description: '5x5 grid with maximum missing cells and fast 40s timer. Precision is critical.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { gridSize: 5, missingCells: 12, symbolsCount: 5 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Inductive Challenge (Spacio)',
    slug: 'inductive-challenge',
    shortDescription: 'Discover hidden geometric rules across example figure pairs and identify the matching pattern.',
    description: 'Inductive Challenge is a visual reasoning game where you discover a hidden relationship between shapes, objects, or patterns. The game presents example figure pairs; your task is to understand the transformation rule and apply it to a new problem figure.',
    category: 'inductive',
    skills: [
      'Pattern recognition & feature detection',
      'Abstract & spatial thinking',
      'Visual transformation reasoning',
      'Hypothesis formulation & rule testing'
    ],
    difficulty: 'Medium to Hard',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Directly tests your ability to infer operational rules without explicit guidance, a key competency in Cognizant and Capgemini hiring assessments.',
    objective: 'Observe the example transformations, discover the underlying rule (rotation, reflection, position swap, count change), and select the option that follows the exact same rule.',
    howToThink: 'Don\'t look at figures as isolated shapes. Ask: "What changed from Before to After?" Did positions swap diagonally? Did arrows rotate 90°? Did count double? Look for the simplest rule that explains ALL examples.',
    commonRules: [
      {
        title: 'Rotation',
        description: 'Figures rotate clockwise or counter-clockwise by 45°, 90°, or 180° increments.',
        example: '▲ (Up) ➔ ▶ (Right) ➔ ▼ (Down)'
      },
      {
        title: 'Reflection',
        description: 'Shapes mirror horizontally or vertically across a symmetry axis.',
        example: '▶ (Right) ➔ ◀ (Left)'
      },
      {
        title: 'Position Swap',
        description: 'Objects change relative slot orders (e.g. A B C ➔ C B A).',
        example: '[▲ ○] ➔ [○ ▲]'
      },
      {
        title: 'Counting',
        description: 'The number of objects scales according to a numeric rule.',
        example: '● ● ➔ ● ● ● ● (Doubling rule)'
      }
    ],
    instructions: [
      'Step 1 — Study the examples: Look at Before ➔ After and ask what changed.',
      'Step 2 — Find the simplest rule: Look for the most direct consistent pattern.',
      'Step 3 — Check answer choices: Eliminate options that violate the discovered rule.',
      'Step 4 — Confirm your answer: Verify that your rule holds true across all examples.',
      'Step 5 — Submit: Advance to the next challenge!'
    ],
    rules: [
      'The rule must explain all provided examples, not just one.',
      'Only one candidate option correctly applies the transformation.'
    ],
    tips: [
      'Compare Before ➔ After directly instead of staring at the whole figure.',
      'Look for position changes first—they are often easier to identify than shape morphs.',
      'Don\'t assume the first pattern you think of: test it against all example pairs.',
      'Use elimination to remove options that clearly break orientation.'
    ],
    timerDescription: 'Timed per challenge (30-50s). Start by understanding the rule, then improve speed.',
    placementGoal: 'Observe ➔ Compare ➔ Find Rule ➔ Test Rule ➔ Answer with 90%+ accuracy.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1 — Simple Patterns',
        description: 'Basic 90°/180° rotations and mirror reflections.',
        focus: 'Single-property rule discovery.'
      },
      {
        levelNumber: 2,
        title: 'Level 2 — Position Patterns',
        description: 'Positional swaps and shape inversions.',
        focus: 'Tracking relative element movements.'
      },
      {
        levelNumber: 3,
        title: 'Level 3 — Multiple Properties',
        description: 'Combined shape changes + position shifts.',
        focus: 'Multi-criteria rule verification.'
      },
      {
        levelNumber: 4,
        title: 'Level 4 — Complex Transformations',
        description: 'Abstract relational rules with subtle distractors.',
        focus: 'High-speed rule synthesis.'
      },
      {
        levelNumber: 5,
        title: 'Level 5 — Expert',
        description: 'Subtle high-order relationships with strict 30s timer.',
        focus: 'Cognitive agility and placement mastery.'
      }
    ],
    example: {
      question: 'Example 1: [▲ ○] ➔ [○ ▲], Example 2: [■ ●] ➔ [● ■]. What does [★ ◆] transform to?',
      grid: null,
      options: ['◆ ★', '★ ◆', '◆ ▲', '★ ★'],
      correctAnswer: '◆ ★',
      explanation: 'The rule is a horizontal position swap. Left element moves to right, right element moves to left. Therefore, [★ ◆] becomes [◆ ★].'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'inductive',
    isActive: true,
    order: 2,
    levels: [
      {
        levelNumber: 1,
        name: 'Single Property (Rotation/Reflection)',
        description: 'Identify basic rotation (90°/180°) and mirror reflections.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { properties: 1, type: 'rotation' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: 'Position Swap & Inversion',
        description: 'Transformations involving positional swaps and color shading.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { properties: 1, type: 'swap' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: 'Dual Properties',
        description: 'Rules combining rotation with element count change.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { properties: 2, type: 'combined' },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: 'Spatial Relations',
        description: 'Complex shape nesting and diagonal shifts.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { properties: 2, type: 'spatial' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Abstract Rule Mastery',
        description: 'Multiple active properties with plausible distractor options.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { properties: 3, type: 'abstract' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Grid Challenge',
    slug: 'grid-challenge',
    shortDescription: 'Working memory & concentration assessment: memorize dot coordinates, perform visual check, recall positions.',
    description: 'Grid Challenge is a memory and concentration test. You briefly see a grid containing marked dot positions. You memorize those positions, complete an intermediate visual comparison task, and then recall and click the original dot coordinates.',
    category: 'memory',
    skills: [
      'Working memory capacity',
      'Visual & spatial memory',
      'Task switching & multitasking',
      'Focus & distraction resistance',
      'Recall speed'
    ],
    difficulty: 'Hard',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Evaluates working memory capacity and mental resilience when holding spatial information across multiple tasks.',
    objective: 'Remember the marked dot positions on the grid, complete the distraction task, and recall all coordinates accurately.',
    howToThink: 'Do not try to memorize the entire grid. Focus only on the marked positions. Create a mental pattern or geometric shape (e.g. diagonal line or triangle) connecting the dots rather than memorizing isolated numbers.',
    commonRules: [
      {
        title: 'Memorization Phase',
        description: 'Dot positions flash on screen for 3-6 seconds before disappearing.',
        example: '3 dots appear on a 4x4 matrix.'
      },
      {
        title: 'Distraction Task',
        description: 'A rapid visual check tests your attention and task switching.',
        example: 'Verify whether two shapes are identical in orientation.'
      },
      {
        title: 'Recall Phase',
        description: 'Click or tap the exact cells where you saw the original dots.',
        example: 'Select 3 target cells to submit.'
      }
    ],
    instructions: [
      'Step 1 — Memorize: Form a mental shape connecting the marked dots.',
      'Step 2 — Remember locations: Think coordinates like "second column, first row".',
      'Step 3 — Distraction phase: Answer the visual comparison question.',
      'Step 4 — Recall: Select the cells where you remember seeing the dots.',
      'Step 5 — Submit: Score points based on recalled dot accuracy!'
    ],
    rules: [
      'Both memory recall and the distraction task count toward your round score.',
      'Display time decreases at higher difficulty levels.'
    ],
    tips: [
      'Don\'t memorize the whole grid—focus only on the marked dots.',
      'Use coordinates: (1,2), (2,4), (3,1) etc.',
      'Create patterns: if dots form a diagonal ↘, remember the pattern rather than individual dots.',
      'Stay calm: trying to memorize everything in panic makes recall harder.'
    ],
    timerDescription: 'Memory preview lasts 3-6 seconds. Total challenge timer is 35-45 seconds.',
    placementGoal: 'Build spatial chunking habits to retain 5+ coordinates across task interruptions.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: '3x3 grid with 2 marked cells and generous 6s memory time.',
        focus: 'Learn spatial chunking.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: '4x4 grid with 3 marked cells.',
        focus: 'Coordinate tracking.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: '4x4 grid with 4 marked cells and faster distraction task.',
        focus: 'Task switching resilience.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: '5x5 grid with 4 dots across wider matrix.',
        focus: 'Spatial layout recall.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: '5x5 grid with 5 dots and tight 3s memory preview.',
        focus: 'Expert working memory capacity.'
      }
    ],
    example: {
      question: 'Memorize 3 dots on a 4x4 grid at (0,1), (1,3), (3,2). Recall them on the blank grid.',
      grid: null,
      options: ['Recalled 3/3 cells correctly'],
      correctAnswer: '3/3 cells',
      explanation: 'Chunking dots into a spatial shape (Top-center, Middle-right, Bottom-mid) enables instant recall.'
    },
    videoUrl: '',
    scoringDescription: 'Score based on recalled dot accuracy + distraction task correctness.',
    gameType: 'grid-memory',
    isActive: true,
    order: 3,
    levels: [
      {
        levelNumber: 1,
        name: '3x3 Grid (2 Dots)',
        description: '2 dots with 6 seconds memory time.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 3, dots: 2, displayTime: 6 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: '4x4 Grid (3 Dots)',
        description: '3 dots on 4x4 matrix with 5s memory time.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 4, dots: 3, displayTime: 5 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '4x4 Grid (4 Dots)',
        description: '4 dots with faster distraction question.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { gridSize: 4, dots: 4, displayTime: 4 },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: '5x5 Grid (4 Dots)',
        description: '5x5 matrix with higher spatial spread.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { gridSize: 5, dots: 4, displayTime: 4 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: '5x5 Grid (5 Dots)',
        description: '5 dots with short 3s display time under pressure.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { gridSize: 5, dots: 5, displayTime: 3 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Motion Challenge',
    slug: 'motion-challenge',
    shortDescription: 'Planning & path-solving puzzle: navigate token from Start to Goal avoiding obstacles in minimum moves.',
    description: 'Motion Challenge is a planning and path-solving game. You control an object and need to move it from a starting position to a target through obstacles. The challenge is to find the shortest collision-free route using the minimum possible moves.',
    category: 'spatial',
    skills: [
      'Spatial foresight & path planning',
      'Move optimization',
      'Decision making under constraints',
      'Obstacle navigation'
    ],
    difficulty: 'Hard',
    companyNames: ['Capgemini', 'Cognizant'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Evaluates your ability to plan several moves ahead rather than relying on reactive trial-and-error.',
    objective: 'Guide your token from Start (S) to Target (T) through wall obstacles (█) using the shortest, most efficient route possible.',
    howToThink: 'Don\'t start moving immediately. Plan first. Take 3-5 seconds to trace the complete route from start to finish before taking your first step. Always ask: "What happens after my next move? Will I hit a dead end?"',
    commonRules: [
      {
        title: 'Collision-Free Route',
        description: 'You cannot move onto or through obstacle blocks (█).',
        example: 'Must route around wall barriers.'
      },
      {
        title: 'Move Efficiency',
        description: 'Your score considers both speed and move efficiency (Optimal moves / Player moves × 100).',
        example: 'Optimal: 8 moves. Used: 10 moves ➔ 80% Efficiency.'
      }
    ],
    instructions: [
      'Step 1 — Find the start: Locate your starting position (S).',
      'Step 2 — Find the target: Identify the goal cell (T).',
      'Step 3 — Observe obstacles: Understand the available open paths.',
      'Step 4 — Plan: Think several moves ahead to avoid dead ends.',
      'Step 5 — Move: Use Arrow keys or on-screen buttons to navigate.',
      'Step 6 — Reach the target: Complete the maze with maximum efficiency!'
    ],
    rules: [
      'Cannot walk through wall blocks.',
      'Score combines completion speed and move efficiency percentage.'
    ],
    tips: [
      'Don\'t start moving immediately—a few seconds spent planning saves many wasted moves.',
      'Work backwards from the target hole to identify the winning entry corridor.'
    ],
    timerDescription: '35-50s per maze. Complete before time runs out while minimizing moves.',
    placementGoal: 'Achieve 100% path efficiency on 5x5 and 6x6 mazes within 25 seconds.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: '4x4 grid with simple open paths and few obstacles.',
        focus: 'Learn path visualization.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: '4x4 grid with tighter obstacle corridors.',
        focus: 'Avoiding corner traps.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: '5x5 spatial grid with multiple branching paths.',
        focus: 'Route comparison & foresight.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: '5x5 complex maze with dead ends.',
        focus: 'Backtracking minimization.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: '6x6 optimization master with strict move limits.',
        focus: 'Maximum speed and optimal path execution.'
      }
    ],
    example: {
      question: 'Navigate from (0,0) to (3,3) avoiding walls at (0,2), (1,1), (1,2).',
      grid: null,
      options: ['Optimal: 6 moves (Down ➔ Down ➔ Down ➔ Right ➔ Right ➔ Right)'],
      correctAnswer: '6 moves',
      explanation: 'Navigating around the wall barrier requires 6 precise steps with zero wasted detours.'
    },
    videoUrl: '',
    scoringDescription: 'Score based on correctness + move efficiency percentage + time remaining.',
    gameType: 'motion',
    isActive: true,
    order: 4,
    levels: [
      {
        levelNumber: 1,
        name: '4x4 Open Path',
        description: 'Simple grid with few obstacles.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { gridSize: 4, obstacles: 3 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: '4x4 Obstacle Maze',
        description: 'Tighter corridors and turns.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 4, obstacles: 5 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '5x5 Spatial Grid',
        description: '5x5 grid with multiple route choices.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 5, obstacles: 7 },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: '5x5 Complex Maze',
        description: 'Dead-ends and required backtracking foresight.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { gridSize: 5, obstacles: 9 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: '6x6 Optimization Master',
        description: '6x6 grid with strict move limits and high speed demands.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { gridSize: 6, obstacles: 12 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Switch Challenge',
    slug: 'switch-challenge',
    shortDescription: 'Transformation & sequence reasoning: decode the permutation operator that reorders shapes.',
    description: 'Switch Challenge is a transformation and sequence reasoning game. You are given objects in an original order. The objects pass through a switch or transformation rule, changing their order. Your task is to discover what the switch did and determine the correct code.',
    category: 'pattern',
    skills: [
      'Permutation logic & mapping',
      'Sequence transformation decoding',
      'Positional tracking across states',
      'Visual order analysis'
    ],
    difficulty: 'Medium',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Frequently used in Cognizant assessments to evaluate algorithmic index mapping and mental state tracking.',
    objective: 'Determine the numbered permutation switch code (e.g. 3-1-4-2) that transformed the input sequence into the output sequence.',
    howToThink: 'Track one distinctive shape first (e.g. Star ★). Find its original input position (say, position 3) and locate where it landed in the output (say, slot 1). This immediately tells you that the code begins with 3!',
    commonRules: [
      {
        title: 'Switch Code Mapping',
        description: 'A 4-digit code (e.g. 3-1-4-2) represents which original position moved into each output slot.',
        example: 'Slot 1 gets 3rd input, Slot 2 gets 1st input, Slot 3 gets 4th input, Slot 4 gets 2nd input.'
      },
      {
        title: 'Permutation Invariance',
        description: 'All shapes from the input exist in the output—only their index positions change.',
        example: '[○, △, □, ★] ➔ [□, ○, ★, △]'
      }
    ],
    instructions: [
      'Step 1 — Look at the original sequence (Positions 1, 2, 3, 4).',
      'Step 2 — Look at the transformed sequence (Slots 1, 2, 3, 4).',
      'Step 3 — Compare positions: where did each item move?',
      'Step 4 — Identify the permutation code.',
      'Step 5 — Submit your matching code!'
    ],
    rules: [
      'The code indicates which original index moved into each resulting slot.',
      'Standard 1-indexed numbering applies.'
    ],
    tips: [
      'Pick a unique shape (e.g. Star ★) and find its slot in the output first—this eliminates 2-3 wrong options in 2 seconds!'
    ],
    timerDescription: '30-50s per challenge. Speed up by tracking individual shape anchors.',
    placementGoal: 'Decode 5-shape and 6-shape permutations in under 15 seconds.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: '4 geometric shapes with single permutation switch.',
        focus: 'Understand 1-indexed permutation codes.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: '4 shapes with 40s timer.',
        focus: 'Speed up anchor shape tracking.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: '5 geometric shapes across 5 positions.',
        focus: 'Multi-element sequence tracking.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: '5 shapes with complex multi-swap transformations.',
        focus: 'Eliminating subtle distractors.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: '6 shapes with rapid mental decoding in 30s.',
        focus: 'Placement master speed and accuracy.'
      }
    ],
    example: {
      question: 'Input: [○, △, □, ★]. Output: [□, ○, ★, △]. Which switch code was applied?',
      grid: null,
      options: ['3-1-4-2', '2-4-1-3', '4-3-2-1', '1-3-2-4'],
      correctAnswer: '3-1-4-2',
      explanation: 'Pos 1 has □ (was 3rd), Pos 2 has ○ (was 1st), Pos 3 has ★ (was 4th), Pos 4 has △ (was 2nd). Code is 3-1-4-2.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'switch',
    isActive: true,
    order: 5,
    levels: [
      {
        levelNumber: 1,
        name: '4 Shapes Simple',
        description: '4 geometric symbols with single permutation switch.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { shapeCount: 4, complexity: 'single' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: '4 Shapes Speed',
        description: '4 shapes with 40s timer.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { shapeCount: 4, complexity: 'single' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '5 Shapes Transformation',
        description: '5 geometric symbols to track across 5 positions.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { shapeCount: 5, complexity: 'single' },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: '5 Shapes Multi-Swap',
        description: 'Complex transformations with tighter 35s timer.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { shapeCount: 5, complexity: 'multi' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: '6 Shapes Master',
        description: '6 shapes with rapid mental decoding in 30s.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { shapeCount: 6, complexity: 'multi' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Digit Challenge',
    slug: 'digit-challenge',
    shortDescription: 'Numerical reasoning assessment: combine single-use digits with operations to hit the exact target number.',
    description: 'Digit Challenge is a numerical reasoning game. You receive a set of numbers and a target. Your task is to use the available numbers according to the rules (+, -, *, /) to reach the target number.',
    category: 'numerical',
    skills: [
      'Mental arithmetic & calculation speed',
      'Numerical reasoning & factors',
      'Order of operations (BODMAS / PEMDAS)',
      'Working backwards from targets'
    ],
    difficulty: 'Medium',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Evaluates your mathematical intuition, flexibility with numbers, and quick decision-making under strict time limits.',
    objective: 'Reach the target number using the available digits exactly once with valid arithmetic operators.',
    howToThink: 'Start by looking at the target. If target is large (e.g. 48) and digits are [6, 8, 2], notice 6 × 8 = 48 immediately. Don\'t perform random calculations—work backwards from the target number.',
    commonRules: [
      {
        title: 'Single-Use Digits',
        description: 'Each given digit in the pool must be used exactly once in the equation.',
        example: 'Digits [3, 8, 6] must all be present.'
      },
      {
        title: 'Standard Precedence',
        description: 'Multiplication (×) and Division (÷) are evaluated before Addition (+) and Subtraction (-).',
        example: '3 × 8 + 6 = 24 + 6 = 30.'
      }
    ],
    instructions: [
      'Step 1 — Look at all available numbers in the pool.',
      'Step 2 — Look at the target number.',
      'Step 3 — Think about which operation (×, +, -, ÷) gets you closest.',
      'Step 4 — Create your expression.',
      'Step 5 — Submit your answer before time runs out!'
    ],
    rules: [
      'Each given digit must be used once.',
      'Standard operator precedence applies.'
    ],
    tips: [
      'Start by looking at the target number factors.',
      'Don\'t perform random calculations—look for useful multiplication anchors first.'
    ],
    timerDescription: '35-50s per challenge. Mental arithmetic speed is rewarded with bonus points.',
    placementGoal: 'Solve 4-digit and 5-digit multi-operator equations in under 15 seconds.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: '3 digits with addition and subtraction (+, -).',
        focus: 'Basic arithmetic speed.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: '3 digits with multiplication introduced (+, -, *).',
        focus: 'Multiplication factoring.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: '4 digits with +, -, * operators.',
        focus: 'Multi-step calculation.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: '4 digits with division (+, -, *, /).',
        focus: 'Order of operations.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: '5 digits with complex targets and strict 35s timer.',
        focus: 'High-pressure arithmetic mastery.'
      }
    ],
    example: {
      question: 'Use digits [3, 8, 6] to reach target 30.',
      grid: null,
      options: ['3 × 8 + 6', '8 × 6 - 3', '3 × 6 + 8', '6 ÷ 3 × 8'],
      correctAnswer: '3 × 8 + 6',
      explanation: '3 × 8 = 24, and 24 + 6 = 30. All digits [3, 8, 6] are used exactly once.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus (0-30 pts) multiplied by level multiplier.',
    gameType: 'digit',
    isActive: true,
    order: 6,
    levels: [
      {
        levelNumber: 1,
        name: '3 Digits (+, -)',
        description: 'Form expressions using 3 single digits with addition and subtraction.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { digitsCount: 3, operators: ['+', '-'] },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: '3 Digits (+, -, *)',
        description: 'Introduce multiplication to reach double-digit targets.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { digitsCount: 3, operators: ['+', '-', '*'] },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '4 Digits Basic',
        description: '4 digits with +, -, * operators.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { digitsCount: 4, operators: ['+', '-', '*'] },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: '4 Digits Full Operators (+, -, *, /)',
        description: 'Incorporate division with clean integer divisions.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { digitsCount: 4, operators: ['+', '-', '*', '/'] },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Master Arithmetic Blitz',
        description: 'Larger targets with 4-5 digits and rapid 35s timer.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { digitsCount: 5, operators: ['+', '-', '*', '/'] },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'The Same Rule',
    slug: 'the-same-rule',
    shortDescription: 'Identify the common abstract rule governing example pairs and select new figures obeying that rule.',
    description: 'This game tests your ability to identify a common hidden rule across several examples. All examples follow a particular rule. You then receive new objects and need to determine which ones follow the exact same rule.',
    category: 'classification',
    skills: [
      'Rule transfer & abstraction',
      'Common property identification',
      'Structural analysis',
      'Pattern categorization'
    ],
    difficulty: 'Medium',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Directly tests conceptual agility and rule generalization without verbal hints.',
    objective: 'Observe all example sequences, deduce their shared governing rule, and select the option that adheres to that identical rule.',
    howToThink: 'Observe examples ➔ Find common property (e.g. alternating shapes, symmetry, shape count) ➔ Test candidate options ➔ Select matching option. The rule must work for ALL examples.',
    commonRules: [
      {
        title: 'Alternation',
        description: 'Shapes or colors alternate strictly in sequence (A B A B).',
        example: '▲ ● ▲ ●'
      },
      {
        title: 'Bilateral Symmetry',
        description: 'Left side is a horizontal mirror image of the right side.',
        example: '▲ ■ ■ ▲'
      },
      {
        title: 'Equal Frequency Count',
        description: 'Each unique shape appears an identical number of times.',
        example: '2 Triangles and 2 Stars.'
      }
    ],
    instructions: [
      'Step 1 — Analyze the given Example Sets (all obey Rule X).',
      'Step 2 — Formulate what Rule X is (e.g. alternating symbols, equal shape count, symmetry).',
      'Step 3 — Examine candidate options.',
      'Step 4 — Pick the option that obeys Rule X.',
      'Step 5 — Submit and advance!'
    ],
    rules: [
      'Only one option correctly conforms to the rule established by the examples.'
    ],
    tips: [
      'Test your hypothesis against all example figures before choosing your answer.'
    ],
    timerDescription: '30-50s per challenge. Speed up by checking alternation and symmetry first.',
    placementGoal: 'Spot high-order relational rules with 95%+ accuracy.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: 'Simple alternation and shape quantity rules.',
        focus: 'Basic pattern recognition.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: 'Horizontal and vertical symmetry relationships.',
        focus: 'Symmetry detection.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: 'Corner vs center and nested element relationships.',
        focus: 'Positional rule mapping.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: 'Rules requiring two simultaneous conditions.',
        focus: 'Dual-condition verification.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: 'Subtle high-order relationships and distractors.',
        focus: 'Expert abstract classification.'
      }
    ],
    example: {
      question: 'Examples: A: ▲ ● ▲ ●, B: ■ ★ ■ ★, C: ○ △ ○ △. Which option follows the same rule?',
      grid: null,
      options: ['★ △ ★ △', '▲ ▲ ● ●', '■ ■ ■ ■', '△ △ ★ ★'],
      correctAnswer: '★ △ ★ △',
      explanation: 'Rule is strict alternation between two shapes: Shape1 Shape2 Shape1 Shape2. Only ★ △ ★ △ follows this alternation rule.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'same-rule',
    isActive: true,
    order: 7,
    levels: [
      {
        levelNumber: 1,
        name: 'Alternation & Count',
        description: 'Simple alternation and shape quantity rules.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { complexity: 'basic' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: 'Symmetry & Alignment',
        description: 'Horizontal and vertical symmetry relationships.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { complexity: 'symmetry' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: 'Positional Relations',
        description: 'Corner vs center and nested element relationships.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { complexity: 'positional' },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: 'Combined Features',
        description: 'Rules requiring two simultaneous conditions.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { complexity: 'dual' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Abstract Rule Expert',
        description: 'Subtle high-order relationships and distractors.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { complexity: 'abstract' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Colour the Grid',
    slug: 'colour-the-grid',
    shortDescription: 'Feature extraction & classification: discover why example grids received specific colors and color new grids.',
    description: 'Colour the Grid is a pattern recognition and classification game. You are given several example grids. Some are colored differently (e.g. Orange vs Blue). Your task is to discover why they received that color and apply the same rule to new grids.',
    category: 'classification',
    skills: [
      'Hypothesis generation & testing',
      'Feature extraction from matrices',
      'Grid structural analysis',
      'Categorization & classification'
    ],
    difficulty: 'Medium to Hard',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Widely reported in Capgemini cognitive assessments to assess data categorization and rule inference skills.',
    objective: 'Discover why example grids are assigned specific colors (e.g. Orange vs Blue) based on grid features, then classify new grids.',
    howToThink: 'Study the colored examples. Find what all orange examples have in common. Find what all blue examples have in common. Check the 4 corners, letter frequencies (e.g. "Z"), diagonals, and row symmetry.',
    commonRules: [
      {
        title: 'Symbol Frequency Threshold',
        description: 'Grids with ≥ N occurrences of a specific symbol receive Color A; otherwise Color B.',
        example: '≥ 4 "Z"s ➔ Orange. < 4 "Z"s ➔ Blue.'
      },
      {
        title: 'Corner Content Rule',
        description: 'Color is determined by whether the four corners match or contain specific symbols.',
        example: 'All 4 corners contain "X" ➔ Orange.'
      },
      {
        title: 'Diagonal Continuity',
        description: 'Color is determined by whether a unbroken diagonal line of symbols exists.',
        example: 'Main diagonal has matching shapes ➔ Orange.'
      }
    ],
    instructions: [
      'Step 1 — Study the colored examples.',
      'Step 2 — Find what the orange examples have in common.',
      'Step 3 — Find what the blue examples have in common.',
      'Step 4 — Form a definitive rule.',
      'Step 5 — Apply that rule to classify new grids!'
    ],
    rules: [
      'Rules are deterministic and based on structural counts or geometric positions.'
    ],
    tips: [
      'Check the 4 corners first—corner contents are one of the most common classification triggers.'
    ],
    timerDescription: '30-50s per challenge. Speed up by checking corner letters and letter counts.',
    placementGoal: 'Accurately classify multi-feature grids in under 15 seconds.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: 'Rules based on corner or center character values.',
        focus: 'Positional feature detection.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: 'Classification based on symbol frequency thresholds.',
        focus: 'Count thresholds.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: 'Diagonal matching and mirrored rows.',
        focus: 'Diagonal symmetry.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: 'Multi-criteria classification rules.',
        focus: 'Compound conditions.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: 'Dense grids with subtle discriminatory features.',
        focus: 'Master classification speed.'
      }
    ],
    example: {
      question: 'Grids with ≥ 4 "Z"s are Orange. Others are Blue. Classify a grid with 5 "Z"s.',
      grid: null,
      options: ['Orange', 'Blue'],
      correctAnswer: 'Orange',
      explanation: 'The grid contains 5 "Z" symbols, which meets the frequency threshold of ≥ 4 "Z"s for Orange.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'colour-grid',
    isActive: true,
    order: 8,
    levels: [
      {
        levelNumber: 1,
        name: 'Corner & Center Features',
        description: 'Rules based on corner or center character values.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 50,
        difficultyConfig: { ruleType: 'position' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: 'Frequency Counts',
        description: 'Classification based on symbol frequency thresholds.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { ruleType: 'frequency' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: 'Diagonals & Symmetry',
        description: 'Diagonal matching and mirrored rows.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { ruleType: 'symmetry' },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: 'Compound Conditions',
        description: 'Multi-criteria classification rules.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { ruleType: 'compound' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Master Classifier',
        description: 'Dense grids with subtle discriminatory features.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { ruleType: 'master' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: "Doesn't Fit the Rule",
    slug: 'doesnt-fit-the-rule',
    shortDescription: 'Anomaly & outlier detection: spot the single odd-one-out figure that breaks the common rule.',
    description: 'Doesn\'t Fit the Rule is an odd-one-out game. You receive several figures. Most follow the same rule. One does not. Your job is to find the figure that doesn\'t belong.',
    category: 'deductive',
    skills: [
      'Anomaly detection & speed verification',
      'Outlier identification',
      'Simultaneous multi-stimuli inspection',
      'Critical elimination'
    ],
    difficulty: 'Easy to Medium',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Tests your speed in verifying hypotheses across multiple visual stimuli simultaneously.',
    objective: 'Identify what rule the majority of figures follow, and select the single outlier that violates that rule.',
    howToThink: 'Don\'t just look for something that "looks different". Ask: "What rule do the majority follow?" Look for rotation, direction, item count, shape, size, position, symmetry, or polygon side counts.',
    commonRules: [
      {
        title: 'Inconsistent Rotation',
        description: 'Majority rotate by a fixed angle (e.g. +45° clockwise); outlier rotates backwards or by a different angle.',
        example: '↗ ↗ ↗ vs ↘'
      },
      {
        title: 'Quantity Anomaly',
        description: 'Majority contain N items; outlier contains N-1 or N+1 items.',
        example: '[3 dots, 3 squares, 3 triangles] vs [2 diamonds]'
      },
      {
        title: 'Symmetry Violation',
        description: 'Majority possess vertical or horizontal bilateral symmetry; outlier is completely asymmetric.',
        example: '[○, □, △] are symmetric vs [☈] asymmetric'
      },
      {
        title: 'Polygon Side Count',
        description: 'Majority share the same number of vertices/edges.',
        example: 'Quadrilaterals (4 sides) vs Pentagon (5 sides).'
      }
    ],
    instructions: [
      'Step 1 — Examine all figures presented (A, B, C, D).',
      'Step 2 — Identify what common property connects the majority.',
      'Step 3 — Check rotation, shape count, symmetry, and sides.',
      'Step 4 — Click on the single figure that fails to follow that rule.',
      'Step 5 — Submit and advance!'
    ],
    rules: [
      'Exactly one figure violates the pattern.'
    ],
    tips: [
      'Check rotation angles and element counts first as they account for most placement outliers.'
    ],
    timerDescription: '25-45s per challenge. Quick anomaly detection awards maximum speed points.',
    placementGoal: 'Spot the outlier in under 8 seconds with 95%+ consistency.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: 'Clear shape count or orientation differences.',
        focus: 'Basic outlier detection.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: 'Detecting inconsistent angle increments.',
        focus: 'Rotation anomalies.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: 'Detecting subtle reflection and positional breaks.',
        focus: 'Positional anomalies.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: 'Multi-part figures with subtle discrepancies.',
        focus: 'Dual-constraint breaks.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: 'Subtle differences under 25s time pressure.',
        focus: 'High-speed anomaly blitz.'
      }
    ],
    example: {
      question: 'Figures A, B, C rotate 45° clockwise (↗, ↗, ↗). Figure D points 135° downward-right (↘). Which does not fit?',
      grid: null,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'D',
      explanation: 'Figures A, B, and C all point upward-right (45°), while Figure D points downward-right (135°). Therefore, D is the outlier.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'doesnt-fit',
    isActive: true,
    order: 9,
    levels: [
      {
        levelNumber: 1,
        name: 'Obvious Outliers',
        description: 'Clear shape count or orientation differences.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { complexity: 'simple' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: 'Rotation Anomalies',
        description: 'Detecting inconsistent angle increments.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { complexity: 'rotation' },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: 'Position & Symmetry',
        description: 'Detecting subtle reflection and positional breaks.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { complexity: 'symmetry' },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: 'Dual Constraint Breaks',
        description: 'Multi-part figures with subtle discrepancies.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { complexity: 'dual' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Rapid Anomaly Blitz',
        description: 'Subtle differences under 25s time pressure.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 25,
        difficultyConfig: { complexity: 'speed' },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  },
  {
    name: 'Oddo / Similarity Grid',
    slug: 'oddo-similarity-grid',
    shortDescription: 'Matrix topology & visual pattern challenge: recognize structural similarity across invariant configurations.',
    description: 'Oddo / Similarity Grid is a visual pattern and similarity challenge. You are shown multiple grids or figures and need to identify which ones share the same underlying structure or relationship, even when the actual shapes look different.',
    category: 'pattern',
    skills: [
      'Structural similarity recognition',
      'Matrix topology analysis',
      'Visual alignment & symmetry matching',
      'Comparative abstract reasoning'
    ],
    difficulty: 'Medium',
    companyNames: ['Placement assessments'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    whyPractice: 'Trains high-speed matrix inspection and structural pattern matching across abstract figures.',
    objective: 'Look at structure ➔ Ignore superficial differences ➔ Find the relationship ➔ Select the matching figure.',
    howToThink: 'Look beyond the actual symbols. Compare number of elements, positions, symmetry, arrangement, and relative layout. For example, [● ○ / ○ ●] has the same mathematical structure as [▲ △ / △ ▲].',
    commonRules: [
      {
        title: 'Topological Equivalence',
        description: 'Grids have identical arrangements even if symbols differ.',
        example: '[● ○ / ○ ●] has the same structure as [▲ △ / △ ▲].'
      },
      {
        title: 'Bilateral Invariance',
        description: 'Matching grids share identical axes of horizontal or vertical symmetry.',
        example: 'Both Grid A and Grid C possess vertical symmetry.'
      }
    ],
    instructions: [
      'Step 1 — Compare the candidate grids (A, B, C, D).',
      'Step 2 — Look at structure: ignore superficial symbol changes.',
      'Step 3 — Find the invariant relationship (symmetry, quadrant density).',
      'Step 4 — Select the matching pair or figure.',
      'Step 5 — Submit and advance!'
    ],
    rules: [
      'Similarity is based on invariant properties like symmetry or topological arrangement.'
    ],
    tips: [
      'Look for axes of symmetry first across candidate grids.'
    ],
    timerDescription: '25-45s per challenge. Train your eyes to spot structural symmetry instantly.',
    placementGoal: 'Recognize topological equivalence in under 12 seconds.',
    levelsGuide: [
      {
        levelNumber: 1,
        title: 'Level 1',
        description: '2x2 and 3x3 grids with basic bilateral and diagonal symmetries.',
        focus: 'Bilateral symmetry.'
      },
      {
        levelNumber: 2,
        title: 'Level 2',
        description: 'Matching density and quadrant distributions.',
        focus: 'Quadrant distribution.'
      },
      {
        levelNumber: 3,
        title: 'Level 3',
        description: '4x4 grid structural similarity.',
        focus: 'Matrix layout.'
      },
      {
        levelNumber: 4,
        title: 'Level 4',
        description: 'Recognizing grids equivalent under 90° or 180° rotation.',
        focus: 'Rotational invariance.'
      },
      {
        levelNumber: 5,
        title: 'Level 5',
        description: 'High complexity structural comparisons under 25s timer.',
        focus: 'Master topological reasoning.'
      }
    ],
    example: {
      question: 'Grids A and C have vertical symmetry. Grids B and D do not. Which are structurally similar?',
      grid: null,
      options: ['A and C', 'B and C', 'A and D', 'B and D'],
      correctAnswer: 'A and C',
      explanation: 'Grids A and C both possess vertical bilateral symmetry. Despite having different symbols, their underlying mathematical structure is identical.'
    },
    videoUrl: '',
    scoringDescription: 'Base 100 points + speed bonus multiplied by level factor.',
    gameType: 'oddo',
    isActive: true,
    order: 10,
    levels: [
      {
        levelNumber: 1,
        name: '2x2 & 3x3 Symmetries',
        description: 'Identify basic bilateral and diagonal symmetries.',
        difficulty: 'Easy',
        totalChallenges: 5,
        timeLimit: 45,
        difficultyConfig: { gridSize: 3 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 100,
        scoreMultiplier: 1.0
      },
      {
        levelNumber: 2,
        name: 'Shape Distributions',
        description: 'Matching density and quadrant distributions.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 40,
        difficultyConfig: { gridSize: 3 },
        passingCriteria: { minAccuracy: 70 },
        xpReward: 125,
        scoreMultiplier: 1.2
      },
      {
        levelNumber: 3,
        name: '4x4 Matrix Symmetries',
        description: '4x4 grid structural similarity.',
        difficulty: 'Medium',
        totalChallenges: 5,
        timeLimit: 35,
        difficultyConfig: { gridSize: 4 },
        passingCriteria: { minAccuracy: 75 },
        xpReward: 150,
        scoreMultiplier: 1.5
      },
      {
        levelNumber: 4,
        name: 'Rotational Equivalencies',
        description: 'Recognizing grids equivalent under 90° or 180° rotation.',
        difficulty: 'Hard',
        totalChallenges: 5,
        timeLimit: 30,
        difficultyConfig: { gridSize: 4 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 200,
        scoreMultiplier: 1.8
      },
      {
        levelNumber: 5,
        name: 'Matrix Master',
        description: 'High complexity structural comparisons under 25s timer.',
        difficulty: 'Expert',
        totalChallenges: 5,
        timeLimit: 25,
        difficultyConfig: { gridSize: 5 },
        passingCriteria: { minAccuracy: 80 },
        xpReward: 250,
        scoreMultiplier: 2.0
      }
    ]
  }
];

export const seedGames = async () => {
  console.log('Seeding Cognitive Games and Levels...');
  
  // Load companies for reference mapping
  const companies = await Company.find({}).lean();
  const companyMap = {};
  companies.forEach(c => {
    companyMap[c.name.toLowerCase()] = c._id;
    if (c.slug) companyMap[c.slug.toLowerCase()] = c._id;
  });

  for (const gData of gamesData) {
    const { levels, ...gameFields } = gData;

    // Map company names to ObjectIds if available
    const matchedCompanyIds = [];
    if (gameFields.companyNames && Array.isArray(gameFields.companyNames)) {
      gameFields.companyNames.forEach(cName => {
        const id = companyMap[cName.toLowerCase()];
        if (id && !matchedCompanyIds.includes(id)) {
          matchedCompanyIds.push(id);
        }
      });
    }
    gameFields.companies = matchedCompanyIds;

    // Upsert Game
    const game = await Game.findOneAndUpdate(
      { slug: gameFields.slug },
      { $set: gameFields },
      { upsert: true, new: true }
    );

    // Upsert Levels
    for (const lvl of levels) {
      await GameLevel.findOneAndUpdate(
        { gameId: game._id, levelNumber: lvl.levelNumber },
        {
          $set: {
            gameId: game._id,
            levelNumber: lvl.levelNumber,
            name: lvl.name,
            description: lvl.description,
            difficulty: lvl.difficulty,
            totalChallenges: lvl.totalChallenges || 5,
            timeLimit: lvl.timeLimit || 60,
            difficultyConfig: lvl.difficultyConfig || {},
            passingCriteria: lvl.passingCriteria || { minAccuracy: 70 },
            xpReward: lvl.xpReward || 100,
            scoreMultiplier: lvl.scoreMultiplier || 1.0,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`Successfully seeded ${gamesData.length} games with comprehensive educational data and 5 levels each.`);
};
