import mongoose from 'mongoose';

// Unified comment model — supports both Post comments and Review comments.
// parentType discriminates which collection parentId points to.
const commentSchema = new mongoose.Schema({
  parentId:       { type: mongoose.Schema.Types.ObjectId,           required: true },
  parentType:     { type: String, enum: ['Post', 'Review'],         required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:        { type: String, required: true },
  parentCommentId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // nested replies
  likeCount:      { type: Number, default: 0 },
  reportCount:    { type: Number, default: 0 },
  isReported:     { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now }
});

commentSchema.index({ parentId: 1, parentType: 1, parentCommentId: 1 });

export default mongoose.model('Comment', commentSchema);
