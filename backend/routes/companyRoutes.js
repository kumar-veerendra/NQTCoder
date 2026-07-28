import express from 'express';
import { getCompanies } from '../controllers/companyGuideController.js';

const router = express.Router();
router.get('/', getCompanies);
export default router;
