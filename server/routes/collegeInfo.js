import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import CollegeInfo from '../models/CollegeInfo.js';

const router = express.Router();

// Get college info
router.get('/', async (req, res) => {
  try {
    const collegeInfo = await CollegeInfo.findOne({})
      .sort({ updatedAt: -1 });

    if (!collegeInfo) {
      return res.status(404).json({ error: 'College information not found' });
    }

    res.status(200).json(collegeInfo);
  } catch (error) {
    console.error('Get college info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update college info (admin only)
router.put('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const updates = req.body;

    // Validate required fields
    if (!updates.name || !updates.address || !updates.foundedYear || !updates.website) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Get current college info
    const currentInfo = await CollegeInfo.findOne({});

    let result;

    if (currentInfo) {
      // Update existing record
      // Convert field names to match MongoDB schema
      if (updates.location) updates.address = updates.location;
      if (updates.established) updates.foundedYear = updates.established;
      if (updates.social_links) updates.socialLinks = updates.social_links;
      if (updates.total_alumni) updates.totalAlumni = updates.total_alumni;
      if (updates.total_funds_raised) updates.totalFundsRaised = updates.total_funds_raised;
      
      // Remove old field names to avoid duplication
      delete updates.location;
      delete updates.established;
      delete updates.social_links;
      delete updates.total_alumni;
      delete updates.total_funds_raised;
      delete updates.updated_at;

      result = await CollegeInfo.findByIdAndUpdate(
        currentInfo._id,
        updates,
        { new: true }
      );
    } else {
      // Insert new record if none exists
      // Convert field names to match MongoDB schema
      const newCollegeInfo = new CollegeInfo({
        name: updates.name,
        address: updates.location || updates.address,
        phone: updates.phone,
        email: updates.email,
        website: updates.website,
        description: updates.description,
        foundedYear: updates.established || updates.foundedYear,
        totalAlumni: updates.total_alumni || updates.totalAlumni || 0,
        totalFundsRaised: updates.total_funds_raised || updates.totalFundsRaised || 0,
        logo: updates.logo,
        socialLinks: updates.social_links || updates.socialLinks || {}
      });

      result = await newCollegeInfo.save();
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Update college info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;