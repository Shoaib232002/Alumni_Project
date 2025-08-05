import mongoose from 'mongoose';

const collegeInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  foundedYear: {
    type: Number,
    required: true
  },
  totalAlumni: {
    type: Number,
    default: 0
  },
  totalFundsRaised: {
    type: Number,
    default: 0
  },
  logo: {
    type: String,
    trim: true
  },
  socialLinks: {
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    youtube: { type: String, trim: true }
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
collegeInfoSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

const CollegeInfo = mongoose.model('CollegeInfo', collegeInfoSchema);

export default CollegeInfo;