import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Question from '../models/Question.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const domainCounts = await Question.aggregate([
    { $group: { _id: { domain: '$domain', kind: '$kind' }, count: { $sum: 1 } } },
    { $sort: { '_id.domain': 1, '_id.kind': 1 } }
  ]);

  console.log('\n=== Domain + Kind Breakdown in Atlas ===');
  domainCounts.forEach(d => {
    console.log(`  domain: ${d._id.domain || 'NULL/MISSING'} | kind: ${d._id.kind || 'NULL/MISSING'} | count: ${d.count}`);
  });

  // Specifically check: MCQQuestion docs that have domain = 'coding' (wrong!)
  const wrongMCQ = await Question.countDocuments({ kind: 'MCQQuestion', domain: 'coding' });
  console.log(`\n⚠️  MCQQuestion docs with domain='coding' (should be 0): ${wrongMCQ}`);

  // CodingQuestion docs with domain != 'coding' (wrong!)
  const wrongCoding = await Question.countDocuments({ kind: 'CodingQuestion', domain: { $ne: 'coding' } });
  console.log(`⚠️  CodingQuestion docs with domain!='coding' (should be 0): ${wrongCoding}`);

  await mongoose.disconnect();
};

run().catch(console.error);
