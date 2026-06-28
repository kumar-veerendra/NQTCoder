import express from 'express';
import {
  getQuestions,
  getQuestionsCount,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminStats
} from '../controllers/questionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getQuestions)
  .post(protect, admin, createQuestion);

router.get('/count', getQuestionsCount);

router.get('/admin/stats', protect, admin, getAdminStats);

router.route('/:id')
  .get(getQuestionById)
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

export default router;
