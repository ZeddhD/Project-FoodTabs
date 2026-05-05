import Booking from '../models/Booking.js';
import EventBooking from '../models/EventBooking.js';
import Payment from '../models/Payment.js';
import Restaurant from '../models/Restaurant.js';
import * as stripeService from '../services/stripeService.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { createNotification } from '../utils/notify.js';

// ─── Table Booking ────────────────────────────────────────────────────────────

export const createBooking = async (req, res, next) => {
  try {
    const { restaurantId, bookingDate, time, partySize, tablePreference, specialRequests, guestName, guestEmail, guestPhone } = req.body;

    if (!restaurantId || !bookingDate || !time || !partySize) {
      return sendError(res, 400, 'Required fields missing');
    }

    const booking = await Booking.create({
      userId: req.user.userId,
      restaurantId, bookingDate, time, partySize, tablePreference, specialRequests,
      guestName, guestEmail, guestPhone,
      status: 'pending'
    });

    // Notify restaurant owner of new booking
    const rest = await Restaurant.findById(restaurantId).populate('ownerId', '_id name');
    if (rest?.ownerId?._id) {
      const dateStr = new Date(bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      await createNotification(rest.ownerId._id, {
        type: 'new_booking',
        title: 'New table reservation',
        content: `Party of ${partySize} on ${dateStr} at ${time}`,
        link: `/owner/bookings`,
        relatedId: booking._id.toString(),
      });
    }

    sendResponse(res, 201, true, 'Booking created', booking);
  } catch (error) { next(error); }
};

export const getBookings = async (req, res, next) => {
  try {
    const { skip, limitNum } = getPaginationParams(req.query.page, req.query.limit);

    const total    = await Booking.countDocuments({ userId: req.user.userId });
    const bookings = await Booking.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name address phone bookingDeposit')
      .populate('paymentId');

    sendResponse(res, 200, true, 'Bookings fetched', {
      bookings,
      pagination: {
        total,
        page: parseInt(req.query.page) || 1,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) { next(error); }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('restaurantId', 'name address phone bookingDeposit')
      .populate('paymentId');

    if (!booking) return sendError(res, 404, 'Booking not found');

    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    sendResponse(res, 200, true, 'Booking fetched', booking);
  } catch (error) { next(error); }
};

export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const { bookingDate, time, partySize, tablePreference, specialRequests } = req.body;
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingDate, time, partySize, tablePreference, specialRequests, updatedAt: Date.now() },
      { new: true }
    ).populate('restaurantId');

    sendResponse(res, 200, true, 'Booking updated', updated);
  } catch (error) { next(error); }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return sendError(res, 404, 'Booking not found');

    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    sendResponse(res, 200, true, 'Booking cancelled');
  } catch (error) { next(error); }
};

// ─── Owner: get all bookings for a restaurant ────────────────────────────────

export const getRestaurantBookings = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { skip, limitNum } = getPaginationParams(req.query.page, req.query.limit || 100);

    const bookings = await Booking.find({ restaurantId })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    sendResponse(res, 200, true, 'Restaurant bookings fetched', bookings);
  } catch (error) { next(error); }
};

// ─── Owner: update booking status (confirm / cancel) ─────────────────────────

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('restaurantId', 'ownerId');
    if (!booking) return sendError(res, 404, 'Booking not found');

    // Allow owner of the restaurant OR admin
    const isOwner = booking.restaurantId?.ownerId?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('restaurantId', 'name');

    // Notify the customer of status change
    const statusLabel = status === 'confirmed' ? '✓ Confirmed'
      : status === 'completed' ? '✓ Completed'
      : '✕ Cancelled';
    await createNotification(booking.userId, {
      type: 'booking_update',
      title: `Booking ${statusLabel}`,
      content: `Your reservation at ${updated.restaurantId?.name || 'the restaurant'} has been ${status}`,
      link: `/bookings`,
      relatedId: booking._id.toString(),
    });

    sendResponse(res, 200, true, 'Booking status updated', updated);
  } catch (error) { next(error); }
};

// ─── Payments (via stripeService) ────────────────────────────────────────────

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, eventBookingId, amount } = req.body;

    if (!amount || amount <= 0) return sendError(res, 400, 'Valid amount required');
    if (!bookingId && !eventBookingId) return sendError(res, 400, 'bookingId or eventBookingId required');

    const paymentIntent = await stripeService.createPaymentIntent(amount, 'usd', {
      bookingId:      bookingId      || '',
      eventBookingId: eventBookingId || ''
    });

    const payment = await Payment.create({
      userId:               req.user.userId,
      bookingId:            bookingId      || null,
      eventBookingId:       eventBookingId || null,
      amount,
      stripePaymentIntentId: paymentIntent.id,
      status:               'processing'
    });

    sendResponse(res, 201, true, 'Payment intent created', {
      clientSecret:   paymentIntent.client_secret,
      paymentId:      payment._id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) { next(error); }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId, paymentIntentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return sendError(res, 404, 'Payment not found');

    const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'succeeded';
      await payment.save();

      if (payment.bookingId) {
        await Booking.findByIdAndUpdate(payment.bookingId, {
          status:    'confirmed',
          paymentId: payment._id
        });
      }

      return sendResponse(res, 200, true, 'Payment confirmed', payment);
    }

    if (paymentIntent.status === 'requires_payment_method') {
      return sendError(res, 400, 'Payment requires payment method');
    }

    sendError(res, 400, 'Payment failed');
  } catch (error) { next(error); }
};

// ─── Demo Payment (no real Stripe — simulates a successful deposit) ──────────
export const demoPayment = async (req, res, next) => {
  try {
    const { bookingId, eventBookingId, amount, cardLastFour } = req.body;
    if (!bookingId && !eventBookingId) return sendError(res, 400, 'bookingId or eventBookingId required');
    if (!amount || amount < 0)         return sendError(res, 400, 'Valid amount required');

    // Create payment record
    const payment = await Payment.create({
      userId:        req.user.userId,
      bookingId:     bookingId     || null,
      eventBookingId:eventBookingId|| null,
      amount,
      currency:      'BDT',
      status:        'succeeded',
      paymentMethod: `demo card ending ${cardLastFour || '****'}`,
    });

    // Confirm and attach payment to the booking
    if (bookingId) {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: 'confirmed', paymentId: payment._id },
        { new: true }
      ).populate('restaurantId', 'name');

      // Notify customer
      await createNotification(req.user.userId, {
        type:      'booking_update',
        title:     'Payment received — Booking confirmed!',
        content:   `৳${amount} deposit paid for ${booking?.restaurantId?.name || 'your booking'}`,
        link:      '/bookings',
        relatedId: bookingId,
      });

      // Notify restaurant owner
      const rest = await Restaurant.findById(booking?.restaurantId?._id).select('ownerId name');
      if (rest?.ownerId) {
        await createNotification(rest.ownerId, {
          type:      'new_booking',
          title:     'Deposit received — Booking confirmed',
          content:   `৳${amount} deposit paid for a new reservation`,
          link:      '/owner/bookings',
          relatedId: bookingId,
        });
      }
    }

    if (eventBookingId) {
      const EventBookingModel = (await import('../models/EventBooking.js')).default;
      const eb = await EventBookingModel.findByIdAndUpdate(
        eventBookingId,
        { status: 'confirmed', paymentId: payment._id },
        { new: true }
      ).populate('restaurantId', 'name ownerId');

      await createNotification(req.user.userId, {
        type:      'booking_update',
        title:     'Payment received — Event confirmed!',
        content:   `৳${amount} deposit paid for ${eb?.restaurantId?.name || 'your event'}`,
        link:      '/bookings',
        relatedId: eventBookingId,
      });
    }

    sendResponse(res, 201, true, 'Demo payment succeeded', payment);
  } catch (error) { next(error); }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('bookingId')
      .populate('eventBookingId');

    if (!payment) return sendError(res, 404, 'Payment not found');

    if (payment.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    sendResponse(res, 200, true, 'Payment fetched', payment);
  } catch (error) { next(error); }
};
