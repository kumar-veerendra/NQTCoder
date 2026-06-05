import mongoose from 'mongoose';

const trackProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  generatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  lastAccessedQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }
}, { timestamps: true });

// Ensure unique combination per user and track
trackProgressSchema.index({ user: 1, track: 1 }, { unique: true });

const TrackProgress = mongoose.model('TrackProgress', trackProgressSchema);
export default TrackProgress;
