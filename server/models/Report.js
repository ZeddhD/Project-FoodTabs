import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  type: { type: String, enum: ['post', 'comment', 'review'], required: true },
  reason: { type: String, required: true }, // Spam, Offensive, Inappropriate, etc.
  description: { type: String },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  adminNotes: { type: String },
  action: { type: String }, // Delete, Hide, Warn, Ban
  actionTakenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', reportSchema);
