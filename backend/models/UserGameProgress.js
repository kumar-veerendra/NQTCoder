import mongoose from 'mongoose';

const userGameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true,
    },
    gameSlug: {
      type: String,
      required: true,
      index: true,
    },
    highestUnlockedLevel: {
      type: Number,
      default: 1,
    },
    completedLevels: [
      {
        type: Number,
      },
    ],
    bestScore: {
      type: Number,
      default: 0,
    },
    bestAccuracy: {
      type: Number,
      default: 0,
    },
    bestTime: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    totalChallengesSolved: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalXPEarned: {
      type: Number,
      default: 0,
    },
    levelStats: [
      {
        levelNumber: { type: Number, required: true },
        unlocked: { type: Boolean, default: false },
        completed: { type: Boolean, default: false },
        bestScore: { type: Number, default: 0 },
        bestAccuracy: { type: Number, default: 0 },
        bestTime: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        attempts: { type: Number, default: 0 },
      },
    ],
    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userGameProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const UserGameProgress = mongoose.model('UserGameProgress', userGameProgressSchema);
export default UserGameProgress;
