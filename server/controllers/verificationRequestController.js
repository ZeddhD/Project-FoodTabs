import VerificationRequest from '../models/VerificationRequest.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { sendResponse, sendError, getPaginationParams } from '../utils/helpers.js';
import { createNotification, notifyAllAdmins } from '../utils/notify.js';

// Create verification request (Restaurant Owner)
export const createVerificationRequest = async (req, res, next) => {
  try {
    const { restaurantId, documents } = req.body;

    if (!restaurantId) {
      return sendError(res, 400, 'RestaurantId is required');
    }

    // Verify restaurant exists and user is owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== req.user.userId) {
      return sendError(res, 403, 'Only restaurant owner can create verification request');
    }

    // Check if verification already exists and is pending
    const existingRequest = await VerificationRequest.findOne({
      restaurantId,
      status: 'pending'
    });

    if (existingRequest) {
      return sendError(res, 400, 'Verification request already pending for this restaurant');
    }

    const verificationRequest = new VerificationRequest({
      ownerId: req.user.userId,
      restaurantId,
      documents: documents || [],
      status: 'pending'
    });

    await verificationRequest.save();
    await verificationRequest.populate('restaurantId', 'name email');
    await verificationRequest.populate('ownerId', 'name email');

    // Notify all admins of the new verification request
    await notifyAllAdmins({
      type: 'verification',
      title: `Vendor application: ${restaurant.name}`,
      content: `${restaurant.name} has submitted documents for verification.`,
      link: '/admin/verification',
      relatedId: verificationRequest._id.toString(),
    });

    sendResponse(res, 201, true, 'Verification request created', verificationRequest);
  } catch (error) {
    next(error);
  }
};

// Get verification request for restaurant owner
export const getVerificationRequest = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    // Verify restaurant exists and user is owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied');
    }

    const verificationRequest = await VerificationRequest.findOne({ restaurantId })
      .populate('restaurantId', 'name email address')
      .populate('ownerId', 'name email phone');

    if (!verificationRequest) {
      return sendResponse(res, 200, true, 'No verification request found', null);
    }

    sendResponse(res, 200, true, 'Verification request fetched', verificationRequest);
  } catch (error) {
    next(error);
  }
};

// Get all pending verification requests (Admin only)
export const getPendingVerificationRequests = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can view verification requests');
    }

    const { page, limit } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    const total = await VerificationRequest.countDocuments({ status: 'pending' });
    const requests = await VerificationRequest.find({ status: 'pending' })
      .sort({ submissionDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name email address cuisineType')
      .populate('ownerId', 'name email phone');

    sendResponse(res, 200, true, 'Pending verification requests fetched', {
      requests,
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

// Get all verification requests (Admin only)
export const getAllVerificationRequests = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can view verification requests');
    }

    const { page, limit, status } = req.query;
    const { skip, limitNum } = getPaginationParams(page, limit);

    let filter = {};
    if (status) filter.status = status;

    const total = await VerificationRequest.countDocuments(filter);
    const requests = await VerificationRequest.find(filter)
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name email address cuisineType')
      .populate('ownerId', 'name email phone');

    sendResponse(res, 200, true, 'Verification requests fetched', {
      requests,
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

// Approve verification request (Admin only)
export const approveVerificationRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can approve verification');
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const verificationRequest = await VerificationRequest.findById(id);
    if (!verificationRequest) {
      return sendError(res, 404, 'Verification request not found');
    }

    if (verificationRequest.status !== 'pending') {
      return sendError(res, 400, `Cannot approve ${verificationRequest.status} request`);
    }

    // Update verification request
    const updated = await VerificationRequest.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvalDate: Date.now(),
        adminNotes,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('restaurantId', 'name').populate('ownerId', 'name email');

    // Update restaurant verification status
    await Restaurant.findByIdAndUpdate(
      verificationRequest.restaurantId,
      { isVerified: true, verificationDate: Date.now() }
    );

    // Notify the owner
    await createNotification(verificationRequest.ownerId, {
      type: 'verification_approved',
      title: 'Verification approved!',
      content: `${updated.restaurantId?.name} is now a verified restaurant on FoodTabs.`,
      link: '/owner/dashboard',
      relatedId: verificationRequest._id.toString(),
    });

    sendResponse(res, 200, true, 'Verification approved', updated);
  } catch (error) {
    next(error);
  }
};

// Reject verification request (Admin only)
export const rejectVerificationRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Only admins can reject verification');
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return sendError(res, 400, 'Rejection reason is required');
    }

    const verificationRequest = await VerificationRequest.findById(id);
    if (!verificationRequest) {
      return sendError(res, 404, 'Verification request not found');
    }

    if (verificationRequest.status !== 'pending') {
      return sendError(res, 400, `Cannot reject ${verificationRequest.status} request`);
    }

    const updated = await VerificationRequest.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('restaurantId', 'name').populate('ownerId', 'name email');

    // Notify the owner
    await createNotification(verificationRequest.ownerId, {
      type: 'verification_rejected',
      title: 'Verification request declined',
      content: `Reason: ${rejectionReason}`,
      link: '/owner/dashboard',
      relatedId: verificationRequest._id.toString(),
    });

    sendResponse(res, 200, true, 'Verification rejected', updated);
  } catch (error) {
    next(error);
  }
};

// Resubmit verification request (Restaurant Owner)
export const resubmitVerificationRequest = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { documents, adminNotes } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendError(res, 404, 'Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== req.user.userId) {
      return sendError(res, 403, 'Only restaurant owner can resubmit');
    }

    const verificationRequest = await VerificationRequest.findOne({ restaurantId });
    if (!verificationRequest) {
      return sendError(res, 404, 'No verification request found for this restaurant');
    }

    if (verificationRequest.status !== 'rejected') {
      return sendError(res, 400, 'Can only resubmit rejected requests');
    }

    const updated = await VerificationRequest.findByIdAndUpdate(
      verificationRequest._id,
      {
        status: 'pending',
        documents: documents || verificationRequest.documents,
        adminNotes: '',
        submissionDate: Date.now(),
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('restaurantId', 'name').populate('ownerId', 'name email');

    sendResponse(res, 200, true, 'Verification request resubmitted', updated);
  } catch (error) {
    next(error);
  }
};
