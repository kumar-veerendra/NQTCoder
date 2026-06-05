import mongoose from 'mongoose';

// ─────────────────────────────────────────────
//  Sub-schemas
// ─────────────────────────────────────────────

/**
 * Example shown in the problem statement to the user.
 * All fields are optional — explanation may not always be present.
 */
const exampleSchema = new mongoose.Schema(
  {
    input:       { type: String, trim: true },
    output:      { type: String, trim: true },
    explanation: { type: String, trim: true }
  },
  { _id: false }   // No separate _id needed for sub-documents
);

/**
 * A single test case used for Run / Submit evaluation.
 * Both input and output are required and must be non-empty.
 */
const testCaseSchema = new mongoose.Schema(
  {
    input:  { type: String, default: '', trim: true },
    output: { type: String, default: '', trim: true }
  },
  { _id: false }
);

// ─────────────────────────────────────────────
//  Main Question Schema
// ─────────────────────────────────────────────

const questionSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────
    /**
     * Auto-assigned sequential number like LeetCode (#1, #2, ...).
     * Assigned by the seeder/controller — never set manually by the user.
     */
    questionNo: {
      type:   Number,
      unique: true,
      index:  true
    },

    /**
     * Short URL-friendly slug derived from the title.
     * e.g. "Merge Overlapping Intervals" → "merge-overlapping-intervals"
     * Used for clean URLs: /problem/merge-overlapping-intervals
     */
    slug: {
      type:      String,
      sparse:    true,
      lowercase: true,
      trim:      true,
      index:     true
    },

    // ── Core Problem Fields ──────────────────
    title: {
      type:     String,
      required: [true, 'Question title is required'],
      trim:     true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    description: {
      type:     String,
      required: [true, 'Problem description is required']
    },

    /**
     * Separate input/output format sections (optional but recommended).
     * Makes the problem statement cleaner than embedding in description.
     */
    inputFormat: {
      type: String
    },

    outputFormat: {
      type: String
    },

    constraints: {
      type: String
    },

    // ── Classification ───────────────────────
    difficulty: {
      type:     String,
      required: [true, 'Difficulty is required'],
      enum:     {
        values:  ['Easy', 'Easy-Medium', 'Medium', 'Medium-Hard', 'Hard'],
        message: 'Difficulty must be Easy, Easy-Medium, Medium, Medium-Hard, or Hard'
      }
    },

    /**
     * Primary topic category.
     * e.g. "Arrays", "Strings", "Dynamic Programming", "Graphs"
     */
    topic: {
      type:     String,
      required: [true, 'Topic is required'],
      trim:     true
    },

    /**
     * Additional searchable tags for fine-grained filtering.
     * e.g. ["two-pointer", "sliding-window", "prefix-sum"]
     */
    tags: [{ type: String, lowercase: true, trim: true }],

    /**
     * Companies that have asked this question in their hiring tests.
     * e.g. ["TCS", "Infosys", "Wipro"]
     */
    company: [{ type: String, trim: true }],

    /**
     * Exam date / shift info as a descriptive string.
     * e.g. "Mar 20, 2026 -- Shift 1", "2023 Confirmed"
     */
    examDate: {
      type: String,
      trim: true
    },

    // ── Problem Content ──────────────────────
    /**
     * Worked examples shown in the problem statement.
     * Typically 2–3 examples with explanation.
     */
    examples: [exampleSchema],

    /**
     * Hints revealed one-by-one to help the user solve the problem.
     */
    hints: [{ type: String }],

    // ── Test Cases ───────────────────────────
    /**
     * Visible test cases shown to the user in the Run panel.
     * Minimum 3 required for a well-formed problem.
     */
    visibleTestCases: {
      type:     [testCaseSchema],
      validate: {
        validator: (v) => v && v.length >= 1,
        message:  'At least 1 visible test case is required'
      }
    },

    /**
     * Hidden test cases used for final submission evaluation only.
     * Never exposed to the frontend user.
     * Minimum 5 recommended for thorough evaluation.
     */
    hiddenTestCases: {
      type:     [testCaseSchema],
      validate: {
        validator: (v) => v && v.length >= 1,
        message:  'At least 1 hidden test case is required'
      }
    },

    // ── Execution Config ─────────────────────
    /**
     * Languages the user can submit in.
     * Defaults to all three supported languages.
     */
    languagesSupported: {
      type:    [String],
      default: ['cpp', 'java', 'python'],
      enum:    {
        values:  ['cpp', 'java', 'python'],
        message: '{VALUE} is not a supported language'
      }
    },

    /** Per-test-case execution time limit in seconds */
    timeLimit: {
      type:    Number,
      default: 2,
      min:     [1, 'Time limit must be at least 1 second'],
      max:     [10, 'Time limit cannot exceed 10 seconds']
    },

    /** Memory limit for execution in MB */
    memoryLimit: {
      type:    Number,
      default: 256,
      min:     [16, 'Memory limit must be at least 16 MB'],
      max:     [512, 'Memory limit cannot exceed 512 MB']
    },

    // ── Practice Timer Config ────────────────
    /** Duration of the countdown timer shown to the user (in minutes) */
    timerDuration: {
      type:    Number,
      default: 20,
      min:     [5,   'Timer must be at least 5 minutes'],
      max:     [120, 'Timer cannot exceed 120 minutes']
    },

    /** Whether the practice timer is active for this question */
    timerEnabled: {
      type:    Boolean,
      default: true
    },

    // ── Live Statistics (auto-updated on submissions) ──
    /** Total number of submissions across all users */
    totalSubmissions: {
      type:    Number,
      default: 0,
      min:     0
    },

    /** Total number of accepted (passing) submissions */
    totalAccepted: {
      type:    Number,
      default: 0,
      min:     0
    },

    // ── Status & Access Control ──────────────
    /**
     * Controls visibility on the platform.
     * - active:   Visible to all users
     * - draft:    Only visible to admins (work-in-progress)
     * - inactive: Hidden from users (deprecated/disabled)
     */
    status: {
      type:    String,
      enum:    ['active', 'draft', 'inactive'],
      default: 'active',
      index:   true
    },

    /** Reference to the admin who created this question */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  },
  {
    // Auto-manage createdAt and updatedAt timestamps
    timestamps: true,

    // Virtual fields (e.g. acceptanceRate) included in JSON output
    toJSON:   { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─────────────────────────────────────────────
//  Virtual Fields (computed, not stored in DB)
// ─────────────────────────────────────────────

/**
 * Acceptance rate as a percentage, computed from totalSubmissions and totalAccepted.
 * e.g. 1500 accepted / 5000 total = "30.0%"
 */
questionSchema.virtual('acceptanceRate').get(function () {
  if (!this.totalSubmissions || this.totalSubmissions === 0) return '0.0%';
  return ((this.totalAccepted / this.totalSubmissions) * 100).toFixed(1) + '%';
});

// ─────────────────────────────────────────────
//  Pre-save Hook: Auto-generate slug from title
// ─────────────────────────────────────────────

questionSchema.pre('save', function (next) {
  // Generate slug from title if not already set
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters
      .replace(/\s+/g, '-')           // Spaces → hyphens
      .replace(/-+/g, '-');           // Collapse multiple hyphens
  }
  next();
});

// ─────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────

// Case-insensitive index on title
questionSchema.index(
  { title: 1 },
  { collation: { locale: 'en', strength: 2 } }
);

// Compound index for common filtered list queries (difficulty + topic + status)
questionSchema.index({ difficulty: 1, topic: 1, status: 1 });

// Index for company filter queries
questionSchema.index({ company: 1 });

// Index for tag filter queries
questionSchema.index({ tags: 1 });

// ─────────────────────────────────────────────
//  Model Export
// ─────────────────────────────────────────────

const Question = mongoose.model('Question', questionSchema);

export default Question;
