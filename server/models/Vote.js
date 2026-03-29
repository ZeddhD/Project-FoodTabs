import mongoose from 'mongoose';

// Unified vote model — works for Posts, Comments, and Reviews.
// parentType discriminates which collection parentId points to.
const voteSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  parentId:   { type: mongoose.Schema.Types.ObjectId,               required: true },
  parentType: { type: String, enum: ['Post', 'Comment', 'Review'],  required: true },
  value:      { type: Number, enum: [1, -1],                        required: true }, // 1 = upvote, -1 = downvote
  createdAt:  { type: Date, default: Date.now }
});

// One vote per user per target — prevents double-voting
voteSchema.index({ userId: 1, parentId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
