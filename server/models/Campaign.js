import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: Number,
    required: true,
    min: 0
  },
  raised: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
campaignSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Create indexes for common queries
campaignSchema.index({ isActive: 1 });
campaignSchema.index({ endDate: 1 });
campaignSchema.index({ createdAt: -1 });

// Virtual for calculating progress percentage
campaignSchema.virtual('progress').get(function() {
  return this.goal > 0 ? Math.min(Math.round((this.raised / this.goal) * 100), 100) : 0;
});

// Virtual for checking if campaign is expired
campaignSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Configure virtuals to be included in JSON output
campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;