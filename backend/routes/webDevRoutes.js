import express from 'express';
import {
  getPublicQuestions,
  getPublicQuestionByIdOrSlug,
  submitWebDevSolution,
  getUserSubmissions,
  getAdminQuestions,
  getAdminQuestionById,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} from '../controllers/webDevController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (with optional user context for progress tracking)
router.get('/questions', optionalProtect, getPublicQuestions);
router.get('/questions/:idOrSlug', optionalProtect, getPublicQuestionByIdOrSlug);

// Authenticated student routes
router.post('/questions/:id/submit', protect, submitWebDevSolution);
router.get('/questions/:id/submissions', protect, getUserSubmissions);

// Admin routes
router.get('/admin/questions', protect, admin, getAdminQuestions);
router.get('/admin/questions/:id', protect, admin, getAdminQuestionById);
router.post('/admin/questions', protect, admin, createAdminQuestion);
router.patch('/admin/questions/:id', protect, admin, updateAdminQuestion);
router.delete('/admin/questions/:id', protect, admin, deleteAdminQuestion);

export default router;
