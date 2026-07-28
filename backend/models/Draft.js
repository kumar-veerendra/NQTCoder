import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
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
  mode: {
    type: String,
    enum: ['practice', 'mock'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  timeRemainingSec: {
    type: Number
  },
  version: {
    type: Number,
    default: 1
  },
  deviceId: {
    type: String
  },
  lastSavedAt: {
    type: Date,
    default: Date.now
  }
});

// Index to find draft for a user/question combination quickly
draftSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Draft = mongoose.model('Draft', draftSchema);
export default Draft;
