import SavedOrder from '../models/SavedOrder.js';
import Dish from '../models/Dish.js';
import Restaurant from '../models/Restaurant.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';

// Create saved order ("My Usual")
export const createSavedOrder = async (req, res, next) => {
  try {
    const { restaurantId, name, items, notes } = req.body;

    if (!restaurantId || !name || !items || items.length === 0) {
      return sendError(res, 400, 'Required fields missing: restaurantId, name, items');
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    // Validate and enrich items with current prices
    let totalPrice = 0;
    const enrichedItems = [];

    for (const item of items) {
      if (!item.dishId || !item.quantity) {
        return sendError(res, 400, 'Each item must have dishId and quantity');
      }

      const dish = await Dish.findById(item.dishId);
      if (!dish) {
        return sendError(res, 400, `Dish with id ${item.dishId} not found`);
      }

      const itemPrice = dish.price * item.quantity;
      totalPrice += itemPrice;

      enrichedItems.push({
        dishId: item.dishId,
        quantity: item.quantity,
        price: dish.price
      });
    }

    const savedOrder = new SavedOrder({
      userId: req.user.userId,
      restaurantId,
      name,
      items: enrichedItems,
      totalPrice,
      notes
    });

    await savedOrder.save();
    await savedOrder.populate('restaurantId', 'name address');
    await savedOrder.populate('items.dishId', 'name price image');

    sendResponse(res, 201, true, 'Saved order created', savedOrder);
  } catch (error) {
    next(error);
  }
};

// Get all saved orders for user
export const getSavedOrders = async (req, res, next) => {
  try {
    const { page, limit, restaurantId } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    let filter = { userId: req.user.userId };
    if (restaurantId) filter.restaurantId = restaurantId;

    const total = await SavedOrder.countDocuments(filter);
    const savedOrders = await SavedOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name address rating cuisineType')
      .populate('items.dishId', 'name price image');

    sendResponse(res, 200, true, 'Saved orders fetched', {
      savedOrders,
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

// Get saved order by ID
export const getSavedOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savedOrder = await SavedOrder.findById(id)
      .populate('restaurantId', 'name address phone rating cuisineType')
      .populate('items.dishId', 'name price image description')
      .populate('userId', 'name email');

    if (!savedOrder) {
      return sendError(res, 404, 'Saved order not found');
    }

    // Check authorization
    if (savedOrder.userId._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    sendResponse(res, 200, true, 'Saved order fetched', savedOrder);
  } catch (error) {
    next(error);
  }
};

// Update saved order
export const updateSavedOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, items, notes } = req.body;

    const savedOrder = await SavedOrder.findById(id);
    if (!savedOrder) {
      return sendError(res, 404, 'Saved order not found');
    }

    // Check authorization
    if (savedOrder.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    // Recalculate total if items are updated
    let totalPrice = savedOrder.totalPrice;
    let updatedItems = savedOrder.items;

    if (items && items.length > 0) {
      totalPrice = 0;
      updatedItems = [];

      for (const item of items) {
        if (!item.dishId || !item.quantity) {
          return sendError(res, 400, 'Each item must have dishId and quantity');
        }

        const dish = await Dish.findById(item.dishId);
        if (!dish) {
          return sendError(res, 400, `Dish with id ${item.dishId} not found`);
        }

        const itemPrice = dish.price * item.quantity;
        totalPrice += itemPrice;

        updatedItems.push({
          dishId: item.dishId,
          quantity: item.quantity,
          price: dish.price
        });
      }
    }

    const updated = await SavedOrder.findByIdAndUpdate(
      id,
      {
        name: name || savedOrder.name,
        items: updatedItems,
        totalPrice,
        notes: notes !== undefined ? notes : savedOrder.notes
      },
      { new: true }
    ).populate('restaurantId', 'name address').populate('items.dishId', 'name price image');

    sendResponse(res, 200, true, 'Saved order updated', updated);
  } catch (error) {
    next(error);
  }
};

// Delete saved order
export const deleteSavedOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const savedOrder = await SavedOrder.findById(id);
    if (!savedOrder) {
      return sendError(res, 404, 'Saved order not found');
    }

    // Check authorization
    if (savedOrder.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    await SavedOrder.findByIdAndDelete(id);

    sendResponse(res, 200, true, 'Saved order deleted');
  } catch (error) {
    next(error);
  }
};
