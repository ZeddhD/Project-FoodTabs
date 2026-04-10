import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For nested replies
  likeCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for nested comments
commentSchema.index({ postId: 1, parentCommentId: 1 });

export default mongoose.model('Comment', commentSchema);
