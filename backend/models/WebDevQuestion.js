import mongoose from 'mongoose';

const testSpecSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    failureMessage: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      default: 20,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'dom',
        'css',
        'click',
        'input',
        'change',
        'submit',
        'keyboard',
        'attribute',
        'count',
        'visibility',
        'responsive',
        'custom',
      ],
      default: 'dom',
    },
    target: {
      type: String, // CSS selector (e.g. '#count', '.card', 'button')
      trim: true,
    },
    action: {
      type: {
        type: String, // 'click', 'type', 'key', 'viewport', etc.
      },
      value: mongoose.Schema.Types.Mixed,
      key: String,
      width: Number,
      height: Number,
    },
    assertion: {
      type: {
        type: String, // 'exists', 'textEquals', 'textContains', 'computedCss', 'cssRange', 'cssGreaterThan', 'attributeEquals', 'countEquals', 'hasClass', 'isVisible'
        required: true,
      },
      expected: mongoose.Schema.Types.Mixed,
      property: String, // for computed CSS (e.g. 'border-radius', 'background-color')
      attribute: String, // for attributes (e.g. 'type', 'placeholder')
      className: String, // for class checks
      min: Number, // for ranges
      max: Number,
      operator: String, // 'greaterThan', 'lessThan', 'equals'
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const webDevQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['html', 'css', 'javascript', 'html-css', 'html-css-javascript'],
      default: 'html-css-javascript',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    starterCode: {
      html: {
        type: String,
        default: '',
      },
      css: {
        type: String,
        default: '',
      },
      javascript: {
        type: String,
        default: '',
      },
    },
    solutionCode: {
      html: {
        type: String,
        default: '',
      },
      css: {
        type: String,
        default: '',
      },
      javascript: {
        type: String,
        default: '',
      },
    },
    tests: {
      type: [testSpecSchema],
      default: [],
    },
    points: {
      type: Number,
      default: 100,
      min: 1,
    },
    timeLimit: {
      type: Number,
      default: 20, // in minutes
      min: 1,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-sync question points with test points if tests exist
webDevQuestionSchema.pre('save', function (next) {
  if (this.tests && this.tests.length > 0) {
    const totalTestPoints = this.tests.reduce((acc, t) => acc + (t.points || 0), 0);
    if (totalTestPoints > 0) {
      this.points = totalTestPoints;
    }
  }
  next();
});

const WebDevQuestion =
  mongoose.models.WebDevQuestion || mongoose.model('WebDevQuestion', webDevQuestionSchema);

export default WebDevQuestion;
