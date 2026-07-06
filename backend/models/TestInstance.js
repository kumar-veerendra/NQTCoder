import mongoose from 'mongoose';

const testInstanceSchema = new mongoose.Schema(
  {
    blueprintId: { 
      type: String, 
      required: true, 
      index: true 
    }, // references TestBlueprint.blueprintId
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
      required: true,
      index: true
    },
    // The generated set of questions, frozen for this session
    questions: [
      {
        questionId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Question', 
          required: true 
        },
        sectionIndex: {
          type: Number,
          default: 0,
          required: true
        },
        submittedAnswer: [{ type: String }],
        isCorrect: { type: Boolean, default: false },
        isAttempted: { type: Boolean, default: false },
        timeSpentSec: { type: Number, default: 0 },
        verbalEvaluation: {
          type: new mongoose.Schema(
            {
              status: {
                type: String,
                enum: ['pending', 'completed', 'quota_exceeded', 'failed'],
                default: 'pending',
                required: true,
                index: true
              },
              score: { type: Number },
              grammarScore: { type: Number, default: 0 },
              vocabularyScore: { type: Number, default: 0 },
              contentRelevanceScore: { type: Number, default: 0 },
              feedback: { type: String },
              grammarErrors: [
                {
                  originalText: { type: String },
                  suggestedFix: { type: String },
                  explanation: { type: String }
                }
              ],
              keyPointsMatched: [{ type: String }],
              keyPointsMissed: [{ type: String }],
              modelSuggestedAnswer: { type: String },
              evaluatedAt: { type: Date }
            },
            { _id: false }
          ),
          default: null
        }
      }
    ],
    tabSwitchesCount: { 
      type: Number, 
      default: 0 
    },
    totalScore: { 
      type: Number, 
      default: 0 
    },
    maxScore: { 
      type: Number, 
      default: 0 
    },
    currentSectionIndex: { 
      type: Number, 
      default: 0 
    },
    sectionStartedAt: { 
      type: Date 
    },
    startedAt: { 
      type: Date, 
      default: Date.now 
    },
    endedAt: { type: Date }
  },
  { timestamps: true }
);

const TestInstance = mongoose.model('TestInstance', testInstanceSchema);
export default TestInstance;
