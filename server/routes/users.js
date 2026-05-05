import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  banUser,
  unbanUser,
  deleteUser,
  getAdminStats,
} from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.get('/stats', authMiddleware, roleMiddleware('admin'), getAdminStats);
router.get('/', authMiddleware, roleMiddleware('admin'), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getUserById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.post('/:id/ban', authMiddleware, roleMiddleware('admin'), banUser);
router.post('/:id/unban', authMiddleware, roleMiddleware('admin'), unbanUser);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
