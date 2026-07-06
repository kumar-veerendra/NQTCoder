/**
 * merge_unique.js
 * Finds all questions in quantQue.json.fixed.json that are NOT in quantQue.json
 * (by questionId or slug) and merges them into quantQue.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../config/data');

const mainFile  = path.join(dataDir, 'quantQue.json');
const fixedFile = path.join(dataDir, 'quantQue.json.fixed.json');

// Parse both files
let mainQuestions  = [];
let fixedQuestions = [];

try {
  mainQuestions = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
  console.log(`✅ quantQue.json loaded: ${mainQuestions.length} questions`);
} catch (e) {
  console.error('❌ Error reading quantQue.json:', e.message);
  process.exit(1);
}

try {
  fixedQuestions = JSON.parse(fs.readFileSync(fixedFile, 'utf8'));
  console.log(`✅ quantQue.json.fixed.json loaded: ${fixedQuestions.length} questions`);
} catch (e) {
  console.error('❌ Error reading quantQue.json.fixed.json:', e.message);
  process.exit(1);
}

// Build a Set of existing IDs and slugs from main file
const existingIds  = new Set(mainQuestions.map(q => q.questionId).filter(Boolean));
const existingSlugs = new Set(mainQuestions.map(q => q.slug).filter(Boolean));

// Find unique questions in fixed that are NOT in main
const uniqueToFixed = fixedQuestions.filter(q => {
  const idNew   = q.questionId && !existingIds.has(q.questionId);
  const slugNew = q.slug && !existingSlugs.has(q.slug);
  // A question is unique if BOTH its ID and slug are new
  return idNew && slugNew;
});

console.log(`\n📊 Questions only in fixed.json (unique): ${uniqueToFixed.length}`);
uniqueToFixed.forEach(q => console.log(`  + ${q.questionId} | ${q.slug}`));

if (uniqueToFixed.length === 0) {
  console.log('\n✅ No new unique questions to add. Files are in sync.');
  process.exit(0);
}

// Merge
const merged = [...mainQuestions, ...uniqueToFixed];
fs.writeFileSync(mainFile, JSON.stringify(merged, null, 2), 'utf8');

// Topic distribution of merged
const dist = {};
merged.forEach(q => { dist[q.topic] = (dist[q.topic] || 0) + 1; });
console.log('\n📊 Final topic distribution in quantQue.json:');
Object.entries(dist).sort().forEach(([t, c]) => console.log(`  ${t}: ${c}`));
console.log(`\nTotal: ${merged.length} questions`);
console.log('\n✅ Merge complete!');
