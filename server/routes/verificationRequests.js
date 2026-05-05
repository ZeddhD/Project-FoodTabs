import express from 'express';
import {
  createVerificationRequest,
  getVerificationRequest,
  getPendingVerificationRequests,
  getAllVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
  resubmitVerificationRequest
} from '../controllers/verificationRequestController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Restaurant owner routes
router.post('/', authMiddleware, createVerificationRequest);
router.get('/restaurant/:restaurantId', authMiddleware, getVerificationRequest);
router.post('/restaurant/:restaurantId/resubmit', authMiddleware, resubmitVerificationRequest);

// Admin routes
router.get('/admin/pending', authMiddleware, getPendingVerificationRequests);
router.get('/admin/all', authMiddleware, getAllVerificationRequests);
router.patch('/:id/approve', authMiddleware, approveVerificationRequest);
router.patch('/:id/reject', authMiddleware, rejectVerificationRequest);

export default router;
