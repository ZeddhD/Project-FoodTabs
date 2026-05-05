import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getOwnerRestaurants,
  getRestaurantAnalytics,
  getAllReviewsForRestaurant
} from '../controllers/restaurantController.js';
import { validateRestaurant } from '../utils/validators.js';
import { authMiddleware, optionalAuthMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/:id', optionalAuthMiddleware, getRestaurantById);

// Protected routes - Owner
router.post('/', authMiddleware, roleMiddleware('owner', 'admin'), validateRestaurant, createRestaurant);
router.put('/:id', authMiddleware, roleMiddleware('owner', 'admin'), updateRestaurant);
router.delete('/:id', authMiddleware, roleMiddleware('owner', 'admin'), deleteRestaurant);
router.get('/owner/my-restaurants', authMiddleware, roleMiddleware('owner', 'admin'), getOwnerRestaurants);
router.get('/:restaurantId/analytics', authMiddleware, getRestaurantAnalytics);
router.get('/:restaurantId/all-reviews', authMiddleware, roleMiddleware('owner', 'admin'), getAllReviewsForRestaurant);

export default router;
