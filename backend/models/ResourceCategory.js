import mongoose from 'mongoose';

const resourceCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'BookOpen'
  },
  driveFolderLink: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const ResourceCategory = mongoose.model('ResourceCategory', resourceCategorySchema);
export default ResourceCategory;
