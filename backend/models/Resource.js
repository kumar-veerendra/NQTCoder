import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceCategory',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['pdf', 'image', 'markdown', 'folder', 'sheet', 'cheatsheet'],
    required: true
  },
  previewLink: {
    type: String,
    required: true,
    trim: true
  },
  downloadLink: {
    type: String,
    trim: true
  },
  driveFolderLink: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  company: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Enable text search indexing for fast title searching
resourceSchema.index({ title: 'text', description: 'text', company: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
