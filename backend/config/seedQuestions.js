import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedQuestions = async () => {
  try {
    // 1. Check if questions already exist to preserve ObjectIDs
    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`Seed: Question collection already seeded with ${count} questions. Skipping seeding to prevent ObjectID regeneration.`);
      return;
    }

    // 2. Read the new questions JSON file
    const jsonPath = path.join(__dirname, 'data.Question.json');
    console.log(`Reading new questions from ${jsonPath}...`);
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const questions = JSON.parse(fileContent);

    // 3. Insert questions into database
    console.log(`Inserting ${questions.length} questions into the database...`);
    
    // We use ordered: true to ensure they are inserted in original sequence and validate properly.
    await Question.insertMany(questions, { ordered: true });
    
    console.log(`Database seeding completed successfully! Inserted ${questions.length} questions.`);
  } catch (error) {
    console.error('Question seeding failed:', error.message);
    throw error;
  }
};
