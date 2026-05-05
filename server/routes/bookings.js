import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  getRestaurantBookings,
  createPaymentIntent,
  confirmPayment,
  getPayment,
  demoPayment
} from '../controllers/bookingController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Owner: restaurant bookings — must be before /:id to avoid param conflict
router.get('/restaurant/:restaurantId', authMiddleware, roleMiddleware('owner', 'admin'), getRestaurantBookings);

// Bookings
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id', authMiddleware, updateBooking);
router.patch('/:id/status', authMiddleware, roleMiddleware('owner', 'admin'), updateBookingStatus);
router.post('/:id/cancel', authMiddleware, cancelBooking);

// Payments
router.post('/payment/demo', authMiddleware, demoPayment);
router.post('/payment/create-intent', authMiddleware, createPaymentIntent);
router.post('/payment/confirm', authMiddleware, confirmPayment);
router.get('/payment/:id', authMiddleware, getPayment);

export default router;
