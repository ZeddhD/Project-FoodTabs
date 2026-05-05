import express from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  respondToReview
} from '../controllers/reviewController.js';
import { validateReview } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);

// Protected routes — upload.array runs before validateReview so req.body is parsed from FormData
router.post('/', authMiddleware, upload.array('photos', 5), validateReview, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

// Owner respond to review
router.post('/:id/respond', authMiddleware, respondToReview);


export default router;
