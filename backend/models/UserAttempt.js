import mongoose from 'mongoose';

const userAttemptSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    questionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question', 
      required: true, 
      index: true 
    },
    sessionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'QuestionSession', 
      required: true, 
      index: true 
    },
    testInstanceId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'TestInstance', 
      default: null, 
      index: true 
    },
    questionType: {
      type: String,
      enum: ['coding', 'mcq', 'email_writing', 'passage_recall'],
      default: 'email_writing',
      index: true
    },
    visibility: {
      type: String,
      enum: ['official', 'personal'],
      default: 'official'
    },
    submittedAnswer: [{ type: String, required: true }],
    isCorrect: { 
      type: Boolean, 
      required: true, 
      index: true 
    },
    timeTakenSec: { 
      type: Number, 
      required: true 
    },
    evaluationMode: {
      type: String,
      enum: ['RULE_ONLY', 'AI_SHARED', 'AI_BYOK', 'shared_backend', 'byok_client', 'quota_exceeded', 'deterministic_offline'],
      default: 'RULE_ONLY',
      required: true,
      index: true
    },
    evaluationVersion: {
      type: String,
      default: 'rule_v1'
    },
    promptVersion: {
      type: String,
      default: 'email_v3'
    },
    aiModel: {
      type: String,
      default: 'gemini-2.5-flash'
    },
    schemaVersion: {
      type: Number,
      default: 1
    },
    snapshotVersion: {
      type: Number,
      default: 1
    },
    questionSnapshot: {
      emailPrompt: { type: String },
      passageText: { type: String },
      guidelines: [{ type: String }],
      targetKeyFacts: [{ type: mongoose.Schema.Types.Mixed }],
      minWords: { type: Number },
      maxWords: { type: Number }
    },

    // Deterministic Rule-Based Engine Results (Instant <50ms)
    deterministic: {
      ruleScore: { type: Number, default: 0 },
      grammarMechanicsScore: { type: Number, default: 0 },
      guidelinesMatched: [{ type: String }],
      guidelinesMissed: [{ type: String }],
      wordCount: { type: Number, default: 0 },
      minWords: { type: Number },
      maxWords: { type: Number },
      structurePass: { type: Boolean, default: false },
      hasGreeting: { type: Boolean, default: false },
      hasSignoff: { type: Boolean, default: false },
      
      // Passage Recall Facts Breakdown
      recallBreakdown: {
        coveragePercent: { type: Number, default: 0 },
        factsCount: { remembered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        numbersCount: { remembered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        namesCount: { remembered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        locationsCount: { remembered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        sequenceCorrect: { type: Boolean, default: true }
      },
      evaluatedAt: { type: Date, default: Date.now }
    },

    // ✨ AI Deep Coaching Results (Async Background Worker)
    ai: {
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'skipped', 'quota_exceeded'],
        default: 'skipped',
        index: true
      },
      toneScore: { type: Number, default: 0 },
      tcsReadiness: { type: String, enum: ['Low', 'Medium', 'High', 'Pending'], default: 'Pending' },
      feedback: { type: String },
      grammarErrors: [
        {
          originalText: { type: String },
          suggestedFix: { type: String },
          explanation: { type: String }
        }
      ],
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      modelSuggestedAnswer: { type: String },
      evaluatedAt: { type: Date }
    },

    // Legacy verbalEvaluation field for backward compatibility
    verbalEvaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    attemptedAt: { 
      type: Date, 
      default: Date.now, 
      required: true 
    }
  },
  { timestamps: true }
);

userAttemptSchema.index({ userId: 1, questionId: 1 });

const UserAttempt = mongoose.model('UserAttempt', userAttemptSchema);
export default UserAttempt;
