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
  dishReviews: [{
    dishId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    rating:  { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 300 }
  }],
  photos: [{ type: String }],
  verifiedPurchase: { type: Boolean, default: false }, // true when a completed Booking/Reservation references this review
  isVerified: { type: Boolean, default: false }, // legacy alias kept for backward compat
  verificationId: { type: String }, // Booking or Payment ID
  ownerResponse:   { type: String, default: null },
  ownerResponseAt: { type: Date,   default: null },
  likeCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  isReported: { type: Boolean, default: false },
  isFlagged: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  verifiedVisit: { type: Boolean, default: false }, // canonical verified-visit flag
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
