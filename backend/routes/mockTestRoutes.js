import express from 'express';
import {
  startMockTest,
  getCurrentMockTest,
  submitMockTestQuestion,
  recordMockTestViolation,
  getMockTestHistory
} from '../controllers/mockTestController.js';
import {
  getMockBlueprints,
  startMockInstance,
  getMockInstance,
  submitMockItem,
  recordMockViolation,
  finishMockInstance,
  getMockHistory,
  nextSectionMockInstance
} from '../controllers/mockTestControllerV2.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Legacy Hardcoded Mock Test Endpoints
router.post('/start', protect, startMockTest);
router.get('/current', protect, getCurrentMockTest);
router.post('/:id/submit', protect, submitMockTestQuestion);
router.post('/:id/violation', protect, recordMockTestViolation);
router.get('/history', protect, getMockTestHistory);

// V2 Dynamic Blueprint-driven Mock Test Endpoints
router.get('/blueprints', protect, getMockBlueprints);
router.post('/blueprints/:blueprintId/start', protect, startMockInstance);
router.get('/instances/history', protect, getMockHistory);
router.get('/instances/:instanceId', protect, getMockInstance);
router.post('/instances/:instanceId/submit-item', protect, submitMockItem);
router.post('/instances/:instanceId/violation', protect, recordMockViolation);
router.post('/instances/:instanceId/finish', protect, finishMockInstance);
router.post('/instances/:instanceId/next-section', protect, nextSectionMockInstance);

export default router;
