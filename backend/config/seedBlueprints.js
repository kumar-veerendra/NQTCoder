import TestBlueprint from '../models/TestBlueprint.js';

const blueprints = [
  {
    blueprintId: 'TCS-NQT-FULL-01',
    title: 'TCS NQT Full Cognitive & Coding Mock',
    totalDurationMinutes: 191,
    totalItems: 81,
    sections: [
      {
        order: 1,
        sectionName: 'Numerical Ability',
        itemCount: 20,
        durationMinutes: 25,
        sourceCategory: 'quant',
        topicPool: 'standard'
      },
      {
        order: 2,
        sectionName: 'Reasoning Ability',
        itemCount: 20,
        durationMinutes: 25,
        sourceCategory: 'logical',
        topicPool: 'standard'
      },
      {
        order: 3,
        sectionName: 'Advanced Quantitative & Reasoning Ability',
        itemCount: 14,
        durationMinutes: 25,
        sourceCategory: 'quant',
        topicPool: 'advanced'
      },
      {
        order: 4,
        sectionName: 'Verbal Ability',
        itemCount: 25,
        durationMinutes: 26,
        sourceCategory: 'logical', // fall back to logical topics if verbal content is light
        topicPool: 'standard'
      },
      {
        order: 5,
        sectionName: 'Advanced Coding Easy',
        itemCount: 1,
        durationMinutes: 35,
        sourceCategory: 'programming',
        topicPool: 'standard'
      },
      {
        order: 6,
        sectionName: 'Advanced Coding Medium',
        itemCount: 1,
        durationMinutes: 55,
        sourceCategory: 'programming',
        topicPool: 'advanced'
      }
    ]
  }
];

export const seedBlueprints = async () => {
  try {
    console.log('Seeding Test Blueprints...');
    
    // Explicitly delete the legacy 45-minute mini mock test blueprint
    await TestBlueprint.deleteOne({ blueprintId: 'TCS-NQT-MINI-01' });

    for (const blueprint of blueprints) {
      await TestBlueprint.findOneAndUpdate(
        { blueprintId: blueprint.blueprintId },
        blueprint,
        { upsert: true, new: true }
      );
    }
    console.log('Test Blueprints successfully seeded!');
  } catch (error) {
    console.error('Error seeding test blueprints:', error.message);
    throw error;
  }
};
