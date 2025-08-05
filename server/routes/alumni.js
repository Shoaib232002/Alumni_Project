import express from 'express';
import mongoose from 'mongoose';
import Alumni from '../models/Alumni.js';
import Notification from '../models/Notification.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all alumni
router.get('/', async (req, res) => {
  try {
    const alumni = await Alumni.find({})
      .sort({ createdAt: -1 });

    res.status(200).json(alumni);
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get alumni by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    const alumni = await Alumni.findById(id);

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    res.status(200).json(alumni);
  } catch (error) {
    console.error('Get alumni by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get alumni by batch
router.get('/batch/:batch', async (req, res) => {
  try {
    const { batch } = req.params;
    
    // Convert batch to number
    const batchNumber = parseInt(batch, 10);
    if (isNaN(batchNumber)) {
      return res.status(400).json({ error: 'Batch must be a valid number' });
    }

    const alumni = await Alumni.find({ batch: batchNumber })
      .sort({ name: 1 });

    res.status(200).json(alumni);
  } catch (error) {
    console.error('Get alumni by batch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new alumni
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newAlumni = req.body;

    // Validate required fields
    if (!newAlumni.name || !newAlumni.email || !newAlumni.batch || !newAlumni.degree) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if alumni with this email already exists
    const existingAlumni = await Alumni.findOne({ email: newAlumni.email });

    if (existingAlumni) {
      return res.status(400).json({ error: 'Alumni with this email already exists' });
    }

    // Create new alumni document
    const alumniToAdd = new Alumni({
      ...newAlumni,
      isVerified: req.user.role === 'admin', // Auto-verify if admin is adding
      // MongoDB will automatically set createdAt and updatedAt
    });

    // Save to database
    const savedAlumni = await alumniToAdd.save();

    // Add notification
    await Notification.create({
      title: 'New Alumni Added',
      message: `New alumni ${savedAlumni.name} added`,
      type: 'info',
      forAdmin: true
    });

    res.status(201).json(savedAlumni);
  } catch (error) {
    console.error('Add alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update alumni
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    // Check if alumni exists
    const existingAlumni = await Alumni.findById(id);

    if (!existingAlumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Only admin or the alumni themselves can update
    if (req.user.role !== 'admin' && req.user.email !== existingAlumni.email) {
      return res.status(403).json({ error: 'Not authorized to update this alumni' });
    }

    // Update the alumni document
    // findByIdAndUpdate will automatically update the updatedAt field
    const updatedAlumni = await Alumni.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAlumni);
  } catch (error) {
    console.error('Update alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete alumni (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    // Check if alumni exists and delete in one operation
    const deletedAlumni = await Alumni.findByIdAndDelete(id);

    if (!deletedAlumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Add notification about deletion
    await Notification.create({
      title: 'Alumni Deleted',
      message: `Alumni ${deletedAlumni.name} has been deleted`,
      type: 'info',
      forAdmin: true
    });

    res.status(200).json({ message: 'Alumni deleted successfully' });
  } catch (error) {
    console.error('Delete alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify alumni (admin only)
router.patch('/:id/verify', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid alumni ID format' });
    }

    const alumni = await Alumni.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!alumni) {
      return res.status(404).json({ error: 'Alumni not found' });
    }

    // Add notification about verification
    await Notification.create({
      title: 'Alumni Verified',
      message: `Alumni ${alumni.name} has been verified`,
      type: 'success',
      forAdmin: false
    });

    res.status(200).json(alumni);
  } catch (error) {
    console.error('Verify alumni error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;