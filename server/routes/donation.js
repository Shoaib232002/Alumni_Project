import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get donations by campaign ID
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    const donations = await Donation.find({ campaignId })
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get donations by alumni ID
router.get('/alumni/:alumniId', authenticateToken, async (req, res) => {
  try {
    const { alumniId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(alumniId)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    // Only admin or the alumni themselves can view their donations
    if (req.user.role !== 'admin' && req.user.id !== alumniId) {
      return res.status(403).json({ error: 'Not authorized to view these donations' });
    }

    const donations = await Donation.find({ alumniId })
      .sort({ createdAt: -1 })
      .populate('campaignId', 'title');

    res.status(200).json(donations);
  } catch (error) {
    console.error('Get alumni donations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new donation
router.post('/', async (req, res) => {
  try {
    const { campaignId, alumniId, amount, name, email, message, isAnonymous } = req.body;

    // Validate required fields
    if (!campaignId || !amount || !name || !email) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Validate ObjectId format for campaignId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    // Check if campaign exists and is active
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (!campaign.isActive) {
      return res.status(400).json({ error: 'This campaign is no longer active' });
    }

    // Validate alumniId if provided
    if (alumniId && !mongoose.Types.ObjectId.isValid(alumniId)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    // Create new donation
    const newDonation = new Donation({
      campaignId,
      alumniId: alumniId || null,
      amount,
      donorName: name,
      donorEmail: email,
      message,
      isAnonymous: isAnonymous || false,
      status: 'completed', // Assuming payment is completed immediately
      paymentMethod: 'direct' // Default payment method
    });

    // Save the donation
    const savedDonation = await newDonation.save();

    // Update campaign raised amount (this is now handled by the post-save hook in the Donation model)
    // but we'll fetch the updated campaign for notification purposes
    const updatedCampaign = await Campaign.findById(campaignId);

    // Add notification
    const donorName = isAnonymous ? 'Anonymous donor' : name;
    await Notification.create({
      title: 'New Donation',
      message: `New donation of $${amount} received from ${donorName} for campaign "${campaign.title}"`,
      type: 'success',
      for: 'admin',
      isRead: false
    });

    // Check if goal reached
    if (updatedCampaign.raised >= updatedCampaign.goal) {
      await Notification.create({
        title: 'Campaign Goal Reached',
        message: `Fundraising goal reached for campaign "${campaign.title}"!`,
        type: 'success',
        for: 'all',
        isRead: false
      });
    }

    res.status(201).json(savedDonation);
  } catch (error) {
    console.error('Add donation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get donation statistics (admin only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get total donations and calculate total amount
    const totalData = await Donation.find({}, 'amount');
    const totalAmount = totalData.reduce((sum, donation) => sum + donation.amount, 0);

    // Get recent donations
    const recentDonations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('campaignId', 'title');

    // Get campaign statistics
    const campaigns = await Campaign.find({}, 'title goal raised')
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalDonations: totalData.length,
      totalAmount,
      recentDonations,
      campaigns
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;