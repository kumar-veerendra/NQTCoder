import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const QuestionSchema = new mongoose.Schema({
  topic: String
});
const Question = mongoose.model('Question', QuestionSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const stats = await Question.aggregate([
    { $group: { _id: '$topic', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('Questions count per topic:');
  console.log(stats);
  
  await mongoose.disconnect();
}

run();
