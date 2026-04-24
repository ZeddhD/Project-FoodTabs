// Recommendation Service — complex scoring logic lives here, controller stays thin.
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import Favorite from '../models/Favorite.js';

import Dish from '../models/Dish.js';
import User from '../models/User.js';

// ─── Price range → priceRange field mapping ───────────────────────────────────
const PRICE_MAP = {
  budget:   ['$'],
  moderate: ['$$'],
  premium:  ['$$$', '$$$$'],
};

/**
 * Return personalised restaurant recommendations for a user.
 * Excludes restaurants they have already reviewed or favourited.
 */
export async function getPersonalised(userId, filters = {}) {
  const { cuisinePreference, priceRange, minRating } = filters;

  const [userReviews, userFavorites] = await Promise.all([
    Review.find({ userId }).populate('restaurantId'),
    Favorite.find({ userId }).populate('restaurantId')
  ]);

  // Build Mongo filter
  const dbFilter = { isActive: true };
  if (cuisinePreference) {
    dbFilter.cuisineTypes = {
      $in: Array.isArray(cuisinePreference) ? cuisinePreference : [cuisinePreference]
    };
  }
  if (priceRange && PRICE_MAP[priceRange]) dbFilter.priceRange = { $in: PRICE_MAP[priceRange] };
  if (minRating) dbFilter.rating = { $gte: parseFloat(minRating) };

  // Exclude already-visited restaurants
  const visitedIds = [
    ...userReviews.map(r => r.restaurantId?._id?.toString()).filter(Boolean),
    ...userFavorites.map(f => f.restaurantId?._id?.toString()).filter(Boolean)
  ];
  if (visitedIds.length) dbFilter._id = { $nin: visitedIds };

  const restaurants = await Restaurant.find(dbFilter)
    .sort({ rating: -1 })
    .limit(20)
    .populate('ownerId', 'name');

  // Score each candidate
  const cuisines = Array.isArray(cuisinePreference)
    ? cuisinePreference
    : cuisinePreference ? [cuisinePreference] : [];

  const scored = restaurants.map(r => {
    let score = r.rating;

    // Cuisine match boost
    if (cuisines.length && r.cuisineTypes.some(c => cuisines.includes(c))) score += 2;

    // Similar to user's favourite cuisines
    const favCuisines = userFavorites.flatMap(f => f.restaurantId?.cuisineTypes || []);
    if (r.cuisineTypes.some(c => favCuisines.includes(c))) score += 1.5;

    // High-rated reviewer boost
    const highReviews = userReviews.filter(rev => rev.rating >= 4).length;
    if (highReviews > 0) score += 0.5;

    return { ...r.toObject(), recommendationScore: +score.toFixed(2) };
  });

  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 10);
}

/**
 * Return similar users and their favourite restaurants.
 */
export async function getSimilarUsers(userId, limit = 5) {
  const [userReviews, userFavorites] = await Promise.all([
    Review.find({ userId }).populate('restaurantId'),
    Favorite.find({ userId })
  ]);

  if (!userReviews.length && !userFavorites.length) return [];

  // Find users who reviewed the same restaurants
  const myRestaurantIds = userReviews.map(r => r.restaurantId?._id).filter(Boolean);
  const overlappingReviews = await Review.find({
    restaurantId: { $in: myRestaurantIds },
    userId: { $ne: userId }
  });

  const similarUserIds = [...new Set(overlappingReviews.map(r => r.userId.toString()))];
  if (!similarUserIds.length) return [];

  const theirFavorites = await Favorite.find({ userId: { $in: similarUserIds } })
    .populate('restaurantId')
    .populate('userId', 'name avatar');

  // Group by user
  const map = {};
  theirFavorites.forEach(fav => {
    const uid = fav.userId._id.toString();
    if (!map[uid]) map[uid] = { user: fav.userId, favorites: [] };
    map[uid].favorites.push(fav.restaurantId);
  });

  return Object.values(map)
    .slice(0, limit)
    .map(({ user, favorites }) => ({ user, favoriteRestaurants: favorites.slice(0, 3) }));
}

/**
 * Return trending restaurants (most reviewed in last N days).
 */
export async function getTrending(limit = 8, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const aggregated = await Review.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$restaurantId', reviewCount: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    { $sort: { reviewCount: -1 } },
    { $limit: limit }
  ]);

  const ids = aggregated.map(r => r._id);
  const restaurants = await Restaurant.find({ _id: { $in: ids } }).populate('ownerId', 'name');

  return restaurants.map(r => {
    const agg = aggregated.find(a => a._id.toString() === r._id.toString());
    return {
      ...r.toObject(),
      recentReviewCount: agg.reviewCount,
      recentAvgRating: +agg.avgRating.toFixed(2)
    };
  });
}

/**
 * Return smart (profile-based) recommendations. Falls back to trending if no history.
 */
// Hard fallback: just return top-rated active restaurants
async function getTopRated(limit = 6, excludeIds = []) {
  const filter = { isActive: true };
  if (excludeIds.length) filter._id = { $nin: excludeIds };
  return Restaurant.find(filter).sort({ rating: -1 }).limit(limit).populate('ownerId', 'name');
}

export async function getSmart(userId, limit = 6) {
  const userReviews = await Review.find({ userId })
    .populate('restaurantId')
    .sort({ createdAt: -1 });

  if (!userReviews.length) {
    const trending = await getTrending(limit);
    if (trending.length) return trending;
    return getTopRated(limit);
  }

  const avgUserRating = userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length;

  // Build cuisine weight map
  const cuisineWeights = {};
  userReviews.forEach(rev => {
    rev.restaurantId?.cuisineTypes?.forEach(c => {
      cuisineWeights[c] = (cuisineWeights[c] || 0) + rev.rating;
    });
  });

  const visitedIds = userReviews.map(r => r.restaurantId?._id).filter(Boolean);

  const candidates = await Restaurant.find({
    isActive: true,
    _id: { $nin: visitedIds },
    rating: { $gte: avgUserRating - 0.5 }
  })
    .sort({ rating: -1 })
    .limit(limit * 3)
    .populate('ownerId', 'name');

  // If no candidates (e.g. user has visited every restaurant), fall back
  if (!candidates.length) {
    const trending = await getTrending(limit);
    if (trending.length) return trending;
    return getTopRated(limit, visitedIds);
  }

  const scored = candidates.map(r => {
    let score = r.rating;
    r.cuisineTypes.forEach(c => {
      if (cuisineWeights[c]) score += cuisineWeights[c] / userReviews.length;
    });
    return { ...r.toObject(), matchScore: +score.toFixed(2) };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/**
 * Return recommended dishes based on the user's actual review/favourite history.
 * Picks top-rated dishes from restaurants the user hasn't visited yet,
 * weighted toward cuisines they've rated highly.
 */
export async function getRecommendedDishes(userId, limit = 8) {
  const [userReviews, userFavorites, userProfile] = await Promise.all([
    Review.find({ userId }).populate('restaurantId'),
    Favorite.find({ userId }).populate('restaurantId'),
    User.findById(userId).select('preferences'),
  ]);

  // Build cuisine weight map from actual reviews
  const cuisineWeights = {};
  userReviews.forEach(rev => {
    rev.restaurantId?.cuisineTypes?.forEach(c => {
      cuisineWeights[c] = (cuisineWeights[c] || 0) + rev.rating;
    });
  });
  const topCuisines = Object.entries(cuisineWeights)
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
    .slice(0, 5);

  // Merge with stored preferences for new users with no history
  const cuisines = [...new Set([...topCuisines, ...(userProfile?.preferences?.cuisines || [])])];

  // Restaurants user hasn't visited
  const visitedIds = [
    ...userReviews.map(r => r.restaurantId?._id?.toString()).filter(Boolean),
    ...userFavorites.map(f => f.restaurantId?._id?.toString()).filter(Boolean),
  ];

  const restFilter = { isActive: true };
  if (cuisines.length) restFilter.cuisineTypes = { $in: cuisines };
  if (visitedIds.length) restFilter._id = { $nin: visitedIds };

  let restaurants = await Restaurant.find(restFilter).sort({ rating: -1 }).limit(12);

  // Fallback: ignore cuisine filter if no results
  if (!restaurants.length && visitedIds.length) {
    restaurants = await Restaurant.find({ isActive: true, _id: { $nin: visitedIds } })
      .sort({ rating: -1 }).limit(12);
  }

  const ids = restaurants.map(r => r._id);

  // Try preferred restaurants first; fall back to all dishes globally
  let dishes = [];
  if (ids.length) {
    dishes = await Dish.find({ isAvailable: true, restaurantId: { $in: ids } })
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(limit)
      .populate('restaurantId', 'name city rating priceRange isVerified cuisineTypes');
  }
  if (!dishes.length) {
    dishes = await Dish.find({ isAvailable: true })
      .sort({ rating: -1, reviewsCount: -1 })
      .limit(limit)
      .populate('restaurantId', 'name city rating priceRange isVerified cuisineTypes');
  }
  return dishes;
}

/**
 * Derive user's taste profile from actual interaction history.
 */
export async function getTasteProfile(userId) {
  const [userReviews, userFavorites] = await Promise.all([
    Review.find({ userId }).populate('restaurantId'),
    Favorite.find({ userId }).populate('restaurantId'),
  ]);

  const cuisineWeights = {};
  userReviews.forEach(rev => {
    rev.restaurantId?.cuisineTypes?.forEach(c => {
      cuisineWeights[c] = (cuisineWeights[c] || 0) + rev.rating;
    });
  });
  userFavorites.forEach(fav => {
    fav.restaurantId?.cuisineTypes?.forEach(c => {
      cuisineWeights[c] = (cuisineWeights[c] || 0) + 1;
    });
  });

  const topCuisines = Object.entries(cuisineWeights)
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
    .slice(0, 6);

  const avgRating = userReviews.length
    ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1)
    : null;

  return {
    topCuisines,
    reviewCount: userReviews.length,
    favoriteCount: userFavorites.length,
    avgRating: avgRating ? parseFloat(avgRating) : null,
    hasHistory: userReviews.length > 0 || userFavorites.length > 0,
  };
}
