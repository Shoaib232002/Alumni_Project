import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: {
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  isApproved: {
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
feedbackSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Create indexes for common queries
feedbackSchema.index({ isApproved: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;