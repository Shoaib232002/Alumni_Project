import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';
import Alumni from '../models/Alumni.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all feedback
router.get('/', async (req, res) => {
  try {
    // By default, only return approved feedback for non-admin users
    let query = {};

    // Check if request includes admin token
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      // For public access, only show approved feedback
      query.isApproved = true;
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID format' });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if feedback is approved or if user is admin
    const authHeader = req.headers['authorization'];
    if (!feedback.isApproved && !authHeader) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new feedback
router.post('/', async (req, res) => {
  try {
    const { alumniName, text, videoUrl, rating } = req.body;

    // Validate required fields
    if (!alumniName) {
      return res.status(400).json({ error: 'Alumni name is required' });
    }

    if (!text && !videoUrl) {
      return res.status(400).json({ error: 'Either text or video URL is required' });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      name: alumniName,
      message: text,
      videoUrl: videoUrl,
      rating,
      isApproved: false // Default to not approved
    });

    // If alumniId is provided, validate it exists
    if (req.body.alumniId) {
      // Validate ObjectId format
      if (mongoose.Types.ObjectId.isValid(req.body.alumniId)) {
        const alumni = await Alumni.findById(req.body.alumniId);
        if (alumni) {
          newFeedback.alumniId = req.body.alumniId;
        }
      }
    }

    // Save the feedback
    const savedFeedback = await newFeedback.save();

    // Add notification for admin
    await Notification.create({
      title: 'New Feedback',
      message: `New feedback received from ${alumniName}`,
      type: 'info',
      for: 'admin',
      isRead: false
    });

    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve feedback (admin only)
router.patch('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID format' });
    }

    // Find and update the feedback
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Add notification
    await Notification.create({
      title: 'Feedback Approved',
      message: `Feedback from ${feedback.name} has been approved`,
      type: 'success',
      for: 'all',
      isRead: false
    });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Approve feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete feedback (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID format' });
    }

    // Find and delete the feedback
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;