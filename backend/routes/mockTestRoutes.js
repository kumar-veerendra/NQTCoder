import express from 'express';
import {
  startMockTest,
  getCurrentMockTest,
  submitMockTestQuestion,
  recordMockTestViolation,
  getMockTestHistory
} from '../controllers/mockTestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startMockTest);
router.get('/current', protect, getCurrentMockTest);
router.post('/:id/submit', protect, submitMockTestQuestion);
router.post('/:id/violation', protect, recordMockTestViolation);
router.get('/history', protect, getMockTestHistory);

export default router;
