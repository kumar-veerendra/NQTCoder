import mongoose from 'mongoose';

// ── negativeMarking sub-schema ───────────────────────────────────────────────
const negativeMarkingSchema = new mongoose.Schema(
  {
    applicable: { type: Boolean, default: null }, // null=unknown, false=no NM, true=has NM
    value: { type: Number, min: 0 },              // omitted if inapplicable
    description: { type: String, default: '' },
  },
  { _id: false }
);

// ── examSection sub-schema ───────────────────────────────────────────────────
const examSectionSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, trim: true },
    questions: { type: Number, min: 0 },          // omitted = not officially specified
    durationMinutes: { type: Number, min: 0 },    // omitted = not officially specified
    marks: { type: Number, min: 0 },              // omitted = not officially specified
    negativeMarking: negativeMarkingSchema,
    description: { type: String, default: '' },
    order: { type: Number, default: 1 },
  },
  { _id: true }
);

// ── role sub-schema ──────────────────────────────────────────────────────────
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    salary: {
      min: { type: Number, min: 0 },   // omitted = not disclosed
      max: { type: Number, min: 0 },   // omitted = not disclosed
      currency: { type: String, default: 'INR' },
      unit: { type: String, enum: ['LPA', 'monthly', 'annual'], default: 'LPA' },
    },
    description: { type: String, default: '' },
  },
  { _id: true }
);

// ── eligibility sub-schema ───────────────────────────────────────────────────
const eligibilitySchema = new mongoose.Schema(
  {
    minimumPercentage: { type: String, default: '' },
    allowedBacklogs: { type: String, default: '' },
    eligibleDegrees: [{ type: String, trim: true }],
    eligibleBranches: [{ type: String, trim: true }],
    graduationYears: [{ type: Number }],
    gapCriteria: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
  },
  { _id: false }
);

// ── recruitmentStage sub-schema ──────────────────────────────────────────────
const recruitmentStageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 1 },
    description: { type: String, default: '' },
  },
  { _id: true }
);

// ── faq sub-schema ───────────────────────────────────────────────────────────
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

// ── resource sub-schema ──────────────────────────────────────────────────────
const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['pdf', 'link'], default: 'pdf' },
    url: { type: String, required: true, trim: true },
    sourceName: { type: String, default: '' },
  },
  { _id: true }
);

// ── source sub-schema ────────────────────────────────────────────────────────
const sourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    publisher: { type: String, default: '' },
    sourceType: {
      type: String,
      enum: ['official', 'placement_cell', 'candidate_report', 'other'],
      default: 'other',
    },
    accessedAt: { type: Date },
  },
  { _id: true }
);

// ── seo sub-schema ───────────────────────────────────────────────────────────
const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    keywords: [{ type: String, trim: true }],
    ogTitle: { type: String, trim: true, default: '' },
    ogDescription: { type: String, trim: true, default: '' },
    ogImage: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

// ── main CompanyGuide schema ─────────────────────────────────────────────────
const companyGuideSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────────────────────
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    guideType: {
      type: String,
      enum: ['placement_exam', 'hiring_process', 'coding_competition', 'general'],
      default: 'placement_exam',
    },
    title: {
      type: String,
      required: [true, 'Guide title is required'],
      trim: true,
      maxlength: [200, 'Title max 200 chars'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Preserves old slugs when renamed — enables 301 redirects in Release 2
    previousSlugs: [{ type: String, lowercase: true, trim: true }],
    examName: { type: String, trim: true, default: '' },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Short description max 400 chars'],
    },
    coverImage: { type: String, default: '' },

    // ── Structured Facts ────────────────────────────────────────────────────
    roles: [roleSchema],
    eligibility: eligibilitySchema,
    recruitmentStages: [recruitmentStageSchema],
    examPattern: [examSectionSchema],
    faqs: [faqSchema],          // Structured — NOT inside TipTap content
    resources: [resourceSchema],
    sources: [sourceSchema],
    seo: seoSchema,

    // ── One Rich Editorial Document (TipTap → sanitized HTML) ──────────────
    content: { type: String, default: '' },

    // ── Trust & Credibility ─────────────────────────────────────────────────
    // Shown to public: "Exam patterns may vary by drive, role and campus."
    dataNotice: { type: String, default: '' },

    // ── Lifecycle ───────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },

    // NO default on lastVerifiedAt — creating ≠ verifying
    lastVerifiedAt: { type: Date },
    publishedAt: { type: Date },   // set on FIRST publish only; never reset on update
    archivedAt: { type: Date },    // set when archived

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Schema migration aid
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Compound indexes
companyGuideSchema.index({ status: 1, featured: 1, updatedAt: -1 }); // homepage featured
companyGuideSchema.index({ company: 1, status: 1 });                  // company listing

const CompanyGuide = mongoose.model('CompanyGuide', companyGuideSchema);
export default CompanyGuide;
