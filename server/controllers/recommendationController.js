import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import Favorite from '../models/Favorite.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/helpers.js';

// Get personalized recommendations for user
export const getRecommendations = async (req, res, next) => {
  try {
    const { cuisinePreference, dietaryRestriction, priceRange, minRating } = req.query;
    const userId = req.user.userId;

    // Get user's history
    const userReviews = await Review.find({ userId }).populate('restaurantId');
    const userFavorites = await Favorite.find({ userId }).populate('restaurantId');

    // Build filter based on preferences
    let filter = { isActive: true };

    if (cuisinePreference) {
      filter.cuisineTypes = { $in: Array.isArray(cuisinePreference) ? cuisinePreference : [cuisinePreference] };
    }

    if (priceRange) {
      if (priceRange === 'budget') filter.averagePrice = { $lte: 300 };
      else if (priceRange === 'moderate') filter.averagePrice = { $gt: 300, $lte: 700 };
      else if (priceRange === 'premium') filter.averagePrice = { $gt: 700 };
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Get already visited restaurants (to exclude)
    const visitedRestaurantIds = userReviews
      .map(r => r.restaurantId._id.toString())
      .concat(userFavorites.map(f => f.restaurantId._id.toString()));

    // Get recommendations
    let recommendations = await Restaurant.find({
      ...filter,
      _id: { $nin: visitedRestaurantIds }
    })
      .sort({ rating: -1 })
      .limit(10)
      .populate('ownerId', 'name');

    // Score recommendations based on similarity
    const scoredRecommendations = recommendations.map(restaurant => {
      let score = restaurant.rating; // Base score from rating

      // Boost if cuisine matches preferences
      if (cuisinePreference && restaurant.cuisineTypes.some(c => 
        (Array.isArray(cuisinePreference) ? cuisinePreference : [cuisinePreference]).includes(c)
      )) {
        score += 2;
      }

      // Boost if similar to user's favorite restaurants
      const similarToFavorites = userFavorites.some(fav => 
        fav.restaurantId.cuisineTypes.some(c => restaurant.cuisineTypes.includes(c))
      );
      if (similarToFavorites) {
        score += 1.5;
      }

      // Boost if has high reviews
      const highReviews = userReviews.filter(r => r.rating >= 4).length;
      if (highReviews > 0) {
        score += 0.5;
      }

      return {
        ...restaurant.toObject(),
        recommendationScore: score
      };
    });

    // Sort by recommendation score
    const sorted = scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    sendResponse(res, 200, true, 'Recommendations fetched', sorted);
  } catch (error) {
    next(error);
  }
};

// Get similar users and their favorites
export const getSimilarUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 5;

    // Get current user's preferences
    const userReviews = await Review.find({ userId }).populate('restaurantId');
    const userFavorites = await Favorite.find({ userId });

    if (userReviews.length === 0 && userFavorites.length === 0) {
      return sendResponse(res, 200, true, 'Similar users', []);
    }

    // Get user's favorite cuisines
    const userCuisines = new Set();
    userReviews.forEach(r => {
      if (r.restaurantId && r.restaurantId.cuisineTypes) {
        r.restaurantId.cuisineTypes.forEach(c => userCuisines.add(c));
      }
    });

    // Find similar users - those who reviewed similar restaurants
    const similarUserIds = new Set();
    const similarReviews = await Review.find({
      restaurantId: { $in: userReviews.map(r => r.restaurantId._id) },
      userId: { $ne: userId }
    });

    similarReviews.forEach(r => similarUserIds.add(r.userId.toString()));

    // Get similar users' favorite restaurants
    const similarUserFavorites = await Favorite.find({
      userId: { $in: Array.from(similarUserIds) }
    })
      .populate('restaurantId')
      .populate('userId', 'name avatar');

    // Group by user and get top restaurants
    const userFavoritesMap = {};
    similarUserFavorites.forEach(fav => {
      const uid = fav.userId._id.toString();
      if (!userFavoritesMap[uid]) {
        userFavoritesMap[uid] = {
          user: fav.userId,
          favorites: []
        };
      }
      userFavoritesMap[uid].favorites.push(fav.restaurantId);
    });

    // Convert to array and limit results
    const result = Object.values(userFavoritesMap)
      .slice(0, limit)
      .map(item => ({
        user: item.user,
        favoriteRestaurants: item.favorites.slice(0, 3)
      }));

    sendResponse(res, 200, true, 'Similar users fetched', result);
  } catch (error) {
    next(error);
  }
};

// Get trending restaurants based on recent reviews and bookings
export const getTrendingRestaurants = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const days = parseInt(req.query.days) || 30; // Last 30 days by default

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Get restaurants with recent reviews
    const recentReviews = await Review.aggregate([
      {
        $match: { createdAt: { $gte: dateLimit } }
      },
      {
        $group: {
          _id: '$restaurantId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Get restaurant details
    const restaurantIds = recentReviews.map(r => r._id);
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } })
      .populate('ownerId', 'name');

    // Merge data
    const trending = restaurants.map(restaurant => {
      const reviewData = recentReviews.find(r => r._id.toString() === restaurant._id.toString());
      return {
        ...restaurant.toObject(),
        recentReviewCount: reviewData.reviewCount,
        recentAvgRating: reviewData.avgRating.toFixed(2)
      };
    });

    sendResponse(res, 200, true, 'Trending restaurants fetched', trending);
  } catch (error) {
    next(error);
  }
};

// Get restaurant recommendations based on user profile
export const getSmartRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 6;

    // Get user's reviews and their patterns
    const userReviews = await Review.find({ userId })
      .populate('restaurantId')
      .sort({ createdAt: -1 });

    // If user has no reviews, return trending restaurants
    if (userReviews.length === 0) {
      return await getTrendingRestaurants(req, res, next);
    }

    // Calculate user's preferences
    const avgUserRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const preferredCuisines = {};
    const preferredPriceRange = {};

    userReviews.forEach(review => {
      if (review.restaurantId) {
        // Track cuisine preferences
        review.restaurantId.cuisineTypes.forEach(cuisine => {
          preferredCuisines[cuisine] = (preferredCuisines[cuisine] || 0) + review.rating;
        });

        // Track price preferences
        const priceRange = review.restaurantId.averagePrice <= 300 ? 'budget' :
          review.restaurantId.averagePrice <= 700 ? 'moderate' : 'premium';
        preferredPriceRange[priceRange] = (preferredPriceRange[priceRange] || 0) + 1;
      }
    });

    // Find visited restaurants
    const visitedIds = userReviews.map(r => r.restaurantId._id);

    // Find similar restaurants
    const recommendations = await Restaurant.find({
      isActive: true,
      _id: { $nin: visitedIds },
      rating: { $gte: avgUserRating - 0.5 }
    })
      .sort({ rating: -1 })
      .limit(limit * 2)
      .populate('ownerId', 'name');

    // Score recommendations
    const scored = recommendations.map(restaurant => {
      let score = restaurant.rating;

      // Score based on cuisine match
      restaurant.cuisineTypes.forEach(cuisine => {
        if (preferredCuisines[cuisine]) {
          score += preferredCuisines[cuisine] / userReviews.length;
        }
      });

      return {
        ...restaurant.toObject(),
        matchScore: score
      };
    });

    const finalRecommendations = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    sendResponse(res, 200, true, 'Smart recommendations fetched', finalRecommendations);
  } catch (error) {
    next(error);
  }
};
