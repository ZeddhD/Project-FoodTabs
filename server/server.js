import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Ensure uploads directory exists for multer
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

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
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);

    // In development allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // In production allow only the configured client URL
    const clientUrl = process.env.CLIENT_URL;
    if (clientUrl && origin === clientUrl) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:restaurantId/dishes', dishRoutes);
app.use('/api/dishes', dishRoutes);
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
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

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
