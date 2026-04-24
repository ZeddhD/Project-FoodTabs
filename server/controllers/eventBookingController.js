import EventBooking from '../models/EventBooking.js';
import Restaurant from '../models/Restaurant.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';

// Create Event Booking
export const createEventBooking = async (req, res, next) => {
  try {
    const {
      restaurantId,
      eventName,
      eventType,
      eventDate,
      eventTime,
      duration,
      guestCount,
      estimatedBudget,
      description,
      specialRequirements
    } = req.body;

    if (!restaurantId || !eventName || !eventDate || !eventTime || !duration || !guestCount) {
      return sendError(res, 400, 'Required fields missing');
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    const eventBooking = new EventBooking({
      userId: req.user.userId,
      restaurantId,
      eventName,
      eventType,
      eventDate,
      eventTime,
      duration,
      guestCount,
      estimatedBudget,
      description,
      specialRequirements,
      status: 'pending'
    });

    await eventBooking.save();
    await eventBooking.populate('restaurantId', 'name address phone');
    await eventBooking.populate('userId', 'name email');

    sendResponse(res, 201, true, 'Event booking created', eventBooking);
  } catch (error) {
    next(error);
  }
};

// Get all event bookings for user
export const getEventBookings = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    let filter = { userId: req.user.userId };
    if (status) filter.status = status;

    const total = await EventBooking.countDocuments(filter);
    const eventBookings = await EventBooking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name address phone rating')
      .populate('paymentId');

    sendResponse(res, 200, true, 'Event bookings fetched', {
      eventBookings,
      pagination: {
        total,
        page: parseInt(page) || 1,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get event booking by ID
export const getEventBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eventBooking = await EventBooking.findById(id)
      .populate('restaurantId')
      .populate('userId', 'name email phone')
      .populate('paymentId');

    if (!eventBooking) {
      return sendError(res, 404, 'Event booking not found');
    }

    // Check authorization
    if (eventBooking.userId._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    sendResponse(res, 200, true, 'Event booking fetched', eventBooking);
  } catch (error) {
    next(error);
  }
};

// Get all event bookings for a restaurant (Owner only)
export const getRestaurantEventBookings = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page, limit, status } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    // Verify restaurant ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    let filter = { restaurantId };
    if (status) filter.status = status;

    const total = await EventBooking.countDocuments(filter);
    const eventBookings = await EventBooking.find(filter)
      .sort({ eventDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email phone')
      .populate('paymentId');

    sendResponse(res, 200, true, 'Restaurant event bookings fetched', {
      eventBookings,
      pagination: {
        total,
        page: parseInt(page) || 1,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update event booking
export const updateEventBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      eventName,
      eventType,
      eventDate,
      eventTime,
      duration,
      guestCount,
      estimatedBudget,
      description,
      specialRequirements
    } = req.body;

    const eventBooking = await EventBooking.findById(id);
    if (!eventBooking) {
      return sendError(res, 404, 'Event booking not found');
    }

    // Check authorization
    if (eventBooking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    // Don't allow update if already confirmed
    if (eventBooking.status === 'confirmed') {
      return sendError(res, 400, 'Cannot update confirmed booking');
    }

    const updated = await EventBooking.findByIdAndUpdate(
      id,
      {
        eventName: eventName || eventBooking.eventName,
        eventType: eventType || eventBooking.eventType,
        eventDate: eventDate || eventBooking.eventDate,
        eventTime: eventTime || eventBooking.eventTime,
        duration: duration || eventBooking.duration,
        guestCount: guestCount || eventBooking.guestCount,
        estimatedBudget: estimatedBudget || eventBooking.estimatedBudget,
        description: description || eventBooking.description,
        specialRequirements: specialRequirements || eventBooking.specialRequirements,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('restaurantId', 'name address phone');

    sendResponse(res, 200, true, 'Event booking updated', updated);
  } catch (error) {
    next(error);
  }
};

// Update event booking status (Owner/Admin)
export const updateEventBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const eventBooking = await EventBooking.findById(id);
    if (!eventBooking) {
      return sendError(res, 404, 'Event booking not found');
    }

    // Owner can confirm/cancel, admin can do anything
    const restaurant = await Restaurant.findById(eventBooking.restaurantId);
    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const updated = await EventBooking.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('restaurantId', 'name').populate('userId', 'name email');

    sendResponse(res, 200, true, `Event booking ${status}`, updated);
  } catch (error) {
    next(error);
  }
};

// Cancel event booking
export const cancelEventBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eventBooking = await EventBooking.findById(id);
    if (!eventBooking) {
      return sendError(res, 404, 'Event booking not found');
    }

    // Check authorization
    if (eventBooking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await EventBooking.findByIdAndUpdate(id, { status: 'cancelled', updatedAt: Date.now() });

    sendResponse(res, 200, true, 'Event booking cancelled');
  } catch (error) {
    next(error);
  }
};
