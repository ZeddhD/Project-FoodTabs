import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create a notification for a user.
 * Safe — never throws; notification failure must not break the main action.
 */
export async function createNotification(userId, { type, title, content, link, relatedId }) {
  try {
    await Notification.create({ userId, type, title, content, link, relatedId });
  } catch (err) {
    console.error('[notify] failed to create notification:', err.message);
  }
}

/**
 * Notify all admin users.
 */
export async function notifyAllAdmins({ type, title, content, link, relatedId }) {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map(admin =>
        Notification.create({ userId: admin._id, type, title, content, link, relatedId })
      )
    );
  } catch (err) {
    console.error('[notify] failed to notify admins:', err.message);
  }
}
