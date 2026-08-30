import Game from '../models/Game.js';
import GameLevel from '../models/GameLevel.js';
import GameAttempt from '../models/GameAttempt.js';
import UserGameProgress from '../models/UserGameProgress.js';
import { seedGames } from '../config/seedGames.js';

// @desc    Get all active games with company details and user progress
// @route   GET /api/games
// @access  Public (with optional user context)
export const getGames = async (req, res) => {
  try {
    let count = await Game.countDocuments({ isActive: true });
    if (count === 0) {
      console.log('No active games in DB. Auto-seeding 10 cognitive games on the fly...');
      await seedGames();
    }

    const games = await Game.find({ isActive: true })
      .populate('companies', 'name slug logo')
      .sort({ order: 1 })
      .lean();

    let userProgressMap = {};
    if (req.user) {
      const progresses = await UserGameProgress.find({ userId: req.user._id }).lean();
      progresses.forEach((p) => {
        userProgressMap[p.gameId.toString()] = p;
      });
    }

    const enhancedGames = games.map((game) => {
      const progress = userProgressMap[game._id.toString()] || {
        highestUnlockedLevel: 1,
        completedLevels: [],
        bestScore: 0,
        bestAccuracy: 0,
        bestStreak: 0,
      };

      return {
        ...game,
        progress: {
          highestUnlockedLevel: progress.highestUnlockedLevel || 1,
          completedLevelsCount: (progress.completedLevels || []).length,
          bestScore: progress.bestScore || 0,
          bestAccuracy: progress.bestAccuracy || 0,
          bestStreak: progress.bestStreak || 0,
        },
      };
    });

    res.json(enhancedGames);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Server error retrieving games', error: error.message });
  }
};

// @desc    Get single game details by slug, including its 5 levels & progress
// @route   GET /api/games/:slug
// @access  Public (with optional user context)
export const getGameBySlug = async (req, res) => {
  try {
    let game = await Game.findOne({ slug: req.params.slug, isActive: true })
      .populate('companies', 'name slug logo website')
      .lean();

    if (!game) {
      const count = await Game.countDocuments({ isActive: true });
      if (count === 0) {
        console.log('Database empty during game lookup. Auto-seeding 10 games...');
        await seedGames();
        game = await Game.findOne({ slug: req.params.slug, isActive: true })
          .populate('companies', 'name slug logo website')
          .lean();
      }
    }

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const levels = await GameLevel.find({ gameId: game._id, isActive: true })
      .sort({ levelNumber: 1 })
      .lean();

    let progress = {
      highestUnlockedLevel: 1,
      completedLevels: [],
      bestScore: 0,
      bestAccuracy: 0,
      bestTime: 0,
      bestStreak: 0,
      levelStats: [],
    };

    if (req.user) {
      const userProgress = await UserGameProgress.findOne({
        userId: req.user._id,
        gameId: game._id,
      }).lean();

      if (userProgress) {
        progress = userProgress;
      }
    }

    // Merge level status (unlocked, completed, stars, bestScore) into each level
    const enhancedLevels = levels.map((lvl) => {
      const isCompleted = (progress.completedLevels || []).includes(lvl.levelNumber);
      const isUnlocked = lvl.levelNumber <= (progress.highestUnlockedLevel || 1);
      const stat = (progress.levelStats || []).find((s) => s.levelNumber === lvl.levelNumber) || {};

      return {
        ...lvl,
        isUnlocked,
        isCompleted,
        stars: stat.stars || 0,
        bestScore: stat.bestScore || 0,
        bestAccuracy: stat.bestAccuracy || 0,
      };
    });

    res.json({
      game,
      levels: enhancedLevels,
      userProgress: progress,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ message: 'Server error retrieving game details', error: error.message });
  }
};

// @desc    Submit a completed level attempt and update progress
// @route   POST /api/games/:slug/levels/:levelNumber/complete
// @access  Public / Optional Auth (stores to DB if logged in)
export const submitLevelAttempt = async (req, res) => {
  try {
    const { slug, levelNumber: levelNumStr } = req.params;
    const levelNumber = parseInt(levelNumStr, 10);
    const {
      score = 0,
      accuracy = 0,
      totalChallenges = 5,
      correctAnswers = 0,
      wrongAnswers = 0,
      totalTime = 0,
      averageTime = 0,
      fastestTime = 0,
      bestStreak = 0,
      guestId,
    } = req.body;

    const game = await Game.findOne({ slug, isActive: true });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const level = await GameLevel.findOne({ gameId: game._id, levelNumber });
    const minAccuracy = level?.passingCriteria?.minAccuracy ?? 70;
    const passed = accuracy >= minAccuracy && correctAnswers >= Math.ceil(totalChallenges * 0.6);

    // Calculate stars (1 to 5)
    let stars = 0;
    if (passed) {
      if (accuracy === 100 && (averageTime <= 25 || !level?.timeLimit)) {
        stars = 5;
      } else if (accuracy >= 90) {
        stars = 4;
      } else if (accuracy >= 80) {
        stars = 3;
      } else {
        stars = 2;
      }
    } else if (accuracy >= 50) {
      stars = 1;
    }

    // Calculate XP
    let xpEarned = 0;
    if (passed) {
      const baseXP = level?.xpReward || 100;
      const challengeXP = correctAnswers * 15;
      const perfectBonus = accuracy === 100 ? 50 : 0;
      xpEarned = baseXP + challengeXP + perfectBonus;
    } else {
      xpEarned = correctAnswers * 10;
    }

    let progressData = null;
    let unlockedNextLevel = false;

    if (req.user) {
      // Record attempt
      await GameAttempt.create({
        userId: req.user._id,
        gameId: game._id,
        gameSlug: slug,
        levelNumber,
        score,
        accuracy,
        totalChallenges,
        correctAnswers,
        wrongAnswers,
        totalTime,
        averageTime,
        fastestTime,
        bestStreak,
        passed,
        xpEarned,
        stars,
      });

      // Find or create UserGameProgress
      let progress = await UserGameProgress.findOne({
        userId: req.user._id,
        gameId: game._id,
      });

      if (!progress) {
        progress = new UserGameProgress({
          userId: req.user._id,
          gameId: game._id,
          gameSlug: slug,
          highestUnlockedLevel: 1,
          completedLevels: [],
          bestScore: score,
          bestAccuracy: accuracy,
          bestTime: averageTime,
          bestStreak,
          totalChallengesSolved: correctAnswers,
          totalCorrect: correctAnswers,
          totalAttempts: 1,
          totalXPEarned: xpEarned,
          levelStats: [],
        });
      } else {
        progress.totalAttempts += 1;
        progress.totalChallengesSolved += correctAnswers;
        progress.totalCorrect += correctAnswers;
        progress.totalXPEarned += xpEarned;
        progress.bestScore = Math.max(progress.bestScore || 0, score);
        progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, accuracy);
        progress.bestStreak = Math.max(progress.bestStreak || 0, bestStreak);
        if (averageTime > 0) {
          progress.bestTime = progress.bestTime === 0 ? averageTime : Math.min(progress.bestTime, averageTime);
        }
      }

      // Update level-specific stats
      let lvlStat = progress.levelStats.find((s) => s.levelNumber === levelNumber);
      if (!lvlStat) {
        lvlStat = {
          levelNumber,
          unlocked: true,
          completed: false,
          bestScore: 0,
          bestAccuracy: 0,
          bestTime: 0,
          stars: 0,
          attempts: 0,
        };
        progress.levelStats.push(lvlStat);
      }

      lvlStat.attempts += 1;
      lvlStat.bestScore = Math.max(lvlStat.bestScore, score);
      lvlStat.bestAccuracy = Math.max(lvlStat.bestAccuracy, accuracy);
      lvlStat.stars = Math.max(lvlStat.stars, stars);
      if (averageTime > 0) {
        lvlStat.bestTime = lvlStat.bestTime === 0 ? averageTime : Math.min(lvlStat.bestTime, averageTime);
      }

      if (passed) {
        lvlStat.completed = true;
        if (!progress.completedLevels.includes(levelNumber)) {
          progress.completedLevels.push(levelNumber);
        }

        // Unlock next level if currently on highest
        if (levelNumber === progress.highestUnlockedLevel && levelNumber < (game.totalLevels || 5)) {
          progress.highestUnlockedLevel = levelNumber + 1;
          unlockedNextLevel = true;

          // Also add stat entry for newly unlocked level
          const nextLvlStat = progress.levelStats.find((s) => s.levelNumber === levelNumber + 1);
          if (!nextLvlStat) {
            progress.levelStats.push({
              levelNumber: levelNumber + 1,
              unlocked: true,
              completed: false,
              bestScore: 0,
              bestAccuracy: 0,
              bestTime: 0,
              stars: 0,
              attempts: 0,
            });
          }
        }
      }

      progress.lastPlayedAt = new Date();
      await progress.save();
      progressData = progress;
    } else {
      // Guest calculation
      if (passed && levelNumber < (game.totalLevels || 5)) {
        unlockedNextLevel = true;
      }
    }

    res.json({
      passed,
      minAccuracyRequired: minAccuracy,
      score,
      accuracy,
      stars,
      xpEarned,
      unlockedNextLevel,
      nextLevelNumber: passed && levelNumber < (game.totalLevels || 5) ? levelNumber + 1 : null,
      userProgress: progressData,
    });
  } catch (error) {
    console.error('Error submitting level attempt:', error);
    res.status(500).json({ message: 'Server error processing level completion', error: error.message });
  }
};

// @desc    Get aggregated games statistics for user profile
// @route   GET /api/games/user/stats
// @access  Protected
export const getUserAllGamesStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const progresses = await UserGameProgress.find({ userId: req.user._id })
      .populate('gameId', 'name slug thumbnail category difficulty companyNames')
      .lean();

    const attempts = await GameAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(10)
      .populate('gameId', 'name slug thumbnail')
      .lean();

    let totalXP = 0;
    let totalChallengesSolved = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalLevelsCompleted = 0;
    let maxStreak = 0;
    let accuracySum = 0;
    let accuracyCount = 0;

    progresses.forEach((p) => {
      totalXP += p.totalXPEarned || 0;
      totalChallengesSolved += p.totalChallengesSolved || 0;
      totalCorrect += p.totalCorrect || 0;
      totalAttempts += p.totalAttempts || 0;
      totalLevelsCompleted += (p.completedLevels || []).length;
      maxStreak = Math.max(maxStreak, p.bestStreak || 0);
      if (p.bestAccuracy > 0) {
        accuracySum += p.bestAccuracy;
        accuracyCount += 1;
      }
    });

    const overallAccuracy = accuracyCount > 0 ? Math.round(accuracySum / accuracyCount) : 0;

    res.json({
      summary: {
        totalXP,
        totalGamesPlayed: progresses.length,
        totalLevelsCompleted,
        totalChallengesSolved,
        totalCorrect,
        totalAttempts,
        overallAccuracy,
        bestStreak: maxStreak,
      },
      gamesProgress: progresses,
      recentAttempts: attempts,
    });
  } catch (error) {
    console.error('Error retrieving user game stats:', error);
    res.status(500).json({ message: 'Server error retrieving game stats', error: error.message });
  }
};
