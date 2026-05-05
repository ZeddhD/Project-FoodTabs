import Favorite from '../models/Favorite.js';
import { sendResponse, sendError } from '../utils/helpers.js';

export const getFavorites = async (req, res, next) => {
  try {
    const { type } = req.query;

    let filter = { userId: req.user.userId };
    if (type) filter.type = type; // 'restaurant' or 'dish'

    const favorites = await Favorite.find(filter)
      .populate('restaurantId')
      .populate('dishId')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Favorites fetched', favorites);
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { restaurantId, dishId, type } = req.body;

    // Validate input
    if (!type || !['restaurant', 'dish'].includes(type)) {
      return sendError(res, 400, 'Valid type (restaurant/dish) is required');
    }

    if (type === 'restaurant' && !restaurantId) {
      return sendError(res, 400, 'restaurantId required for restaurant type');
    }

    if (type === 'dish' && !dishId) {
      return sendError(res, 400, 'dishId required for dish type');
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.user.userId,
      restaurantId: type === 'restaurant' ? restaurantId : null,
      dishId: type === 'dish' ? dishId : null,
      type
    });

    if (existingFavorite) {
      return sendError(res, 400, 'Already added to favorites');
    }

    const favorite = new Favorite({
      userId: req.user.userId,
      restaurantId: type === 'restaurant' ? restaurantId : null,
      dishId: type === 'dish' ? dishId : null,
      type
    });

    await favorite.save();

    sendResponse(res, 201, true, 'Added to favorites', favorite);
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findById(id);
    if (!favorite) {
      return sendError(res, 404, 'Favorite not found');
    }

    // Verify ownership
    if (favorite.userId.toString() !== req.user.userId) {
      return sendError(res, 403, 'Access denied');
    }

    await Favorite.findByIdAndDelete(id);

    sendResponse(res, 200, true, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
};

// Check if item is favorited
export const isFavorited = async (req, res, next) => {
  try {
    const { restaurantId, dishId, type } = req.query;

    if (!type || !['restaurant', 'dish'].includes(type)) {
      return sendError(res, 400, 'Valid type required');
    }

    const favorite = await Favorite.findOne({
      userId: req.user.userId,
      restaurantId: type === 'restaurant' ? restaurantId : null,
      dishId: type === 'dish' ? dishId : null,
      type
    });

    sendResponse(res, 200, true, 'Checked favorite status', {
      isFavorited: !!favorite,
      favoriteId: favorite?._id
    });
  } catch (error) {
    next(error);
  }
};
