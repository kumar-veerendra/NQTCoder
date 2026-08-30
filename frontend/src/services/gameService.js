import api from './api';

// Local storage key helper for guest progress
const getGuestProgressKey = (slug) => `nqtcoder_guest_game_${slug}`;
const getGuestStatsKey = () => `nqtcoder_guest_game_stats`;

export const getGames = async () => {
  try {
    const { data } = await api.get('/api/games');
    return data;
  } catch (error) {
    console.warn('API /api/games failed, using fallback games catalog', error);
    // If backend is unreachable, fallback to minimal seed list
    return [];
  }
};

export const getGameBySlug = async (slug) => {
  try {
    const { data } = await api.get(`/api/games/${slug}`);
    
    // Check if guest has local progress stored
    const localProgressStr = localStorage.getItem(getGuestProgressKey(slug));
    if (localProgressStr) {
      try {
        const localProgress = JSON.parse(localProgressStr);
        if (!data.userProgress || (data.userProgress.highestUnlockedLevel || 1) < (localProgress.highestUnlockedLevel || 1)) {
          data.userProgress = { ...data.userProgress, ...localProgress };
          // update levels unlocked status
          if (data.levels) {
            data.levels = data.levels.map((lvl) => ({
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

    return data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
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
