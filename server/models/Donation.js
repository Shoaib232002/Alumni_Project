import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
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
donationSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Create indexes for common queries
donationSchema.index({ campaignId: 1 });
donationSchema.index({ donorEmail: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ paymentStatus: 1 });

// Post-save hook to update campaign raised amount
donationSchema.post('save', async function(doc) {
  if (doc.paymentStatus === 'completed') {
    try {
      const Campaign = await import('./Campaign.js').then(module => module.default);
      await Campaign.findByIdAndUpdate(
        doc.campaignId,
        { $inc: { raised: doc.amount } }
      );
    } catch (error) {
      console.error('Error updating campaign raised amount:', error);
    }
  }
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;