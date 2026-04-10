import express from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview
} from '../controllers/reviewController.js';
import { validateReview } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', authMiddleware, validateReview, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

// Like/Unlike
router.post('/:id/like', authMiddleware, likeReview);
router.post('/:id/unlike', authMiddleware, unlikeReview);

export default router;
