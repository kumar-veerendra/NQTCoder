import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getResources,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Categories routes (GET is public so Home page can fetch without auth)
router.route('/categories')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route('/categories/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// Resources routes
router.route('/')
  .get(getResources)
  .post(protect, admin, createResource);

router.route('/:id')
  .put(protect, admin, updateResource)
  .delete(protect, admin, deleteResource);

export default router;
