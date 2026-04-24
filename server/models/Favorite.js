import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  type: { type: String, enum: ['restaurant', 'dish'], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure unique favorite per user-restaurant/dish combination
favoriteSchema.index({ userId: 1, restaurantId: 1, type: 1 }, { sparse: true, unique: true });
favoriteSchema.index({ userId: 1, dishId: 1, type: 1 }, { sparse: true, unique: true });

export default mongoose.model('Favorite', favoriteSchema);
