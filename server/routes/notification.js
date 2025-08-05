import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get notifications based on user role
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Build query based on user role
    let query = {};
    
    // If user is admin, get admin notifications, otherwise get 'all' notifications
    if (req.user.role === 'admin') {
      query = { for: { $in: ['admin', 'all'] } };
    } else {
      query = { for: 'all' };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    // Check if notification exists
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if user has access to this notification
    if (notification.for === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this notification' });
    }

    // Update notification to mark as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    let query = {};

    // If user is admin, mark admin notifications as read, otherwise mark 'all' notifications
    if (req.user.role === 'admin') {
      query = { for: { $in: ['admin', 'all'] } };
    } else {
      query = { for: 'all' };
    }

    // Update all matching notifications
    const result = await Notification.updateMany(query, { isRead: true });

    res.status(200).json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new notification (internal use only, not exposed as API)
export const addNotification = async (title, message, type, forAdmin = true) => {
  try {
    const newNotification = new Notification({
      title: title || type.toUpperCase(),
      message,
      type,
      isRead: false,
      for: forAdmin ? 'admin' : 'all'
    });

    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    console.error('Add notification error:', error);
    return null;
  }
};


export default router;