/**
 * fix_syllabus.js
 * Removes all combined/redundant syllabus topics and keeps only individual ones
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://veerendrakumarnqtcoder:veerendrakumarnqtcoder100@nqtcodercluster.nhf7k4g.mongodb.net/?appName=NQTCoderCluster';

// Combined topics to DELETE (they have individual equivalents already)
const COMBINED_TO_DELETE = [
  'simplification-numbers',  // has: simplification + number-system
  'interest-installment',    // has: simple-interest + compound-interest + installments
  'ages-partnership',        // has: ages + partnership
  'di-set-theory',           // has: data-interpretation + set-theory
  'pnc-probability',         // has: permutations-combinations + probability
  'tsd-boats-streams',       // has: time-speed-distance + boats-streams
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB\n');

  const col = mongoose.connection.db.collection('syllabustopics');

  // Delete each combined topic one by one
  let totalDeleted = 0;
  for (const topic of COMBINED_TO_DELETE) {
    const r = await col.deleteOne({ topic });
    if (r.deletedCount > 0) {
      console.log(`✅ Deleted combined topic: "${topic}"`);
      totalDeleted++;
    } else {
      console.log(`⚠️  Not found: "${topic}" (may already be gone)`);
    }
  }

  console.log(`\n🗑  Total deleted: ${totalDeleted} combined topics`);

  // Print final clean list
  const quant   = await col.find({ domain: 'aptitude', section: 'quant'   }).sort({ displayOrder: 1 }).toArray();
  const logical = await col.find({ domain: 'aptitude', section: 'logical' }).sort({ displayOrder: 1 }).toArray();
  const verbal  = await col.find({ domain: 'aptitude', section: 'verbal'  }).sort({ displayOrder: 1 }).toArray();
  const di      = await col.find({ domain: 'aptitude', section: 'di'      }).sort({ displayOrder: 1 }).toArray();

  console.log(`\n📊 FINAL CLEAN SYLLABUS:\n`);
  console.log(`Quant (${quant.length}):`);
  quant.forEach(t => console.log(`  ${t.displayOrder}. ${t.topic} | ${t.displayName}`));
  console.log(`\nLogical (${logical.length}):`);
  logical.forEach(t => console.log(`  ${t.displayOrder}. ${t.topic} | ${t.displayName}`));
  console.log(`\nVerbal (${verbal.length}):`);
  verbal.forEach(t => console.log(`  ${t.displayOrder}. ${t.topic} | ${t.displayName}`));
  console.log(`\nDI (${di.length}):`);
  di.forEach(t => console.log(`  ${t.displayOrder}. ${t.topic} | ${t.displayName}`));

  await mongoose.disconnect();
  console.log('\n✅ Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
