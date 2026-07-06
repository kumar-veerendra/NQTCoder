import mongoose from 'mongoose';

// ─────────────────────────────────────────────
//  Legacy Coding-specific Sub-schemas
// ─────────────────────────────────────────────

const exampleSchema = new mongoose.Schema(
  {
    input:       { type: String, trim: true },
    output:      { type: String, trim: true },
    explanation: { type: String, trim: true }
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input:  { type: String, default: '', trim: true },
    output: { type: String, default: '', trim: true }
  },
  { _id: false }
);

// ─────────────────────────────────────────────
//  Base Question Schema
// ─────────────────────────────────────────────

const baseOptions = {
  discriminatorKey: 'kind', // Specifies the model subclass ("CodingQuestion" or "MCQQuestion")
  collection: 'questions',  // Everything resides in a single 'questions' collection under the hood
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
};

const baseQuestionSchema = new mongoose.Schema(
  {
    // ---------- Identity ----------
    questionNo: { type: Number, unique: true, index: true },
    questionId: { type: String, unique: true, sparse: true, index: true }, // MVP (e.g. "QA-ARITH-0001"), sparse for legacy compatibility
    slug: { type: String, unique: true, required: true, index: true },       // MVP (e.g. "avg-speed-train-problem-1")

    // ---------- Classification ----------
    domain: {
      type: String,
      required: true,
      enum: ['coding', 'aptitude'],
      default: 'coding',
      index: true
    },                                                                       // MVP
    section: {
      type: String,
      required: true,
      enum: ['quant', 'logical', 'verbal', 'di', 'programming'],
      default: 'programming',
      index: true
    },                                                                       // MVP
    topic: { type: String, required: [true, 'Topic is required'], trim: true, index: true }, // MVP (normalized key: e.g. "percentage")
    displayName: { type: String, trim: true },                               // MVP (UI friendly label: e.g. "Percentage")
    subTopic: { type: String, index: true },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard', 'Easy', 'Easy-Medium', 'Medium', 'Medium-Hard', 'Hard'],
        message: 'Difficulty must be easy, medium, hard or legacy values'
      },
      index: true
    },                                                                       // MVP
    difficultyScore: { type: Number, default: 0.0 },
    displayOrder: { type: Number, default: 0 },                             // Custom sidebar sorting order
    tags: [{ type: String, lowercase: true, trim: true, index: true }],
    applicableCompanies: [{ type: String, trim: true, index: true }],        // MVP
    company: [{ type: String, trim: true, index: true }],
    language: { type: String, default: 'en', required: true },              // MVP

    // ---------- Content ----------
    content: {
      statement: { type: String },                                           // MVP (optional for legacy coding)
      format: { type: String, enum: ['markdown', 'latex', 'html'], default: 'markdown' }, // MVP
      assets: [
        {
          type: { type: String, enum: ['image', 'svg', 'audio', 'video', 'pdf', 'table', 'code_snippet'] },
          url: { type: String },
          caption: { type: String },
          width: { type: Number },
          height: { type: Number },
          alt: { type: String }
        }
      ]
    },

    // ---------- Source / Provenance ----------
    source: {
      type: { type: String, enum: ['original', 'pyq', 'company_style'], default: 'original' }, // MVP
      isVerified: { type: Boolean, default: false },                         // MVP
      appearances: [
        {
          company: { type: String, index: true },
          exam: { type: String },
          year: { type: Number },
          shift: { type: String },
          examDate: { type: String }
        }
      ]
    },

    // ---------- Metadata ----------
    meta: {
      estimatedSolveTimeSec: { type: Number, default: 90 },                  // MVP
      marks: { type: Number, default: 1 },                                   // MVP
      negativeMarks: { type: Number, default: 0 },                           // MVP
      status: { type: String, enum: ['draft', 'published', 'archived', 'active', 'inactive'], default: 'published', index: true }, // MVP (includes active/inactive for legacy compatibility)
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },       // MVP
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },

    // ---------- Raw Analytics Counters ----------
    analytics: {
      attempts: { type: Number, default: 0 },                                // MVP
      correct: { type: Number, default: 0 },                                 // MVP
      wrong: { type: Number, default: 0 },                                   // MVP
      skipped: { type: Number, default: 0 }                                  // MVP
    }
  },
  baseOptions
);

// ─────────────────────────────────────────────
//  Virtual Fields (computed, not stored in DB)
// ─────────────────────────────────────────────

// Acceptance rate compatibility for legacy dashboard
baseQuestionSchema.virtual('acceptanceRate').get(function () {
  const total = (this.analytics?.attempts) || (this.totalSubmissions) || 0;
  const passed = (this.analytics?.correct) || (this.totalAccepted) || 0;
  if (!total || total === 0) return '0.0%';
  return ((passed / total) * 100).toFixed(1) + '%';
});

// ─────────────────────────────────────────────
//  Pre-save Hook: Sync Legacy & Discriminator Fields
// ─────────────────────────────────────────────

baseQuestionSchema.pre('save', function (next) {
  // Sync slug if not set
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Populate displayName if missing
  if (!this.displayName && this.topic) {
    this.displayName = this.topic;
  }

  // Backwards compatibility sync for legacy coding fields
  if (this.domain === 'coding') {
    if (this.title && (!this.content || !this.content.statement)) {
      this.content = {
        statement: this.description || '',
        format: 'markdown',
        assets: []
      };
    }
  }

  next();
});

// Create Base Model
const Question = mongoose.model('Question', baseQuestionSchema);

// ─────────────────────────────────────────────
//  MCQQuestion Discriminator Schema
// ─────────────────────────────────────────────

const MCQSchema = new mongoose.Schema({
  questionType: {
    type: String,
    required: true,
    enum: ['single_correct', 'multiple_correct', 'numerical', 'assertion_reason'],
    default: 'single_correct',
    index: true
  },
  options: [
    {
      optionId: { type: String, required: true }, // e.g. "A", "B", "C", "D"
      text: { type: String, required: true },
      image: { type: String }
    }
  ],
  correctAnswer: {
    type: [String],
    required: true,
    validate: {
      validator: function (val) {
        if (this.questionType === 'single_correct') {
          return val.length === 1;
        }
        if (this.questionType === 'multiple_correct') {
          return val.length >= 2;
        }
        return true;
      },
      message: 'correctAnswer elements must match questionType rules'
    }
  },

  // ---------- Explanations & Learning ----------
  explanation: {
    summary: { type: String, required: true },
    steps: [
      {
        title: { type: String },
        content: { type: String, required: true }
      }
    ],
    formula: [{ type: String }],
    shortcut: { type: String },
    commonMistakes: [{ type: String }],
    notes: { type: String },
    hints: [
      {
        level: { type: Number, required: true },
        text: { type: String, required: true },
        aiGenerated: { type: Boolean, default: false }
      }
    ]
  }
});

const MCQQuestion = Question.discriminator('MCQQuestion', MCQSchema);

// ─────────────────────────────────────────────
//  CodingQuestion Discriminator Schema
// ─────────────────────────────────────────────

const CodingSchema = new mongoose.Schema({
  // Legacy coding fields kept here under CodingQuestion schema
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String
  },
  inputFormat: { type: String },
  outputFormat: { type: String },
  constraints: { type: String },
  examples: [exampleSchema],
  hints: [{ type: String }],
  visibleTestCases: {
    type: [testCaseSchema]
  },
  hiddenTestCases: {
    type: [testCaseSchema]
  },
  languagesSupported: {
    type: [String],
    default: ['cpp', 'java', 'python']
  },
  timeLimit: {
    type: Number,
    default: 2,
    min: [1, 'Time limit must be at least 1 second'],
    max: [10, 'Time limit cannot exceed 10 seconds']
  },
  memoryLimit: {
    type: Number,
    default: 256,
    min: [16, 'Memory limit must be at least 16 MB'],
    max: [512, 'Memory limit cannot exceed 512 MB']
  },
  timerDuration: {
    type: Number,
    default: 20,
    min: [5, 'Timer must be at least 5 minutes'],
    max: [120, 'Timer cannot exceed 120 minutes']
  },
  timerEnabled: {
    type: Boolean,
    default: true
  },
  totalSubmissions: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAccepted: {
    type: Number,
    default: 0,
    min: 0
  }
});

const CodingQuestion = Question.discriminator('CodingQuestion', CodingSchema);

// ─────────────────────────────────────────────
//  VerbalQuestion Discriminator Schema
// ─────────────────────────────────────────────

const VerbalSchema = new mongoose.Schema({
  verbalType: {
    type: String,
    required: true,
    enum: ['sentence_completion', 'passage_recall', 'email_writing'],
    index: true
  },

  // For sentence_completion
  blanks: [
    {
      blankIndex: { type: Number, required: true },
      placeholder: { type: String, default: '___' },
      acceptableAnswers: {
        type: [String],
        required: true,
        validate: {
          validator: function (val) {
            return val && val.length > 0;
          },
          message: 'At least one correct answer must be provided for each blank.'
        }
      }
    }
  ],

  // For passage_recall
  passageText: { type: String, trim: true },
  readingDurationSec: { type: Number, default: 30 },
  writingDurationSec: { type: Number, default: 90 },

  // For email_writing
  emailPrompt: { type: String, trim: true },
  guidelines: { type: [String], default: [] },
  minWords: { type: Number, default: 50 },
  maxWords: { type: Number, default: 150 },
  writingDurationSecEmail: { type: Number, default: 540 }
});

const VerbalQuestion = Question.discriminator('VerbalQuestion', VerbalSchema);

// ─────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────

export { MCQQuestion, CodingQuestion, VerbalQuestion };
export default Question;
