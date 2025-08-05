import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import alumniRoutes from './routes/alumni.js';
import feedbackRoutes from './routes/feedback.js';
import fundraisingRoutes from './routes/fundraising.js';
import donationRoutes from './routes/donation.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notification.js';
import collegeInfoRoutes from './routes/collegeInfo.js';
import scraperRoutes from './routes/scraper.js';

// Import MongoDB connection
import mongoose, { connectToDatabase, createInitialData } from './database/mongodb.js';

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable. Please check your .env file.');
  process.exit(1);
}

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
  console.warn('Missing MONGODB_URI environment variable. Using default connection string.');
}

// Connect to MongoDB
connectToDatabase().then(connected => {
  if (connected) {
    // Create initial data if database is empty
    createInitialData().catch(err => {
      console.error('Error creating initial data:', err);
    });
  } else {
    console.warn('Failed to connect to MongoDB. Some features may not work properly.');
  }
});



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alumni', alumniRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/fundraising', fundraisingRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/college-info', collegeInfoRoutes);
app.use('/api/scraper', scraperRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});