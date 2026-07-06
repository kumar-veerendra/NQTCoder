import mongoose from 'mongoose';

const syllabusTopicSchema = new mongoose.Schema(
  {
    domain: { 
      type: String, 
      required: true, 
      enum: ['coding', 'aptitude'], 
      default: 'aptitude', 
      index: true 
    },
    section: { 
      type: String, 
      required: true, 
      enum: ['quant', 'logical', 'verbal', 'di', 'programming'], 
      default: 'quant', 
      index: true 
    },
    topic: { 
      type: String, 
      required: true, 
      index: true 
    }, // normalized key e.g. "time-and-work"
    displayName: { 
      type: String, 
      required: true 
    }, // UI label e.g. "Time and Work"
    subTopics: [{ type: String }],
    expectedQuestions: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    isAdvanced: { 
      type: Boolean, 
      default: false 
    },
    examPattern: { 
      type: String, 
      required: true, 
      index: true 
    }, // e.g. "TCS NQT"
    displayOrder: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

// Compound index for fast topic fetching
syllabusTopicSchema.index({ domain: 1, section: 1, topic: 1 }, { unique: true });

const SyllabusTopic = mongoose.model('SyllabusTopic', syllabusTopicSchema);
export default SyllabusTopic;
