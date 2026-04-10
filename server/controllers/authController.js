import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendResponse, sendError } from '../utils/helpers.js';
import { validationResult } from 'express-validator';

export const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation Error', errors.array());
    }

    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'customer'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    sendResponse(res, 201, true, 'Registration successful', {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, 'Validation Error', errors.array());
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    sendResponse(res, 200, true, 'Login successful', {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendResponse(res, 200, true, 'Profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, address, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 
        name, 
        phone, 
        bio, 
        address, 
        preferences,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');

    sendResponse(res, 200, true, 'Profile updated', user);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // Logout is handled on frontend by removing token
  sendResponse(res, 200, true, 'Logout successful');
};
