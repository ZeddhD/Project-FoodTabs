import mongoose from 'mongoose';

const savedOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true }, // e.g., "My Favorite Order"
  items: [{
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number } // Price at time of saving
  }],
  totalPrice: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SavedOrder', savedOrderSchema);
