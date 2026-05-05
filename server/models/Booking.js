import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  bookingDate: { type: Date, required: true },
  time: { type: String, required: true }, // HH:MM format
  partySize: { type: Number, required: true, min: 1 },
  tablePreference: { type: String }, // Window, Corner, etc.
  specialRequests: { type: String },
  guestName: { type: String },
  guestEmail: { type: String },
  guestPhone: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  confirmationCode: { type: String, unique: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate confirmation code before saving
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);
