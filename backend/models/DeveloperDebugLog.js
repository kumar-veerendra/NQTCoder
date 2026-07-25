import mongoose from 'mongoose';

const developerDebugLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  provider: { type: String, required: true },
  model: { type: String, required: true },
  latencyMs: { type: Number },
  retryCount: { type: Number, default: 0 },
  promptVersion: { type: String },
  validationSuccess: { type: Boolean, default: true },
  errorReason: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 86400 // Expire in 24 hours (86400 seconds)
  }
});

const DeveloperDebugLog = mongoose.model('DeveloperDebugLog', developerDebugLogSchema);
export default DeveloperDebugLog;
