import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  type: { type: String, enum: ['post', 'comment', 'review'], required: true },
  voteType: { type: String, enum: ['upvote', 'downvote'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one vote per user per item
voteSchema.index({ userId: 1, postId: 1 }, { sparse: true, unique: true });
voteSchema.index({ userId: 1, commentId: 1 }, { sparse: true, unique: true });
voteSchema.index({ userId: 1, reviewId: 1 }, { sparse: true, unique: true });

export default mongoose.model('Vote', voteSchema);
