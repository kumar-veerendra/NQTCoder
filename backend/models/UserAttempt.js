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
    submittedAnswer: [{ type: String, required: true }], // Array of strings supporting multiple correct or numeric input formats
    isCorrect: { 
      type: Boolean, 
      required: true, 
      index: true 
    },
    timeTakenSec: { 
      type: Number, 
      required: true 
    },
    attemptedAt: { 
      type: Date, 
      default: Date.now, 
      required: true 
    },
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
  },
  { timestamps: true }
);

// Compound index to quickly fetch user attempts on a question
userAttemptSchema.index({ userId: 1, questionId: 1 });

const UserAttempt = mongoose.model('UserAttempt', userAttemptSchema);
export default UserAttempt;
