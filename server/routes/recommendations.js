import express from 'express';
import {
  getRecommendations,
  getSimilarUsers,
  getTrendingRestaurants,
  getSmartRecommendations
} from '../controllers/recommendationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/smart', authMiddleware, getSmartRecommendations);
router.get('/trending', getTrendingRestaurants);
router.get('/similar-users', authMiddleware, getSimilarUsers);
router.get('/', authMiddleware, getRecommendations);

export default router;
