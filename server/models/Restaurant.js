import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cuisineTypes: [String],
  address: { type: String, required: true },
  city: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  images: [{ type: String }],
  coverImage: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  averagePrice: { type: Number },
  priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'] },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  bookingDeposit: { type: Number, default: 0, min: 0 }, // BDT deposit required to confirm a booking
  viewsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  criteriaAverages: {
    taste:    { type: Number, default: 0 },
    hygiene:  { type: Number, default: 0 },
    service:  { type: Number, default: 0 },
    ambience: { type: Number, default: 0 },
    value:    { type: Number, default: 0 },
  },
  verifiedReviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Restaurant', restaurantSchema);
