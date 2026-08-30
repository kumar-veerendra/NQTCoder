import mongoose from 'mongoose';

const gameAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    guestId: {
      type: String,
      trim: true,
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
    levelNumber: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      default: 0,
    },
    totalChallenges: {
      type: Number,
      required: true,
      default: 5,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    totalTime: {
      type: Number, // seconds
      default: 0,
    },
    averageTime: {
      type: Number, // seconds
      default: 0,
    },
    fastestTime: {
      type: Number, // seconds
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

gameAttemptSchema.index({ userId: 1, gameId: 1, completedAt: -1 });

const GameAttempt = mongoose.model('GameAttempt', gameAttemptSchema);
export default GameAttempt;
