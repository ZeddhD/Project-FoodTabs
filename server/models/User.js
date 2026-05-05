import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  bio: { type: String },
  address: { type: String },
  role: { 
    type: String, 
    enum: ['customer', 'owner', 'admin'], 
    default: 'customer' 
  },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  preferences: {
    cuisines: [String],
    priceRange: String,
    notifications: { type: Boolean, default: true }
  },
  isVerified: { type: Boolean, default: false },
  warningCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
