import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import dishRoutes from './routes/dishes.js';
import reviewRoutes from './routes/reviews.js';
import favoriteRoutes from './routes/favorites.js';
import forumRoutes from './routes/forum.js';
import voteRoutes from './routes/votes.js';
import reportRoutes from './routes/reports.js';
import bookingRoutes from './routes/bookings.js';
import eventBookingRoutes from './routes/eventBookings.js';
import savedOrderRoutes from './routes/savedOrders.js';
import verificationRoutes from './routes/verificationRequests.js';
import recommendationRoutes from './routes/recommendations.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow localhost on any port and the specified CLIENT_URL
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      process.env.CLIENT_URL
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:restaurantId/dishes', dishRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/event-bookings', eventBookingRoutes);
app.use('/api/saved-orders', savedOrderRoutes);
app.use('/api/verification-requests', verificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin/users', userRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
