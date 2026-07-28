import express from 'express';
import { getGuides, getFeaturedGuides, getGuideSlugs, getGuideBySlug } from '../controllers/companyGuideController.js';

const router = express.Router();

// IMPORTANT: specific named routes before /:slug
router.get('/featured', getFeaturedGuides);
router.get('/sitemap', getGuideSlugs);
router.get('/', getGuides);
router.get('/:slug', getGuideBySlug);

export default router;
