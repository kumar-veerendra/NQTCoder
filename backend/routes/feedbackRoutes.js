import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalProtect, createFeedback);
router.get('/', protect, admin, getAllFeedback);
router.patch('/:id', protect, admin, updateFeedbackStatus);
router.delete('/:id', protect, admin, deleteFeedback);

export default router;
