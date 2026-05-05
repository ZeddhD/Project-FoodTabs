import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // booking, review, comment, reply, etc.
  title: { type: String, required: true },
  content: { type: String },
  link: { type: String }, // URL to navigate to
  isRead: { type: Boolean, default: false },
  relatedId: { type: String }, // ID of related item (booking, post, etc.)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);
