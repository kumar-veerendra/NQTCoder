import mongoose from 'mongoose';

const gameLevelSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
      index: true,
    },
    levelNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Easy',
    },
    totalChallenges: {
      type: Number,
      default: 5,
    },
    timeLimit: {
      type: Number,
      default: 60, // seconds per challenge
    },
    difficultyConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    passingCriteria: {
      minAccuracy: { type: Number, default: 70 }, // percentage
      minScore: { type: Number, default: 0 },
      maxAverageTime: { type: Number, default: null }, // seconds
    },
    xpReward: {
      type: Number,
      default: 100,
    },
    scoreMultiplier: {
      type: Number,
      default: 1.0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

gameLevelSchema.index({ gameId: 1, levelNumber: 1 }, { unique: true });

const GameLevel = mongoose.model('GameLevel', gameLevelSchema);
export default GameLevel;
