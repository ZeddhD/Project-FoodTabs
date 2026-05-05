import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  documents: [{ type: String }], // URLs to uploaded documents
  submissionDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  adminNotes: { type: String },
  rejectionReason: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('VerificationRequest', verificationRequestSchema);
