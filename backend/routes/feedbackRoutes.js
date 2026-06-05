import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', protect, admin, getAllFeedback);
router.patch('/:id', protect, admin, updateFeedbackStatus);
router.delete('/:id', protect, admin, deleteFeedback);

export default router;
