import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    failureMessage: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const webDevSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebDevQuestion',
      required: true,
      index: true,
    },
    questionVersion: {
      type: Number,
      default: 1,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    htmlCode: {
      type: String,
      default: '',
    },
    cssCode: {
      type: String,
      default: '',
    },
    javascriptCode: {
      type: String,
      default: '',
    },
    score: {
      type: Number, // Percentage 0 - 100
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 100,
      min: 1,
    },
    passedTests: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Passed', 'Partial', 'Failed'],
      default: 'Failed',
      index: true,
    },
    testResults: {
      type: [testResultSchema],
      default: [],
    },
    timeSpent: {
      type: Number, // seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookup of user attempts on a question
webDevSubmissionSchema.index({ user: 1, question: 1, createdAt: -1 });

const WebDevSubmission =
  mongoose.models.WebDevSubmission || mongoose.model('WebDevSubmission', webDevSubmissionSchema);

export default WebDevSubmission;
