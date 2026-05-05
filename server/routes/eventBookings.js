import express from 'express';
import {
  createEventBooking,
  getEventBookings,
  getEventBookingById,
  getRestaurantEventBookings,
  updateEventBooking,
  updateEventBookingStatus,
  cancelEventBooking
} from '../controllers/eventBookingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Restaurant owner — must be before /:id routes
router.get('/restaurant/:restaurantId', authMiddleware, getRestaurantEventBookings);

// User event bookings
router.post('/', authMiddleware, createEventBooking);
router.get('/', authMiddleware, getEventBookings);
router.get('/:id', authMiddleware, getEventBookingById);
router.put('/:id', authMiddleware, updateEventBooking);
router.post('/:id/cancel', authMiddleware, cancelEventBooking);
router.patch('/:id/status', authMiddleware, updateEventBookingStatus);

export default router;
