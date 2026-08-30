import api from './api';

// Local storage key helper for guest progress
const getGuestProgressKey = (slug) => `nqtcoder_guest_game_${slug}`;
const getGuestStatsKey = () => `nqtcoder_guest_game_stats`;

export const FALLBACK_GAMES = [
  {
    _id: 'geo-sudo-fallback',
    name: 'Geo-Sudo',
    slug: 'geo-sudo',
    gameType: 'geo-sudo',
    shortDescription: 'Visual logical reasoning game based on completing geometric Latin-square grids using unique shapes.',
    description: 'Geo-Sudo is a visual logical reasoning game based on completing a grid using different shapes. Instead of numbers, Geo-Sudo uses geometric symbols. Find the correct shape that should be placed in the missing position following Latin-square rules.',
    category: 'deductive',
    skills: ['Identify visual patterns', 'Think logically without guessing', 'Eliminate incorrect possibilities', 'Concentrate under time pressure'],
    difficulty: 'Medium to Hard',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'switch-challenge-fallback',
    name: 'Switch Challenge',
    slug: 'switch-challenge',
    gameType: 'switch-challenge',
    shortDescription: 'Decode 4-digit sequence permutation operators transforming geometric shapes under strict countdown timers.',
    description: 'Switch Challenge tests cognitive speed and deductive problem-solving. Given an initial sequence of 4 lime-green geometric shapes and their transformed arrangement, deduce the active permutation operator (e.g. 2413).',
    category: 'deductive',
    skills: ['Rapid deductive reasoning', 'Sequence decoding', 'Working memory under strict time pressure'],
    difficulty: 'Medium to Hard',
    companyNames: ['Cognizant'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'motion-challenge-fallback',
    name: 'Motion Challenge',
    slug: 'motion-challenge',
    gameType: 'motion-challenge',
    shortDescription: 'Sliding-block Klotski puzzle. Slide colored barrier blocks to clear a path for the Red Ball to reach the goal.',
    description: 'Motion Challenge is a spatial navigation puzzle inspired by classic sliding block and Klotski mechanics. Slide rectangular barrier blocks horizontally and vertically to maneuver the red ball to the black hole in minimum moves.',
    category: 'spatial',
    skills: ['Spatial planning', 'Short-term visual simulation', 'Obstacle clearance strategy', 'Move optimization'],
    difficulty: 'Medium to Hard',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'inductive-challenge-fallback',
    name: 'Inductive Challenge',
    slug: 'inductive-challenge',
    gameType: 'inductive-challenge',
    shortDescription: 'Discover the governing geometric transformation rule between example grids and select matching candidate grids.',
    description: 'Inductive Challenge evaluates your inductive reasoning ability. Study two example 3×3 transformation grids to identify the governing spatial rule (rotations, flips, reflections) and identify which pair follows the exact same rule.',
    category: 'inductive',
    skills: ['Pattern induction', 'Abstract spatial rotation', 'Dual-grid relationship matching'],
    difficulty: 'Hard',
    companyNames: ['Capgemini', 'Cognizant'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'grid-challenge-fallback',
    name: 'Grid Challenge',
    slug: 'grid-challenge',
    gameType: 'grid-challenge',
    shortDescription: '3-phase working memory capacity task: memorizing flashing dot coordinates amidst symmetry distractions.',
    description: 'Grid Challenge assesses multi-step working memory capacity. Memorize flashing dots in sequential order, solve an intermediate symmetry task, and recall all coordinates in the exact original sequence.',
    category: 'memory',
    skills: ['Working memory capacity', 'Distraction filtering', 'Sequential coordinate recall'],
    difficulty: 'Medium to Hard',
    companyNames: ['Cognizant'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'digit-challenge-fallback',
    name: 'Digit Challenge',
    slug: 'digit-challenge',
    gameType: 'digit-challenge',
    shortDescription: 'Mental arithmetic under pressure: combine single-use digits and arithmetic operators to hit target values.',
    description: 'Digit Challenge tests quantitative agility and fast mental arithmetic. Use given single-use digits and mathematical operators (+, -, *, /) to construct an equation matching the target value before time expires.',
    category: 'numerical',
    skills: ['Rapid mental calculation', 'Arithmetic decomposition', 'High-pressure speed accuracy'],
    difficulty: 'Medium to Hard',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'colour-the-grid-fallback',
    name: 'Colour the Grid',
    slug: 'colour-the-grid',
    gameType: 'colour-the-grid',
    shortDescription: 'Binary classification game: deduce the underlying feature rule determining whether a grid is Orange or Blue.',
    description: 'Colour the Grid tests feature rule abstraction. Analyze example grids categorized into Orange and Blue classes based on topological or numeric features, then classify new candidate grids accurately.',
    category: 'inductive',
    skills: ['Rule induction', 'Multi-attribute classification', 'Feature abstraction'],
    difficulty: 'Medium',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'the-same-rule-fallback',
    name: 'The Same Rule',
    slug: 'the-same-rule',
    gameType: 'the-same-rule',
    shortDescription: 'Identify which candidate sequence obeys the governing structural relationship shown in example patterns.',
    description: 'The Same Rule measures abstract relationship transfer. Discover the hidden structural property shared by example sequences (such as alternation, symmetry, or parity) and pick the matching candidate sequence.',
    category: 'inductive',
    skills: ['Rule transfer', 'Relational abstraction', 'Structural mapping'],
    difficulty: 'Medium to Hard',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'oddo-similarity-grid-fallback',
    name: 'Oddo / Similarity Grid',
    slug: 'oddo-similarity-grid',
    gameType: 'oddo-similarity-grid',
    shortDescription: 'Matrix topology and symmetry matching: identify which two candidate grids share the same symmetry.',
    description: 'Oddo evaluates visual-spatial matrix topology. Given 4 candidate matrices (A, B, C, D), identify the two grids that share identical underlying structural symmetry (such as vertical reflection, diagonal invariance, or center point symmetry).',
    category: 'spatial',
    skills: ['Matrix symmetry matching', 'Topology extraction', 'Perceptual invariance'],
    difficulty: 'Medium to Hard',
    companyNames: ['Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  },
  {
    _id: 'doesnt-fit-the-rule-fallback',
    name: 'Doesn\'t Fit the Rule',
    slug: 'doesnt-fit-the-rule',
    gameType: 'doesnt-fit-the-rule',
    shortDescription: 'Outlier detection: identify the geometric figure that violates the common rule connecting all other options.',
    description: 'Doesn\'t Fit the Rule tests anomaly detection and systematic feature evaluation. Given multiple geometric figures, discover the common governing rule and select the single outlier that violates it.',
    category: 'deductive',
    skills: ['Anomaly detection', 'Feature comparison', 'Systematic elimination'],
    difficulty: 'Medium',
    companyNames: ['Cognizant', 'Capgemini'],
    totalLevels: 5,
    estimatedTime: '10-15 mins',
    progress: { highestUnlockedLevel: 1, completedLevelsCount: 0, bestScore: 0, bestAccuracy: 0, bestStreak: 0 }
  }
];

export const getGames = async () => {
  try {
    const { data } = await api.get('/api/games');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_GAMES;
  } catch (error) {
    console.warn('API /api/games failed, using fallback games catalog', error);
    return FALLBACK_GAMES;
  }
};

export const getGameBySlug = async (slug) => {
  let gameData = null;
  try {
    const { data } = await api.get(`/api/games/${slug}`);
    gameData = data;
  } catch (error) {
    console.warn(`API /api/games/${slug} failed, building local fallback game payload`, error);
    const fallbackGame = FALLBACK_GAMES.find((g) => g.slug === slug || g.gameType === slug) || FALLBACK_GAMES[0];
    gameData = {
      game: fallbackGame,
      levels: [1, 2, 3, 4, 5].map((lvlNum) => ({
        levelNumber: lvlNum,
        name: `Level ${lvlNum}`,
        description: `Progressive cognitive challenge tier ${lvlNum}`,
        timeLimit: 50,
        scoreMultiplier: 1.0 + (lvlNum - 1) * 0.2,
        passingCriteria: { minAccuracy: 70 },
        totalChallenges: 5,
        difficultyConfig: { gridSize: lvlNum >= 4 ? 5 : 4, missingCells: lvlNum * 2 },
        isUnlocked: lvlNum === 1,
        isCompleted: false,
        stars: 0,
        bestScore: 0,
        bestAccuracy: 0
      })),
      userProgress: {
        highestUnlockedLevel: 1,
        completedLevels: [],
        bestScore: 0,
        bestAccuracy: 0,
        bestTime: 0,
        bestStreak: 0,
        levelStats: []
      }
    };
  }

  // Check if guest has local progress stored
  const localProgressStr = localStorage.getItem(getGuestProgressKey(slug));
  if (localProgressStr && gameData) {
    try {
      const localProgress = JSON.parse(localProgressStr);
      if (!gameData.userProgress || (gameData.userProgress.highestUnlockedLevel || 1) < (localProgress.highestUnlockedLevel || 1)) {
        gameData.userProgress = { ...gameData.userProgress, ...localProgress };
        if (gameData.levels) {
          gameData.levels = gameData.levels.map((lvl) => ({
            ...lvl,
            isUnlocked: lvl.levelNumber <= (localProgress.highestUnlockedLevel || 1),
            isCompleted: (localProgress.completedLevels || []).includes(lvl.levelNumber),
          }));
        }
      }
    } catch (e) {
      console.error('Error merging local progress:', e);
    }
  }

  return gameData;
};

export const submitLevelAttempt = async (slug, levelNumber, attemptData) => {
  let backendResult = null;
  try {
    const { data } = await api.post(`/api/games/${slug}/levels/${levelNumber}/complete`, attemptData);
    backendResult = data;
  } catch (error) {
    console.warn('Backend attempt submission failed, using local offline calculation:', error);
  }

  // Save to local storage for guest persistence
  try {
    const key = getGuestProgressKey(slug);
    let progress = { highestUnlockedLevel: 1, completedLevels: [], bestScore: 0, bestAccuracy: 0, bestStreak: 0 };
    const saved = localStorage.getItem(key);
    if (saved) progress = JSON.parse(saved);

    const passed = attemptData.accuracy >= (attemptData.minAccuracyRequired || 70);
    progress.bestScore = Math.max(progress.bestScore || 0, attemptData.score || 0);
    progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, attemptData.accuracy || 0);
    progress.bestStreak = Math.max(progress.bestStreak || 0, attemptData.bestStreak || 0);

    if (passed) {
      if (!progress.completedLevels.includes(levelNumber)) {
        progress.completedLevels.push(levelNumber);
      }
      if (levelNumber === progress.highestUnlockedLevel && levelNumber < 5) {
        progress.highestUnlockedLevel = levelNumber + 1;
      }
    }
    localStorage.setItem(key, JSON.stringify(progress));

    // Also update global guest stats
    const statsKey = getGuestStatsKey();
    let stats = { totalXP: 0, totalChallengesSolved: 0, totalAttempts: 0 };
    const savedStats = localStorage.getItem(statsKey);
    if (savedStats) stats = JSON.parse(savedStats);
    stats.totalXP += attemptData.xpEarned || (passed ? 150 : 50);
    stats.totalChallengesSolved += attemptData.correctAnswers || 0;
    stats.totalAttempts += 1;
    localStorage.setItem(statsKey, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving local progress:', e);
  }

  return backendResult || {
    passed: attemptData.accuracy >= 70,
    score: attemptData.score,
    accuracy: attemptData.accuracy,
    stars: attemptData.accuracy >= 80 ? 4 : attemptData.accuracy >= 70 ? 3 : 1,
    xpEarned: attemptData.accuracy >= 70 ? 150 : 50,
    unlockedNextLevel: attemptData.accuracy >= 70 && levelNumber < 5,
    nextLevelNumber: attemptData.accuracy >= 70 && levelNumber < 5 ? levelNumber + 1 : null,
  };
};

export const getUserAllGamesStats = async () => {
  try {
    const { data } = await api.get('/api/games/user/stats');
    return data;
  } catch (error) {
    console.warn('Could not fetch user game stats from server, fallback to local', error);
    const guestStats = localStorage.getItem(getGuestStatsKey());
    const parsed = guestStats ? JSON.parse(guestStats) : {};
    return {
      summary: {
        totalXP: parsed.totalXP || 0,
        totalGamesPlayed: 0,
        totalLevelsCompleted: 0,
        totalChallengesSolved: parsed.totalChallengesSolved || 0,
        totalCorrect: parsed.totalChallengesSolved || 0,
        totalAttempts: parsed.totalAttempts || 0,
        overallAccuracy: 0,
        bestStreak: 0,
      },
      gamesProgress: [],
      recentAttempts: [],
    };
  }
};
