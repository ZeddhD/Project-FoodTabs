import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import Review from '../models/Review.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { validationResult } from 'express-validator';

export const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, city, minRating, page, limit, sortBy } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    // Build filter
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (cuisine) {
      filter.cuisineTypes = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };
    }
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Build sort
    let sort = { createdAt: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };
    if (sortBy === 'price') sort = { averagePrice: 1 };

    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('ownerId', 'name email');

    sendResponse(res, 200, true, 'Restaurants fetched', {
      restaurants,
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

export const getRestaurantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate('ownerId', 'name email phone');
    
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    // Increment views count
    await Restaurant.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    // Get dishes
    const dishes = await Dish.find({ restaurantId: id, isAvailable: true });

    // Get reviews with user info
    const reviews = await Review.find({ restaurantId: id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    sendResponse(res, 200, true, 'Restaurant details fetched', {
      restaurant,
      dishes,
      recentReviews: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation Error', errors.array());
    }

    const { name, description, cuisineTypes, address, city, phone, email, website, averagePrice, priceRange, openingHours } = req.body;

    const restaurant = new Restaurant({
      name,
      description,
      cuisineTypes,
      address,
      city,
      phone,
      email,
      website,
      averagePrice,
      priceRange,
      openingHours,
      ownerId: req.user.userId,
      images: [],
      coverImage: '/default-restaurant.jpg'
    });

    await restaurant.save();

    sendResponse(res, 201, true, 'Restaurant created', restaurant);
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, cuisineTypes, address, city, phone, email, website, averagePrice, priceRange, openingHours } = req.body;

    // Check ownership
    const restaurant = await Restaurant.findById(id);
    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const updated = await Restaurant.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        cuisineTypes, 
        address, 
        city, 
        phone, 
        email, 
        website, 
        averagePrice, 
        priceRange, 
        openingHours,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, true, 'Restaurant updated', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Restaurant.findByIdAndDelete(id);

    sendResponse(res, 200, true, 'Restaurant deleted');
  } catch (error) {
    next(error);
  }
};

// Get restaurants by owner
export const getOwnerRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user.userId });
    sendResponse(res, 200, true, 'Restaurants fetched', restaurants);
  } catch (error) {
    next(error);
  }
};

// Get restaurant analytics (Owner/Admin)
export const getRestaurantAnalytics = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    // Check authorization
    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    // Import required models for analytics
    const Booking = require('../models/Booking.js').default;
    const EventBooking = require('../models/EventBooking.js').default;
    const Review = require('../models/Review.js').default;

    // Get booking statistics
    const bookings = await Booking.find({ restaurantId });
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalGuests = bookings.reduce((sum, b) => sum + (b.partySize || 0), 0);

    // Get event booking statistics
    const eventBookings = await EventBooking.find({ restaurantId });
    const totalEventBookings = eventBookings.length;
    const confirmedEventBookings = eventBookings.filter(e => e.status === 'confirmed').length;

    // Get review statistics
    const reviews = await Review.find({ restaurantId });
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

    // Calculate multi-criteria averages
    let avgTaste = 0, avgHygiene = 0, avgService = 0, avgAmbience = 0, avgValue = 0;
    
    const reviewsWithRatings = reviews.filter(r => r.ratings);
    if (reviewsWithRatings.length > 0) {
      avgTaste = (reviewsWithRatings.reduce((sum, r) => sum + (r.ratings.taste || 0), 0) / reviewsWithRatings.length).toFixed(2);
      avgHygiene = (reviewsWithRatings.reduce((sum, r) => sum + (r.ratings.hygiene || 0), 0) / reviewsWithRatings.length).toFixed(2);
      avgService = (reviewsWithRatings.reduce((sum, r) => sum + (r.ratings.service || 0), 0) / reviewsWithRatings.length).toFixed(2);
      avgAmbience = (reviewsWithRatings.reduce((sum, r) => sum + (r.ratings.ambience || 0), 0) / reviewsWithRatings.length).toFixed(2);
      avgValue = (reviewsWithRatings.reduce((sum, r) => sum + (r.ratings.value || 0), 0) / reviewsWithRatings.length).toFixed(2);
    }

    // Get dishes count
    const dishes = await Dish.find({ restaurantId });
    const totalDishes = dishes.length;

    // Calculate revenue from bookings (if payment info available)
    const Payment = require('../models/Payment.js').default;
    const payments = await Payment.find({ bookingId: { $in: bookings.map(b => b._id) } });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Booking trends (by date)
    const bookingsByDate = {};
    bookings.forEach(b => {
      const date = new Date(b.bookingDate).toISOString().split('T')[0];
      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    });

    // Review trends (by month)
    const reviewsByMonth = {};
    reviews.forEach(r => {
      const month = new Date(r.createdAt).toISOString().slice(0, 7);
      reviewsByMonth[month] = (reviewsByMonth[month] || 0) + 1;
    });

    const analytics = {
      overview: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalGuests,
        totalEventBookings,
        confirmedEventBookings,
        totalReviews,
        averageRating,
        totalDishes,
        totalRevenue
      },
      ratings: {
        overall: parseFloat(averageRating),
        taste: parseFloat(avgTaste),
        hygiene: parseFloat(avgHygiene),
        service: parseFloat(avgService),
        ambience: parseFloat(avgAmbience),
        value: parseFloat(avgValue)
      },
      trends: {
        bookingsByDate,
        reviewsByMonth
      },
      restaurant: {
        name: restaurant.name,
        rating: restaurant.rating,
        cuisineTypes: restaurant.cuisineTypes,
        isVerified: restaurant.isVerified
      }
    };

    sendResponse(res, 200, true, 'Analytics fetched', analytics);
  } catch (error) {
    next(error);
  }
};
