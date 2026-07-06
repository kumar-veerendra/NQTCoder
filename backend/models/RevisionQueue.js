import mongoose from 'mongoose';

const revisionQueueSchema = new mongoose.Schema(
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
    reason: { 
      type: String, 
      enum: ['weak_topic', 'wrong_twice', 'manual_flag'], 
      default: 'weak_topic',
      index: true 
    },
    wrongAttemptsCount: { type: Number, default: 0 },
    lastAttemptedAt: { type: Date }
  },
  { timestamps: true }
);

revisionQueueSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const RevisionQueue = mongoose.model('RevisionQueue', revisionQueueSchema);
export default RevisionQueue;
