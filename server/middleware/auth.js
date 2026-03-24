import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Enforce isBanned: reject requests from users banned after their token was issued
    const user = await User.findById(decoded.userId).select('isBanned banReason').lean();
    if (user?.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended. Reason: ${user.banReason || 'Violation of platform policies'}`
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Aliases used by route files that follow the protect/roleCheck naming convention
export const protect = authMiddleware;

// Role-based access control
export const roleCheck = (...allowedRoles) => roleMiddleware(...allowedRoles);

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - insufficient permissions' 
      });
    }

    next();
  };
};
