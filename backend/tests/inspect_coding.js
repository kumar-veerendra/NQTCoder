import mongoose from 'mongoose';
import Question from '../models/Question.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = 'mongodb+srv://veerendrakumarnqtcoder:veerendrakumarnqtcoder100@nqtcodercluster.nhf7k4g.mongodb.net/?appName=NQTCoderCluster';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const c1 = await Question.countDocuments({ domain: 'coding' });
  const c2 = await Question.countDocuments({});
  console.log('Mongoose coding count:', c1, 'Mongoose total count:', c2);

  const q = await Question.find({ topic: { $in: ['trains', 'number-series'] } })
    .select('domain questionId kind title topic');

  console.log('Questions matching topic trains or number-series:');
  q.forEach(x => {
    console.log(`  id: ${x.questionId}, topic: ${x.topic}, title: ${x.title}, domain: ${x.domain}, kind: ${x.kind}`);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
