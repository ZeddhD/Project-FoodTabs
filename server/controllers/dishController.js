import Dish from '../models/Dish.js';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import { sendResponse, sendError } from '../utils/helpers.js';
import { validationResult } from 'express-validator';

export const getDishes = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { category, isAvailable } = req.query;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return sendError(res, 404, 'Restaurant not found');

    const isOwner = req.user?.userId === restaurant.ownerId?.toString();
    const isAdmin = req.user?.role === 'admin';
    if ((!restaurant.isActive || !restaurant.isVerified) && !isOwner && !isAdmin) {
      return sendError(res, 404, 'Restaurant not found');
    }

    let filter = { restaurantId };
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const dishes = await Dish.find(filter).sort({ reviewsCount: -1, createdAt: -1 });
    sendResponse(res, 200, true, 'Dishes fetched', dishes);
  } catch (error) {
    next(error);
  }
};

export const getDishById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id).populate('restaurantId', 'name rating city priceRange cuisineTypes isVerified isActive ownerId');
    if (!dish) return sendError(res, 404, 'Dish not found');

    const restaurant = dish.restaurantId;
    const isOwner = req.user?.userId === restaurant.ownerId?.toString();
    const isAdmin = req.user?.role === 'admin';
    if ((!restaurant.isActive || !restaurant.isVerified) && !isOwner && !isAdmin) {
      return sendError(res, 404, 'Dish not found');
    }

    sendResponse(res, 200, true, 'Dish details fetched', dish);
  } catch (error) {
    next(error);
  }
};

/* GET /api/restaurants/:restaurantId/dishes/:id/reviews
   Returns reviews that include this dish, sorted by likeCount then createdAt */
export const getDishReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;

    const reviews = await Review.find({
      'dishReviews.dishId': id,
      isPublished: { $ne: false }
    })
      .populate('userId', 'name')
      .sort({ likeCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ 'dishReviews.dishId': id, isPublished: { $ne: false } });

    // Attach the specific dish rating for this dish onto each review
    const enriched = reviews.map(rv => {
      const obj = rv.toObject();
      const dr = obj.dishReviews?.find(d => d.dishId?.toString() === id);
      obj.dishRating = dr?.rating || null;
      obj.dishComment = dr?.comment || null;
      return obj;
    });

    sendResponse(res, 200, true, 'Dish reviews fetched', { reviews: enriched, total });
  } catch (error) {
    next(error);
  }
};

/* GET /api/dishes/search?q=biriyani&limit=6
   Full-text search across all dishes, returns dish + restaurant info */
export const searchDishes = async (req, res, next) => {
  try {
    const { q, limit = 6 } = req.query;
    const search = q?.trim();
    if (!search || search.length < 2) return sendResponse(res, 200, true, 'Dishes fetched', []);

    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeSearch, 'i');

    const dishes = await Dish.aggregate([
      { $match: { isAvailable: true } },
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurantId',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      { $unwind: '$restaurant' },
      {
        $match: {
          'restaurant.isActive': { $ne: false },
          'restaurant.isVerified': true,
          $or: [
            { name: regex },
            { description: regex },
            { category: regex },
            { 'restaurant.name': regex },
            { 'restaurant.city': regex },
            { 'restaurant.cuisineTypes': regex },
            { 'restaurant.tags': regex }
          ]
        }
      },
      { $sort: { reviewsCount: -1, name: 1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          description: 1,
          category: 1,
          price: 1,
          rating: 1,
          reviewsCount: 1,
          isAvailable: 1,
          dietaryInfo: 1,
          images: 1,
          restaurantId: '$restaurant'
        }
      }
    ]);

    sendResponse(res, 200, true, 'Dishes fetched', dishes);
  } catch (error) {
    next(error);
  }
};

export const createDish = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 400, 'Validation Error', errors.array());

    const { restaurantId } = req.params;
    const { name, description, category, price, dietaryInfo, allergens, calories, servingSize, isAvailable } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin')) {
      return sendError(res, 403, 'Access denied');
    }

    const dish = new Dish({
      name, description, restaurantId, category, price, dietaryInfo, allergens, calories, servingSize,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      images: []
    });
    await dish.save();
    sendResponse(res, 201, true, 'Dish created', dish);
  } catch (error) {
    next(error);
  }
};

export const updateDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, dietaryInfo, allergens, calories, servingSize, isAvailable } = req.body;

    const dish = await Dish.findById(id);
    if (!dish) return sendError(res, 404, 'Dish not found');

    const restaurant = await Restaurant.findById(dish.restaurantId);
    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const updated = await Dish.findByIdAndUpdate(
      id,
      { name, description, category, price, dietaryInfo, allergens, calories, servingSize,
        isAvailable: isAvailable !== undefined ? isAvailable : dish.isAvailable, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, true, 'Dish updated', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);
    if (!dish) return sendError(res, 404, 'Dish not found');

    const restaurant = await Restaurant.findById(dish.restaurantId);
    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await Dish.findByIdAndDelete(id);
    sendResponse(res, 200, true, 'Dish deleted');
  } catch (error) {
    next(error);
  }
};
