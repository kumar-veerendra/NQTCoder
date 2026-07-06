import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
