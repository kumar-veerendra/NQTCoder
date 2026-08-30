import express from 'express';
import {
  getGames,
  getGameBySlug,
  submitLevelAttempt,
  getUserAllGamesStats,
} from '../controllers/gameController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / with optional user token for progress
router.get('/', optionalProtect, getGames);
router.get('/user/stats', protect, getUserAllGamesStats);
router.get('/:slug', optionalProtect, getGameBySlug);
router.post('/:slug/levels/:levelNumber/complete', optionalProtect, submitLevelAttempt);

export default router;
