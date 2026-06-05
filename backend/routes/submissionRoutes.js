import express from 'express';
import {
  runCode,
  submitCode,
  getUserQuestionSubmissions,
  getQueueJobStatus,
  getCompilersStatus,
  getQueueLoad,
  getUserSubmissions
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/run', protect, submissionRateLimiter, runCode);
router.post('/submit', protect, submissionRateLimiter, submitCode);
router.get('/load', getQueueLoad);                        // public — no auth
router.get('/status/:jobId', protect, getQueueJobStatus);
router.get('/compilers', protect, getCompilersStatus);
router.get('/user', protect, getUserSubmissions);
router.get('/question/:questionId', protect, getUserQuestionSubmissions);

export default router;
