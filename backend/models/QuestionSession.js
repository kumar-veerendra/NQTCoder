import mongoose from 'mongoose';

const questionSessionSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    mode: { 
      type: String, 
      enum: ['practice', 'mock_test'], 
      required: true, 
      index: true 
    },
    section: { 
      type: String, 
      enum: ['quant', 'logical', 'verbal', 'programming'], 
      required: true, 
      index: true 
    },
    topic: { type: String, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      required: true,
      index: true
    },
    startedAt: { 
      type: Date, 
      default: Date.now, 
      required: true 
    },
    endedAt: { type: Date }
  },
  { timestamps: true }
);

const QuestionSession = mongoose.model('QuestionSession', questionSessionSchema);
export default QuestionSession;
