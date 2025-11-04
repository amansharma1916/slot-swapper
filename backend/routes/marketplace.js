const express = require('express');
const router = express.Router();
const Event = require('../models/Events');
const {
  protect
} = require('../middleware/auth');
router.get('/swappable-slots', protect, async (req, res) => {
  try {
    const {
      startDate,
      endDate
    } = req.query;
    const query = {
      status: 'SWAPPABLE',
      userId: {
        $ne: req.user._id
      }
    };
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    const events = await Event.find(query).sort({
      startTime: 1
    });
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swappable slots',
      error: error.message
    });
  }
});
module.exports = router;