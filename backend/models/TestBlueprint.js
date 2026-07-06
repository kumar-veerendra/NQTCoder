import mongoose from 'mongoose';

const testBlueprintSchema = new mongoose.Schema(
  {
    blueprintId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    }, // e.g. "TCS-NQT-FULL-2026"
    title: { 
      type: String, 
      required: true 
    }, // e.g. "TCS NQT Full Mock Test"
    totalDurationMinutes: { 
      type: Number, 
      required: true 
    },
    totalItems: { 
      type: Number, 
      required: true 
    },
    sections: [
      {
        order: { type: Number, required: true },
        sectionName: { type: String, required: true },
        itemCount: { type: Number, required: true },
        durationMinutes: { type: Number, required: true },
        sourceCategory: { 
          type: mongoose.Schema.Types.Mixed, 
          required: true 
        }, // e.g., "quant", "logical", "programming"
        topicPool: { 
          type: String, 
          enum: ['standard', 'advanced', 'all'], 
          default: 'standard' 
        },
        status: { 
          type: String, 
          enum: ['active', 'coming_soon'], 
          default: 'active' 
        },
        difficultyFilter: { type: String } // easy | medium | hard (optional)
      }
    ]
  },
  { timestamps: true }
);

const TestBlueprint = mongoose.model('TestBlueprint', testBlueprintSchema);
export default TestBlueprint;
