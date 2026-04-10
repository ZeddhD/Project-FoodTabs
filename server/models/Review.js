import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  // Multi-criteria ratings
  ratings: {
    taste: { type: Number, min: 1, max: 5 },
    hygiene: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    ambience: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  photos: [{ type: String }],
  isVerified: { type: Boolean, default: false }, // Verified via booking/payment
  verificationId: { type: String }, // Booking or Payment ID
  likeCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
