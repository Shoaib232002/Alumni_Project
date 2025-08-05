import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all fundraising campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active fundraising campaigns
router.get('/active', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Get active campaigns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get fundraising campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Get campaign by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new fundraising campaign (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, goal, startDate, endDate, image } = req.body;

    // Validate required fields
    if (!title || !description || !goal || !startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Create new campaign
    const newCampaign = new Campaign({
      title,
      description,
      goal,
      raised: 0, // Initial raised amount is 0
      startDate,
      endDate,
      image,
      isActive: true, // Default to active
      creator: req.user.id
    });

    // Save the campaign
    const savedCampaign = await newCampaign.save();

    // Add notification
    await Notification.create({
      title: 'New Campaign',
      message: `New fundraising campaign created: ${title}`,
      type: 'info',
      for: 'all',
      isRead: false
    });

    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error('Add campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update fundraising campaign (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    // Check if campaign exists
    const existingCampaign = await Campaign.findById(id);

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Update the campaign
    // Convert field names to match MongoDB schema
    if (updates.startDate) updates.startDate = updates.startDate;
    if (updates.endDate) updates.endDate = updates.endDate;
    if (updates.isActive !== undefined) updates.isActive = updates.isActive;

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete fundraising campaign (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    // Check if campaign exists
    const existingCampaign = await Campaign.findById(id);

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check if there are donations for this campaign
    const donations = await Donation.findOne({ campaignId: id }).limit(1);

    if (donations) {
      return res.status(400).json({ 
        error: 'Cannot delete campaign with existing donations. Consider marking it as inactive instead.' 
      });
    }

    // Delete the campaign
    await Campaign.findByIdAndDelete(id);

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle campaign active status (admin only)
router.patch('/:id/toggle-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid campaign ID format' });
    }

    // Get current status
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Toggle status
    campaign.isActive = !campaign.isActive;
    await campaign.save();

    const statusMessage = campaign.isActive ? 'activated' : 'deactivated';

    // Add notification
    await Notification.create({
      title: 'Campaign Status Changed',
      message: `Fundraising campaign "${campaign.title}" has been ${statusMessage}`,
      type: 'info',
      for: 'admin',
      isRead: false
    });

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Toggle campaign status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;