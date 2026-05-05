import mongoose from 'mongoose';

// Public events hosted by restaurants — customers buy seats
const eventSchema = new mongoose.Schema({
  restaurantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:          { type: String, required: true },
  description:   { type: String },
  eventDate:     { type: Date, required: true },
  eventTime:     { type: String, required: true }, // HH:MM format
  price:         { type: Number, required: true }, // per person in BDT
  capacity:      { type: Number, required: true },
  seatsBooked:   { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
  createdAt:     { type: Date, default: Date.now }
});

export default mongoose.model('Event', eventSchema);
