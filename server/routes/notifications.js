import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  clearAll,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware); // all notification routes require auth

router.get('/',              getNotifications);
router.patch('/read-all',    markAllRead);
router.delete('/clear-all',  clearAll);
router.patch('/:id/read',    markAsRead);
router.delete('/:id',        deleteNotification);

export default router;
