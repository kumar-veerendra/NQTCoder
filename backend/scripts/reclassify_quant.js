/**
 * reclassify_quant.js
 * 
 * Reclassifies misplaced quant questions into correct topics:
 * - QA-MIXT questions that are actually profit-and-loss → topic: profit-and-loss
 * - QA-MIXT questions that are actually simple-interest / alligation using interest rates → topic: simple-interest
 * - Keeps genuine mixture / alligation questions under alligation-mixtures
 * - Removes duplicate simplification entries beyond a reasonable cap (keep 20 best)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://veerendrakumarnqtcoder:veerendrakumarnqtcoder100@nqtcodercluster.nhf7k4g.mongodb.net/?appName=NQTCoderCluster';

// Map: questionId -> corrected topic
const RECLASSIFY = {
  // Profit & Loss disguised as alligation
  'QA-MIXT-0009': 'profit-and-loss',  // rice 10% and 20% profit → overall 12%
  'QA-MIXT-0017': 'profit-and-loss',  // trolley profit 30, loss 10, overall 3%
  'QA-MIXT-0018': 'profit-and-loss',  // rice 840kg at 9% and 16% profit
  'QA-MIXT-0019': 'profit-and-loss',  // tea 4000kg at 8% and 18% profit
  'QA-MIXT-0020': 'profit-and-loss',  // rice 20% profit and 5% loss
  'QA-MIXT-0021': 'profit-and-loss',  // two articles profit 12% loss 12%
  'QA-MIXT-0022': 'profit-and-loss',  // two cows profit 22 loss 8
  'QA-MIXT-0023': 'profit-and-loss',  // milkman 20% profit mixed milk
  'QA-MIXT-0024': 'profit-and-loss',  // tea profit 10%
  'QA-MIXT-0025': 'profit-and-loss',  // rice gain 18%
  'QA-MIXT-0026': 'profit-and-loss',  // salt profit 25%
  'QA-MIXT-0027': 'profit-and-loss',  // sugar gain 10%
  'QA-MIXT-0028': 'profit-and-loss',  // rice 20% profit 5% loss ratio

  // Simple Interest / Investment disguised as alligation
  'QA-MIXT-0029': 'simple-interest',  // 5000 invested at 4% and 5%
  'QA-MIXT-0030': 'simple-interest',  // 18000 lent at 3% and 12%
  'QA-MIXT-0031': 'simple-interest',  // 12000 at 10% and 20%

  // Average disguised as alligation
  'QA-MIXT-0008': 'average',          // class average weight girls/boys
  'QA-MIXT-0010': 'average',          // average pass percentage girls/boys
};

// Simplification: keep only the first 20 (best ones by order)
const SIMPL_KEEP_MAX = 20;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('questions');

  // Step 1: Reclassify questions
  let reclassified = 0;
  for (const [qid, newTopic] of Object.entries(RECLASSIFY)) {
    const result = await col.updateOne(
      { questionId: qid },
      { $set: { topic: newTopic } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Reclassified ${qid} → ${newTopic}`);
      reclassified++;
    } else {
      console.log(`⚠️  Not found or unchanged: ${qid}`);
    }
  }
  console.log(`\nReclassified ${reclassified} questions.`);

  // Step 2: Remove excess simplification questions (keep first SIMPL_KEEP_MAX by questionId sort)
  const simplQuestions = await col
    .find({ topic: 'simplification', domain: 'aptitude' })
    .sort({ questionId: 1 })
    .toArray();

  console.log(`\nSimplification questions found: ${simplQuestions.length}`);

  if (simplQuestions.length > SIMPL_KEEP_MAX) {
    const toDelete = simplQuestions.slice(SIMPL_KEEP_MAX).map(q => q._id);
    const delResult = await col.deleteMany({ _id: { $in: toDelete } });
    console.log(`🗑  Removed ${delResult.deletedCount} excess simplification questions (keeping ${SIMPL_KEEP_MAX}).`);
  }

  // Step 3: Print final topic distribution
  const all = await col.find({ domain: 'aptitude', section: 'quant' }).toArray();
  const dist = {};
  all.forEach(q => { dist[q.topic] = (dist[q.topic] || 0) + 1; });
  console.log('\n📊 Final topic distribution:');
  Object.entries(dist).sort().forEach(([t, c]) => console.log(`  ${t}: ${c}`));
  console.log(`\nTotal quant questions: ${all.length}`);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
