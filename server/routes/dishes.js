import express from 'express';
import {
  getDishes,
  getDishById,
  getDishReviews,
  searchDishes,
  createDish,
  updateDish,
  deleteDish
} from '../controllers/dishController.js';
import { validateDish } from '../utils/validators.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Standalone search — must be before /:id
router.get('/search', searchDishes);

// Public routes
router.get('/', getDishes);
router.get('/:id', getDishById);
router.get('/:id/reviews', getDishReviews);

// Protected routes
router.post('/', authMiddleware, roleMiddleware('owner', 'admin'), validateDish, createDish);
router.put('/:id', authMiddleware, roleMiddleware('owner', 'admin'), updateDish);
router.delete('/:id', authMiddleware, roleMiddleware('owner', 'admin'), deleteDish);

export default router;
