import mongoose from 'mongoose';

const topicProgressSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    section: { 
      type: String, 
      required: true, 
      index: true 
    }, // quant | logical | verbal | programming
    topic: { 
      type: String, 
      required: true, 
      index: true 
    }, // e.g. "percentage"
    totalQuestions: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // accuracy rate in percentage (e.g. 85.5)
    averageTime: { type: Number, default: 0 }, // average time taken in seconds
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// Prevent duplicate entries per user per section/topic
topicProgressSchema.index({ userId: 1, section: 1, topic: 1 }, { unique: true });

const TopicProgress = mongoose.model('TopicProgress', topicProgressSchema);
export default TopicProgress;
