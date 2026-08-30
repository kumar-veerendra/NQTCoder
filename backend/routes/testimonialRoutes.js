import express from 'express';
import {
  getApprovedTestimonials,
  getMyTestimonial,
  submitOrUpdateTestimonial,
  getAdminTestimonials,
  updateTestimonialStatus,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/', getApprovedTestimonials);

// Authenticated user routes
router.get('/my', protect, getMyTestimonial);
router.post('/', protect, submitOrUpdateTestimonial);

// Admin moderation routes
router.get('/admin', protect, admin, getAdminTestimonials);
router.patch('/admin/:id', protect, admin, updateTestimonialStatus);
router.delete('/admin/:id', protect, admin, deleteTestimonial);

export default router;
