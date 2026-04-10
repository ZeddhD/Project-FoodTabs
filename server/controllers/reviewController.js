import Review from '../models/Review.js';
import Dish from '../models/Dish.js';
import Restaurant from '../models/Restaurant.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { validationResult } from 'express-validator';

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
      .populate('restaurantId', 'name');

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

    const { restaurantId, dishId, title, content, rating, ratings } = req.body;

    // Validate that either restaurant or dish is provided
    if (!restaurantId && !dishId) {
      return sendError(res, 400, 'Either restaurantId or dishId is required');
    }

    // Verify restaurant/dish exists
    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return sendError(res, 404, 'Restaurant not found');
      }
    }

    if (dishId) {
      const dish = await Dish.findById(dishId);
      if (!dish) {
        return sendError(res, 404, 'Dish not found');
      }
    }

    const review = new Review({
      userId: req.user.userId,
      restaurantId,
      dishId,
      title,
      content,
      rating,
      ratings,
      photos: []
    });

    await review.save();

    // Update restaurant/dish rating
    if (restaurantId) {
      const restaurant = await Restaurant.findById(restaurantId);
      const allReviews = await Review.find({ restaurantId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: avgRating,
        reviewsCount: allReviews.length
      });
    }

    if (dishId) {
      const dish = await Dish.findById(dishId);
      const allReviews = await Review.find({ dishId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await Dish.findByIdAndUpdate(dishId, {
        rating: avgRating,
        reviewsCount: allReviews.length
      });
    }

    sendResponse(res, 201, true, 'Review created', review);
  } catch (error) {
    next(error);
  }
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
