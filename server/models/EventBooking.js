import mongoose from 'mongoose';

const eventBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  eventName: { type: String, required: true },
  eventType: { type: String }, // Birthday, Wedding, Corporate, etc.
  eventDate: { type: Date, required: true },
  eventTime: { type: String, required: true }, // HH:MM format
  duration: { type: Number, required: true }, // Minutes
  guestCount: { type: Number, required: true },
  estimatedBudget: { type: Number },
  description: { type: String },
  specialRequirements: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  confirmationCode: { type: String, unique: true },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate confirmation code before saving
eventBookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = 'EV' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model('EventBooking', eventBookingSchema);
