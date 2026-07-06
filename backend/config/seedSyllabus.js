import SyllabusTopic from '../models/SyllabusTopic.js';

export const seedSyllabus = async () => {
  const topics = [
    // --- Quantitative Aptitude (Numerical Ability) ---
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'simplification',
      displayName: 'Simplification',
      subTopics: ['BODMAS', 'Simplification'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 1
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'number-system',
      displayName: 'Number System',
      subTopics: ['Factors', 'Divisibility', 'Remainders'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 2
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'percentage',
      displayName: 'Percentage',
      subTopics: ['Basic Percentage', 'Successive Percentage', 'Percentage Change'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 3
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'simple-interest',
      displayName: 'Simple Interest',
      subTopics: ['SI Formula', 'Rate & Time'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 4
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'compound-interest',
      displayName: 'Compound Interest',
      subTopics: ['CI Formula', 'Half-yearly & Quarterly'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 5
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'installments',
      displayName: 'Installments',
      subTopics: ['SI Installments', 'CI Installments'],
      expectedQuestions: { min: 0, max: 1 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 6
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'profit-and-loss',
      displayName: 'Profit and Loss',
      subTopics: ['Profit & Loss Basics', 'Markup'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 7
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'discount',
      displayName: 'Discount',
      subTopics: ['Successive Discount', 'Equivalent Discount'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 8
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'time-and-work',
      displayName: 'Time and Work',
      subTopics: ['Efficiency', 'Wages'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 9
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'pipes-and-cisterns',
      displayName: 'Pipes and Cisterns',
      subTopics: ['Inlet Pipe', 'Outlet Pipe', 'Alternate Hours'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 10
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'ratio-proportion',
      displayName: 'Ratio & Proportion',
      subTopics: ['Ratios', 'Proportions', 'Variations'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 11
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'ages',
      displayName: 'Problem on Ages',
      subTopics: ['Ages Ratio', 'Past & Future Ages'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 12
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'partnership',
      displayName: 'Partnership',
      subTopics: ['Simple Partnership', 'Compound Partnership'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 13
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'alligation-mixtures',
      displayName: 'Alligation & Mixtures',
      subTopics: ['Alligation Rules', 'Mixture Replacement'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 14
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'average',
      displayName: 'Average',
      subTopics: ['Simple Average', 'Weighted Average', 'Speed Average'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 15
    },

    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'permutations-combinations',
      displayName: 'Permutations & Combinations',
      subTopics: ['Permutations', 'Combinations'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 18
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'probability',
      displayName: 'Probability',
      subTopics: ['Probability Basics', 'Advanced Probability'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 19
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'time-speed-distance',
      displayName: 'Time Speed Distance',
      subTopics: ['Speed Conversion', 'Average Speed', 'Relative Speed'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 20
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'trains',
      displayName: 'Problems on Trains',
      subTopics: ['Train Formulas', 'Platform crossing'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 21
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'boats-streams',
      displayName: 'Boats and Streams',
      subTopics: ['Upstream Speed', 'Downstream Speed'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 22
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'mensuration',
      displayName: 'Mensuration',
      subTopics: ['Area & Perimeter (2D)', 'Volume & Surface Area (3D)'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 23
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'statistics',
      displayName: 'Statistics',
      subTopics: ['Mean, Median, Mode', 'Standard Deviation', 'Variance'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 24
    },
    {
      domain: 'aptitude',
      section: 'quant',
      topic: 'quadratic-equations',
      displayName: 'Quadratic Equations',
      subTopics: ['Root finding', 'Discriminant nature', 'Sign methods'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 25
    },

    // --- Logical Reasoning Ability ---
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'coding-decoding',
      displayName: 'Coding - Decoding',
      subTopics: ['Coding-Decoding', 'Alphabets Related Coding', 'Chinese Coding'],
      expectedQuestions: { min: 4, max: 5 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 26
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'distance-direction',
      displayName: 'Distance and Direction',
      subTopics: ['Direction Sense', 'Shadow Problems', 'Shortest Distance'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 27
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'blood-relations',
      displayName: 'Blood Relations',
      subTopics: ['Family Tree', 'Coded Relations', 'Pointing to a Photograph'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 28
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'arrangements',
      displayName: 'Arrangements',
      subTopics: ['Linear Arrangements', 'Parallel Arrangements', 'Circular Arrangements', 'Floor Arrangements'],
      expectedQuestions: { min: 5, max: 10 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 29
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'critical-reasoning',
      displayName: 'Critical Reasoning',
      subTopics: ['Statement & Assumptions', 'Course of Action', 'Cause & Effect'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 30
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'syllogisms',
      displayName: 'Syllogisms',
      subTopics: ['Two Statements', 'Three Statements', 'Possibility Cases'],
      expectedQuestions: { min: 2, max: 4 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 31
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'number-series',
      displayName: 'Number Series',
      subTopics: ['Type 1', 'Type 2', 'Type 3', 'Type 4'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 32
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'puzzles',
      displayName: 'Puzzles',
      subTopics: ['Height Comparison', 'Comparison-Based Puzzles', 'Scheduling'],
      expectedQuestions: { min: 2, max: 4 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 33
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'data-sufficiency',
      displayName: 'Data Sufficiency',
      subTopics: ['Logical Data Sufficiency'],
      expectedQuestions: { min: 2, max: 3 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 34
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'non-verbal-reasoning',
      displayName: 'Non-Verbal Reasoning',
      subTopics: ['Water Image', 'Mirror Image', 'Paper Folding', 'Pattern Completion'],
      expectedQuestions: { min: 3, max: 5 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 35
    },
    {
      domain: 'aptitude',
      section: 'logical',
      topic: 'miscellaneous-reasoning',
      displayName: 'Miscellaneous Reasoning',
      subTopics: ['Clocks', 'Calendar', 'Ranking'],
      expectedQuestions: { min: 0, max: 1 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 36
    },
    // --- Verbal Ability ---
    {
      domain: 'aptitude',
      section: 'verbal',
      topic: 'sentence-completion',
      displayName: 'Sentence Completion',
      subTopics: ['Fill in the Blanks', 'Grammar check'],
      expectedQuestions: { min: 4, max: 6 },
      isAdvanced: false,
      examPattern: 'TCS NQT',
      displayOrder: 41
    },
    {
      domain: 'aptitude',
      section: 'verbal',
      topic: 'passage-recall',
      displayName: 'Passage Recall',
      subTopics: ['Short passage comprehension', 'Retention and synthesis'],
      expectedQuestions: { min: 1, max: 2 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 42
    },
    {
      domain: 'aptitude',
      section: 'verbal',
      topic: 'email-writing',
      displayName: 'Email Writing',
      subTopics: ['Formal emails', 'Business communication'],
      expectedQuestions: { min: 1, max: 1 },
      isAdvanced: true,
      examPattern: 'TCS NQT',
      displayOrder: 43
    }
  ];

  console.log('Cleaning up deprecated topics (DI, Set Theory, Verbal)...');
  // Remove Data Interpretation and Set Theory from Atlas
  await SyllabusTopic.deleteMany({
    topic: { $in: ['data-interpretation', 'set-theory'] }
  });

  const allowedVerbalTopics = ['sentence-completion', 'passage-recall', 'email-writing'];
  await SyllabusTopic.deleteMany({
    section: 'verbal',
    topic: { $nin: allowedVerbalTopics }
  });

  console.log('Seeding Syllabus Topics...');
  for (const topicData of topics) {
    await SyllabusTopic.findOneAndUpdate(
      { domain: topicData.domain, section: topicData.section, topic: topicData.topic },
      topicData,
      { upsert: true, new: true }
    );
  }
  console.log('Syllabus Topics successfully seeded!');
};
