import express from 'express';
import {
  getRecommendations,
  getSimilarUsers,
  getTrendingRestaurants,
  getSmartRecommendations,
  getRecommendedDishes,
  getTasteProfile,
} from '../controllers/recommendationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/smart',        authMiddleware, getSmartRecommendations);
router.get('/trending',     getTrendingRestaurants);
router.get('/similar-users', authMiddleware, getSimilarUsers);
router.get('/dishes',       authMiddleware, getRecommendedDishes);
router.get('/taste-profile', authMiddleware, getTasteProfile);
router.get('/',             authMiddleware, getRecommendations);

export default router;
