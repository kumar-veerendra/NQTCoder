import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    website: { type: String, trim: true, default: '' },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Short description max 300 chars'],
    },
    // Bridge to legacy Question/Track company string filters
    // e.g. ["TCS", "tcs"] — used by practice integration via legacyKeys[0]
    legacyKeys: [{ type: String, trim: true }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', shortDescription: 'text' });

const Company = mongoose.model('Company', companySchema);
export default Company;
