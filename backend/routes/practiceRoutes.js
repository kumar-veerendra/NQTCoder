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
  getRevisionQueue,
  getPracticeQuota,
  getQuestionDraft,
  saveQuestionDraft,
  deleteQuestionDraft,
  generateAIQuestion,
  generateCustomScenario,
  getAICoachImprovements,
  getAIDebugLogs,
  getAIHealthStatus,
  getAttemptAIStatus
} from '../controllers/practiceController.js';

const router = express.Router();

// ── Public routes (guests can browse, logged-in users get status) ───────────
router.get('/topics', optionalProtect, getSyllabusTopics);
router.get('/questions', optionalProtect, getPracticeQuestions);
router.get('/questions/:id', optionalProtect, getPracticeQuestionById);
router.get('/health', optionalProtect, getAIHealthStatus);

// ── Protected routes (login required) ───────────────────────────────────────
router.get('/quota', protect, getPracticeQuota);
router.get('/progress', protect, getPracticeProgress);
router.post('/sessions', protect, startPracticeSession);
router.get('/bookmarks', protect, getBookmarks);
router.get('/revision-queue', protect, getRevisionQueue);
router.post('/questions/improve', protect, getAICoachImprovements);
router.post('/questions/:id/improve', protect, getAICoachImprovements);
router.post('/questions/:id/submit', protect, submitPracticeAnswer);
router.post('/questions/:id/bookmark', protect, toggleBookmark);
router.get('/attempts/:attemptId/ai-status', protect, getAttemptAIStatus);

// Draft management routes
router.get('/drafts/:questionId', protect, getQuestionDraft);
router.post('/drafts/:questionId', protect, saveQuestionDraft);
router.delete('/drafts/:questionId', protect, deleteQuestionDraft);

// AI Scenarios generators
router.post('/questions/generate-ai', protect, generateAIQuestion);
router.post('/questions/custom-scenario', protect, generateCustomScenario);

// Admin-only debugging logs
router.get('/debug-logs', protect, getAIDebugLogs);

export default router;
