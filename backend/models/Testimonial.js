import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    wouldRecommend: {
      type: String,
      enum: ['yes', 'maybe', 'no'],
      default: 'yes',
    },
    usageAreas: [
      {
        type: String,
        enum: [
          'coding',
          'aptitude',
          'logical_reasoning',
          'verbal',
          'mock_tests',
          'cognitive_games',
          'company_guides',
          'other',
        ],
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'pending',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin note cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Lifecycle-Aware Partial Unique Index:
// Guarantees only one ACTIVE (pending or approved) review per user.
// Users whose previous review was rejected or hidden can submit a new review.
testimonialSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } },
  }
);

// Compound index for public sorting: rating DESC, createdAt DESC
testimonialSchema.index({ status: 1, rating: -1, createdAt: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
