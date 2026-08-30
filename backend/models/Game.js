import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    heroImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['deductive', 'inductive', 'memory', 'spatial', 'numerical', 'classification', 'pattern'],
      default: 'deductive',
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['Easy', 'Easy to Medium', 'Medium', 'Medium to Hard', 'Hard'],
      default: 'Medium',
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    companyNames: [
      {
        type: String,
        trim: true,
      },
    ],
    totalLevels: {
      type: Number,
      default: 5,
    },
    estimatedTime: {
      type: String,
      default: '10-15 mins',
    },
    whyPractice: {
      type: String,
      default: '',
    },
    objective: {
      type: String,
      default: '',
    },
    howToThink: {
      type: String,
      default: '',
    },
    commonRules: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        example: { type: String, default: '' },
      },
    ],
    levelsGuide: [
      {
        levelNumber: { type: Number },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        focus: { type: String, default: '' },
      },
    ],
    timerDescription: {
      type: String,
      default: '',
    },
    placementGoal: {
      type: String,
      default: '',
    },
    instructions: [
      {
        type: String,
        trim: true,
      },
    ],
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
    tips: [
      {
        type: String,
        trim: true,
      },
    ],
    example: {
      question: { type: String, default: '' },
      grid: { type: mongoose.Schema.Types.Mixed, default: null },
      options: [{ type: String }],
      correctAnswer: { type: String, default: '' },
      explanation: { type: String, default: '' },
    },
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    scoringDescription: {
      type: String,
      default: 'Base +100 per challenge + speed bonus up to +30, multiplied by level factor.',
    },
    gameType: {
      type: String,
      required: true,
      enum: [
        'geo-sudo',
        'inductive',
        'grid-memory',
        'motion',
        'switch',
        'digit',
        'same-rule',
        'colour-grid',
        'doesnt-fit',
        'oddo',
      ],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

gameSchema.index({ name: 'text', shortDescription: 'text', skills: 'text' });

const Game = mongoose.model('Game', gameSchema);
export default Game;
