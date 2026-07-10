import express from 'express';
import {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  updateTrackLastAccessed,
  resetTrackProgress
} from '../controllers/trackController.js';
import { protect, admin, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getTracks)
  .post(protect, admin, createTrack);

router.route('/:id')
  .get(optionalProtect, getTrackById)
  .put(protect, admin, updateTrack)
  .delete(protect, admin, deleteTrack);

router.route('/:id/access')
  .post(protect, updateTrackLastAccessed);

router.route('/:id/reset')
  .post(protect, resetTrackProgress);

export default router;
