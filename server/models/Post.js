import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String }, // Food, Restaurant, Event, General, etc.
  tags: [String],
  linkedRestaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  linkedDishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  viewsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for searching and filtering
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Post', postSchema);
