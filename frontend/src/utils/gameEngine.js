/**
 * Game Engine Utility Functions for NQTCoder Games
 */

export const calculateChallengeScore = ({
  isCorrect,
  timeRemaining = 0,
  timeLimit = 60,
  levelMultiplier = 1.0,
  streak = 0,
}) => {
  if (!isCorrect) return { points: 0, speedBonus: 0, streakBonus: 0, total: 0 };

  const basePoints = 100;
  
  // Speed bonus: up to +30 points based on remaining time fraction
  const safeTimeLimit = timeLimit > 0 ? timeLimit : 60;
  const speedRatio = Math.max(0, Math.min(1, timeRemaining / safeTimeLimit));
  const speedBonus = Math.round(30 * speedRatio);

  // Streak bonus: incremental boost
  let streakBonus = 0;
  if (streak >= 10) streakBonus = 50;
  else if (streak >= 5) streakBonus = 20;
  else if (streak >= 3) streakBonus = 10;

  const rawScore = basePoints + speedBonus + streakBonus;
  const total = Math.round(rawScore * (levelMultiplier || 1.0));

  return {
    basePoints,
    speedBonus,
    streakBonus,
    total,
  };
};

export const calculateStars = ({ accuracy = 0, averageTime = 0, targetTime = 30 }) => {
  if (accuracy === 100) {
    return averageTime <= targetTime ? 5 : 4;
  }
  if (accuracy >= 80) return 4;
  if (accuracy >= 70) return 3;
  if (accuracy >= 50) return 2;
  if (accuracy > 0) return 1;
  return 0;
};

export const formatTime = (seconds) => {
  const secs = Math.max(0, Math.floor(seconds));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const evaluateLevelPass = ({
  accuracy = 0,
  correctAnswers = 0,
  totalChallenges = 5,
  passingCriteria = { minAccuracy: 70 },
  averageTime = 0,
}) => {
  const minAcc = passingCriteria?.minAccuracy ?? 70;
  const minCorrect = Math.ceil(totalChallenges * 0.6);
  const passed = accuracy >= minAcc && correctAnswers >= minCorrect;

  return {
    passed,
    minAccuracy: minAcc,
    minCorrect,
  };
};
