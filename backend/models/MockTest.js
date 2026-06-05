import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  q1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  q2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  
  // Question 1 progress
  q1Status: {
    type: String,
    enum: ['pending', 'started', 'completed'],
    default: 'started'
  },
  q1Code: { type: String, default: '' },
  q1Language: { type: String, default: 'cpp' },
  q1PassedCount: { type: Number, default: 0 },
  q1TotalCount: { type: Number, default: 0 },
  q1Score: { type: Number, default: 0 },
  q1TimeSpent: { type: Number, default: 0 }, // in seconds
  q1StartedAt: { type: Date, default: Date.now },
  
  // Question 2 progress
  q2Status: {
    type: String,
    enum: ['pending', 'started', 'completed'],
    default: 'pending'
  },
  q2Code: { type: String, default: '' },
  q2Language: { type: String, default: 'cpp' },
  q2PassedCount: { type: Number, default: 0 },
  q2TotalCount: { type: Number, default: 0 },
  q2Score: { type: Number, default: 0 },
  q2TimeSpent: { type: Number, default: 0 }, // in seconds
  q2StartedAt: { type: Date },
  
  // Security monitoring & results
  tabSwitchesCount: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 200 },
  
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
