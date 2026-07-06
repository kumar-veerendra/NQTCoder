import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Question from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const quantPath = path.resolve(__dirname, '../config/data/quantQue.json');
const logicalPath = path.resolve(__dirname, '../config/data/logicalQue.json');

let localCache = null;

// Helper to load all MCQ questions from local JSON files
const getLocalMCQs = () => {
  if (localCache) return localCache;

  let list = [];
  try {
    if (fs.existsSync(quantPath)) {
      list = list.concat(JSON.parse(fs.readFileSync(quantPath, 'utf8')));
    }
  } catch (e) {
    console.error('Error reading quantQue.json:', e);
  }
  try {
    if (fs.existsSync(logicalPath)) {
      list = list.concat(JSON.parse(fs.readFileSync(logicalPath, 'utf8')));
    }
  } catch (e) {
    console.error('Error reading logicalQue.json:', e);
  }

  localCache = list.map((q, idx) => {
    let hex = q._id;
    if (!hex) {
      const inputStr = q.questionId || ('mcq' + idx);
      // Generate a valid 24-char hex string using MD5
      hex = crypto.createHash('md5').update(inputStr).digest('hex').slice(0, 24);
    }
    return {
      ...q,
      _id: hex,
      kind: 'MCQQuestion',
      domain: 'aptitude'
    };
  });

  return localCache;
};

// Combine local JSON MCQs and MongoDB MCQQuestions
export const getMCQQuestions = async () => {
  const localList = getLocalMCQs();

  let dbMcqs = [];
  try {
    dbMcqs = await Question.find({ domain: 'aptitude' }).lean();
  } catch (e) {
    console.error('Error querying MongoDB MCQs:', e);
  }

  const combined = [...localList];
  const localIds = new Set(localList.map(q => q._id.toString()));

  dbMcqs.forEach(q => {
    const idStr = q._id.toString();
    if (!localIds.has(idStr)) {
      combined.push({
        ...q,
        _id: idStr,
        kind: q.kind || 'MCQQuestion',
        domain: 'aptitude'
      });
    }
  });

  return combined;
};

// Find any question (coding from DB, MCQ from local files / DB)
export const findQuestionByIdOrSlug = async (idOrSlug) => {
  // First, check local/db MCQ questions
  const mcqs = await getMCQQuestions();
  const foundLocal = mcqs.find(q => q._id === idOrSlug || q.slug === idOrSlug || q.questionId === idOrSlug);
  if (foundLocal) {
    // Return object mock matching Mongoose structure (toObject/lean compatibility)
    return {
      ...foundLocal,
      toObject: () => ({ ...foundLocal }),
      _id: foundLocal._id
    };
  }

  // Fallback to MongoDB for CodingQuestion
  let dbQuestion = await Question.findOne({ slug: idOrSlug });
  if (!dbQuestion && /^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    dbQuestion = await Question.findById(idOrSlug);
  }
  return dbQuestion;
};

// Filter MCQ questions
export const getMCQByFilter = async (filter = {}) => {
  const list = await getMCQQuestions();
  return list.filter(q => {
    if (filter.section && q.section !== filter.section) return false;
    if (filter.topic && q.topic !== filter.topic) return false;
    
    if (filter.difficulty) {
      const diff1 = q.difficulty.toLowerCase();
      const diff2 = filter.difficulty.toLowerCase();
      if (diff1 !== diff2) return false;
    }
    
    if (filter.search) {
      const s = filter.search.toLowerCase();
      const matchStatement = q.content?.statement?.toLowerCase().includes(s);
      if (!matchStatement) return false;
    }
    
    return true;
  });
};
