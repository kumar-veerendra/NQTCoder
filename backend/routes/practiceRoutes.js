import express from 'express';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import {
  getSyllabusTopics,
  getPracticeQuestions,
  getPracticeQuestionById,
  startPracticeSession,
  submitPracticeAnswer,
  getPracticeProgress,
  toggleBookmark,
  getBookmarks,
  getRevisionQueue
} from '../controllers/practiceController.js';

const router = express.Router();

// ── Public routes (guests can browse, logged-in users get status) ───────────
router.get('/topics', optionalProtect, getSyllabusTopics);
router.get('/questions', optionalProtect, getPracticeQuestions);
router.get('/questions/:id', optionalProtect, getPracticeQuestionById);

// ── Protected routes (login required) ───────────────────────────────────────
router.get('/progress', protect, getPracticeProgress);
router.post('/sessions', protect, startPracticeSession);
router.get('/bookmarks', protect, getBookmarks);
router.get('/revision-queue', protect, getRevisionQueue);
router.post('/questions/:id/submit', protect, submitPracticeAnswer);
router.post('/questions/:id/bookmark', protect, toggleBookmark);

export default router;
