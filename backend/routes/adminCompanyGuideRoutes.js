import express from 'express';
import {
  adminGetCompanies, adminCreateCompany, adminUpdateCompany,
  adminGetGuides, adminGetGuideById, adminCreateGuide, adminUpdateGuide,
  adminPublishGuide, adminUnpublishGuide, adminArchiveGuide, adminVerifyGuide, adminDeleteGuide,
} from '../controllers/adminCompanyGuideController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, admin);

router.route('/companies').get(adminGetCompanies).post(adminCreateCompany);
router.route('/companies/:id').patch(adminUpdateCompany);

router.route('/guides').get(adminGetGuides).post(adminCreateGuide);
router.route('/guides/:id').get(adminGetGuideById).patch(adminUpdateGuide).delete(adminDeleteGuide);
router.patch('/guides/:id/publish', adminPublishGuide);
router.patch('/guides/:id/unpublish', adminUnpublishGuide);
router.patch('/guides/:id/archive', adminArchiveGuide);
router.patch('/guides/:id/verify', adminVerifyGuide);

export default router;
