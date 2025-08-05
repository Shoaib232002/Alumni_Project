import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  batch: {
    type: Number,
    required: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: { type: String, trim: true },
    naukri: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on update
alumniSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Create indexes for common queries
alumniSchema.index({ batch: 1 });
alumniSchema.index({ isVerified: 1 });

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;