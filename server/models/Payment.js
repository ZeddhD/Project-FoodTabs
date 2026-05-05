import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  eventBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventBooking' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  stripePaymentIntentId: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'succeeded', 'failed'], default: 'pending' },
  paymentMethod: { type: String }, // card, etc.
  metadata: {} , // Any additional data
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
