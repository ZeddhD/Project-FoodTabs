import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import VerificationRequest from '../models/VerificationRequest.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers, customers, owners, admins,
      totalRestaurants, verifiedRestaurants,
      totalBookings, totalReviews,
      pendingReports, pendingVerifications,
      ratingAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'admin' }),
      Restaurant.countDocuments({ isActive: true }),
      Restaurant.countDocuments({ isVerified: true }),
      Booking.countDocuments(),
      Review.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      VerificationRequest.countDocuments({ status: 'pending' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    sendResponse(res, 200, true, 'Admin stats fetched', {
      totalUsers, customers, owners, admins,
      totalRestaurants, verifiedRestaurants,
      totalBookings, totalReviews,
      pendingReports,
      pendingVerifications,
      averageRating: ratingAgg[0]?.avg ? +ratingAgg[0].avg.toFixed(1) : 0,
    });
  } catch (error) { next(error); }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page, limit, sortBy } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }

    // Build sort
    let sort = { createdAt: -1 };
    if (sortBy === 'name') sort = { name: 1 };
    if (sortBy === 'email') sort = { email: 1 };

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    sendResponse(res, 200, true, 'Users fetched', {
      users,
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

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User details fetched', { user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, avatar, bio, address, preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        avatar,
        bio,
        address,
        preferences,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Store ban reason in a custom field or mark user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        isBanned: true,
        banReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User banned successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        isBanned: false,
        banReason: null,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User unbanned successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'User deleted successfully', { userId: id });
  } catch (error) {
    next(error);
  }
};
