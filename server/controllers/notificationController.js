import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../utils/helpers.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    sendResponse(res, 200, true, 'Notifications fetched', notifications);
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true }
    );
    sendResponse(res, 200, true, 'Marked as read');
  } catch (error) { next(error); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
    sendResponse(res, 200, true, 'All marked as read');
  } catch (error) { next(error); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    sendResponse(res, 200, true, 'Notification deleted');
  } catch (error) { next(error); }
};

export const clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user.userId });
    sendResponse(res, 200, true, 'All notifications cleared');
  } catch (error) { next(error); }
};
