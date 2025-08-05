import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_portal';

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Create mock data for development if needed
async function createInitialData() {
  // Check if we need to create initial data
  const needsInitialData = await mongoose.connection.db.listCollections().toArray()
    .then(collections => collections.length === 0)
    .catch(() => true);

  if (needsInitialData) {
    console.log('Creating initial data in MongoDB...');
    
    // Import models
    const User = await import('../models/User.js').then(module => module.default);
    const Alumni = await import('../models/Alumni.js').then(module => module.default);
    const Feedback = await import('../models/Feedback.js').then(module => module.default);
    const Campaign = await import('../models/Campaign.js').then(module => module.default);
    const Donation = await import('../models/Donation.js').then(module => module.default);
    const Notification = await import('../models/Notification.js').then(module => module.default);
    const CollegeInfo = await import('../models/CollegeInfo.js').then(module => module.default);
    
    // Create initial college info
    await CollegeInfo.create({
      name: 'Demo College',
      address: '123 Education St, Knowledge City',
      phone: '+1-234-567-8900',
      email: 'info@democollege.edu',
      website: 'https://www.democollege.edu',
      description: 'A leading institution dedicated to excellence in education.',
      foundedYear: 1950,
      totalAlumni: 0,
      totalFundsRaised: 0
    });
    
    console.log('Initial data created successfully');
  }
}

export { connectToDatabase, createInitialData };
export default mongoose;