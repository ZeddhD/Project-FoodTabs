import Review from '../models/Review.js';
import Dish from '../models/Dish.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { validationResult } from 'express-validator';
import { createNotification } from '../utils/notify.js';
import path from 'path';

export const getReviews = async (req, res, next) => {
  try {
    const { restaurantId, dishId, userId, page, limit, sortBy } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    let filter = {};
    if (restaurantId) filter.restaurantId = restaurantId;
    if (dishId) filter.dishId = dishId;
    if (userId) filter.userId = userId;

    let sort = { createdAt: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };
    if (sortBy === 'popular') sort = { likeCount: -1 };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name avatar')
      .populate('dishId', 'name')
      .populate('restaurantId', 'name')
      .populate('dishReviews.dishId', 'name');

    sendResponse(res, 200, true, 'Reviews fetched', {
      reviews,
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

export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('userId', 'name avatar')
      .populate('dishId', 'name price')
      .populate('restaurantId', 'name');

    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    sendResponse(res, 200, true, 'Review fetched', review);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation Error', errors.array());
    }

    const { restaurantId, dishId, title, content, rating } = req.body;

    // Parse JSON-stringified fields that arrive via FormData
    let ratings = req.body.ratings;
    if (typeof ratings === 'string') {
      try { ratings = JSON.parse(ratings); } catch { ratings = undefined; }
    }

    let dishReviews = req.body.dishReviews;
    if (typeof dishReviews === 'string') {
      try { dishReviews = JSON.parse(dishReviews); } catch { dishReviews = []; }
    }
    if (!Array.isArray(dishReviews)) dishReviews = [];

    // Collect uploaded photo paths
    const photos = (req.files || []).map(f => `/uploads/${f.filename}`);

    // Validate that either restaurant or dish is provided
    if (!restaurantId && !dishId) {
      return sendError(res, 400, 'Either restaurantId or dishId is required');
    }

    // Verify restaurant/dish exists
    let restaurant = null;
    if (restaurantId) {
      restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) return sendError(res, 404, 'Restaurant not found');
    }

    if (dishId) {
      const dish = await Dish.findById(dishId);
      if (!dish) return sendError(res, 404, 'Dish not found');
    }

    // Check for a completed booking → verifiedVisit badge
    let verifiedVisit = false;
    if (restaurantId) {
      const completedBooking = await Booking.findOne({
        userId: req.user.userId,
        restaurantId,
        status: 'completed',
      });
      verifiedVisit = !!completedBooking;
    }

    const review = new Review({
      userId: req.user.userId,
      restaurantId,
      dishId,
      title,
      content,
      rating: Number(rating),
      ratings,
      dishReviews,
      photos,
      verifiedVisit,
    });

    await review.save();

    // ── Update restaurant running totals ────────────────────────────────────
    if (restaurantId) {
      const allReviews = await Review.find({ restaurantId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const verifiedCount = allReviews.filter(r => r.verifiedVisit).length;

      // Recalculate criteria averages from all reviews that have ratings
      const withRatings = allReviews.filter(r => r.ratings);
      const criteriaAverages = {};
      ['taste', 'hygiene', 'service', 'ambience', 'value'].forEach(k => {
        const vals = withRatings.map(r => r.ratings?.[k]).filter(v => v > 0);
        criteriaAverages[k] = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : 0;
      });

      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: +avgRating.toFixed(2),
        reviewsCount: allReviews.length,
        verifiedReviewsCount: verifiedCount,
        criteriaAverages,
      });

      // Notify owner
      const rest = await Restaurant.findById(restaurantId).populate('ownerId', '_id name');
      if (rest?.ownerId?._id) {
        await createNotification(rest.ownerId._id, {
          type: 'new_review',
          title: 'New review received',
          content: `Someone rated ${rest.name} ${rating}/5 — "${title}"`,
          link: `/owner/reviews`,
          relatedId: review._id.toString(),
        });
      }
    }

    // ── Update individual dish ratings from dishReviews ─────────────────────
    if (dishReviews.length > 0) {
      await Promise.all(dishReviews.map(async dr => {
        if (!dr.dishId || !dr.rating) return;
        // Count all reviews that include this dish
        const all = await Review.find({ 'dishReviews.dishId': dr.dishId });
        const ratings = all.flatMap(rv => rv.dishReviews.filter(d => d.dishId?.toString() === dr.dishId.toString()).map(d => d.rating));
        const avg = ratings.length ? +(ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(2) : 0;
        await Dish.findByIdAndUpdate(dr.dishId, { rating: avg, reviewsCount: ratings.length });
      }));
    }

    // ── Update standalone dish rating (legacy dishId field) ─────────────────
    if (dishId) {
      const allDishReviews = await Review.find({ dishId });
      const avgRating = allDishReviews.reduce((sum, r) => sum + r.rating, 0) / allDishReviews.length;
      await Dish.findByIdAndUpdate(dishId, { rating: +avgRating.toFixed(2), reviewsCount: allDishReviews.length });
    }

    sendResponse(res, 201, true, 'Review created', review);
  } catch (error) {
    next(error);
  }
};

// Owner responds to a review
export const respondToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response?.trim()) return sendError(res, 400, 'Response text is required');

    const review = await Review.findById(id).populate('restaurantId', 'name ownerId');
    if (!review) return sendError(res, 404, 'Review not found');
    if (!review.restaurantId) return sendError(res, 400, 'This review has no associated restaurant');

    // Only the restaurant owner (or admin) may respond
    const isOwner = review.restaurantId.ownerId?.toString() === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') return sendError(res, 403, 'Only the restaurant owner can respond');

    const updated = await Review.findByIdAndUpdate(
      id,
      { ownerResponse: response.trim(), ownerResponseAt: new Date() },
      { new: true }
    );

    // Notify the review author
    await createNotification(review.userId, {
      type: 'review_response',
      title: `${review.restaurantId.name} responded to your review`,
      content: response.trim().slice(0, 120),
      link: `/restaurant/${review.restaurantId._id}`,
      relatedId: review._id.toString(),
    });

    sendResponse(res, 200, true, 'Response posted', updated);
  } catch (error) { next(error); }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, rating, ratings } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    // Verify ownership
    if (review.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { title, content, rating, ratings, updatedAt: Date.now() },
      { new: true }
    );

    sendResponse(res, 200, true, 'Review updated', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return sendError(res, 404, 'Review not found');
    }

    // Verify ownership
    if (review.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Review.findByIdAndDelete(id);

    sendResponse(res, 200, true, 'Review deleted');
  } catch (error) {
    next(error);
  }
};

// Like/Unlike review
export const likeReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    sendResponse(res, 200, true, 'Review liked', review);
  } catch (error) {
    next(error);
  }
};

export const unlikeReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { likeCount: -1 } },
      { new: true }
    );

    sendResponse(res, 200, true, 'Review unliked', review);
  } catch (error) {
    next(error);
  }
};
