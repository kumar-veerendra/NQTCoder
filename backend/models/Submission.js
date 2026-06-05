import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    // ── Relations ──────────────────────────────
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true
    },

    question: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Question',
      required: true,
      index:    true
    },

    // ── Submission Content ──────────────────────
    code: {
      type:     String,
      required: true
    },

    language: {
      type:     String,
      required: true,
      enum:     ['cpp', 'java', 'python']
    },

    // ── Verdict ────────────────────────────────
    status: {
      type:    String,
      enum:    [
        'Accepted',
        'Wrong Answer',
        'Runtime Error',
        'Time Limit Exceeded',
        'Compilation Error',
        'Pending'
      ],
      default: 'Pending',
      index:   true
    },

    /** Number of test cases that passed */
    passedCount: {
      type:    Number,
      default: 0,
      min:     0
    },

    /** Total test cases evaluated (visible + hidden) */
    totalCount: {
      type:    Number,
      default: 0,
      min:     0
    },

    /** Error message for compilation/runtime errors */
    errorMessage: {
      type: String
    },

    // ── Performance Stats ──────────────────────
    /** Execution runtime in milliseconds */
    runTime: {
      type: Number,   // ms
      min:  0
    },

    /** Peak memory used during execution in MB */
    memoryUsed: {
      type: Number,   // MB
      min:  0
    },

    // ── First Solve Tracking ───────────────────
    /**
     * True if this is the first Accepted submission by this user
     * for this question. Used for profile "first solve" stats and streaks.
     */
    isFirstAccepted: {
      type:    Boolean,
      default: false
    },

    // ── Mock Test Context ──────────────────────
    /**
     * If this submission was made inside a Mock Test session,
     * this field references that MockTest document.
     */
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'MockTest'
    },

    /** Score awarded for this submission (used in mock test scoring) */
    score: {
      type:    Number,
      default: 0,
      min:     0
    }
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true }
  }
);

// ── Virtual: pass rate percentage ─────────────
submissionSchema.virtual('passRate').get(function () {
  if (!this.totalCount || this.totalCount === 0) return '0%';
  return ((this.passedCount / this.totalCount) * 100).toFixed(0) + '%';
});

// ── Indexes for fast profile/leaderboard queries ─
// Fetch all submissions by a user, sorted by newest first
submissionSchema.index({ user: 1, createdAt: -1 });

// Fetch all submissions on a question
submissionSchema.index({ question: 1, status: 1 });

// Fetch accepted submissions for a specific user + question (first-solve detection)
submissionSchema.index({ user: 1, question: 1, status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
