const express = require('express');
const router = express.Router();
const Event = require('../models/Events');
const {
  protect
} = require('../middleware/auth');
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      startTime,
      endTime,
      status,
      description
    } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, start time, and end time'
      });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    const conflictingEvents = await Event.find({
      userId: req.user._id,
      $or: [{
        startTime: {
          $lt: end
        },
        endTime: {
          $gt: start
        }
      }]
    });
    if (conflictingEvents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This event conflicts with an existing event',
        conflicts: conflictingEvents
      });
    }
    const event = await Event.create({
      title,
      startTime: start,
      endTime: end,
      status: status || 'BUSY',
      userId: req.user._id,
      description
    });
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});
router.get('/', protect, async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate
    } = req.query;
    const query = {
      userId: req.user._id
    };
    if (status) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
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
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this event'
      });
    }
    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});
router.put('/:id', protect, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    const {
      title,
      startTime,
      endTime,
      status,
      description
    } = req.body;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
      const conflictingEvents = await Event.find({
        userId: req.user._id,
        _id: {
          $ne: req.params.id
        },
        $or: [{
          startTime: {
            $lt: end
          },
          endTime: {
            $gt: start
          }
        }]
      });
      if (conflictingEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Updated times conflict with an existing event',
          conflicts: conflictingEvents
        });
      }
    }
    event = await Event.findByIdAndUpdate(req.params.id, {
      title,
      startTime,
      endTime,
      status,
      description
    }, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const {
      status
    } = req.body;
    if (!status || !['BUSY', 'SWAPPABLE', 'SWAP_PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be BUSY, SWAPPABLE, or SWAP_PENDING'
      });
    }
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    event.status = status;
    await event.save();
    res.status(200).json({
      success: true,
      message: 'Event status updated successfully',
      event
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event status',
      error: error.message
    });
  }
});
router.patch('/:id', protect, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    const allowed = ['title', 'description', 'status', 'startTime', 'endTime'];
    const updateFields = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateFields[key] = req.body[key];
      }
    }
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }
    if (typeof updateFields.status !== 'undefined') {
      if (!['BUSY', 'SWAPPABLE', 'SWAP_PENDING'].includes(updateFields.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be BUSY, SWAPPABLE, or SWAP_PENDING'
        });
      }
    }
    const hasStart = typeof updateFields.startTime !== 'undefined';
    const hasEnd = typeof updateFields.endTime !== 'undefined';
    let startCandidate = event.startTime;
    let endCandidate = event.endTime;
    if (hasStart) {
      const parsed = new Date(updateFields.startTime);
      if (isNaN(parsed.getTime())) return res.status(400).json({
        success: false,
        message: 'Invalid start time format'
      });
      startCandidate = parsed;
      updateFields.startTime = parsed;
    }
    if (hasEnd) {
      const parsed = new Date(updateFields.endTime);
      if (isNaN(parsed.getTime())) return res.status(400).json({
        success: false,
        message: 'Invalid end time format'
      });
      endCandidate = parsed;
      updateFields.endTime = parsed;
    }
    if (hasStart || hasEnd) {
      if (endCandidate <= startCandidate) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
      const conflictingEvents = await Event.find({
        userId: req.user._id,
        _id: {
          $ne: req.params.id
        },
        startTime: {
          $lt: endCandidate
        },
        endTime: {
          $gt: startCandidate
        }
      });
      if (conflictingEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Updated times conflict with an existing event',
          conflicts: conflictingEvents
        });
      }
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, {
      $set: updateFields
    }, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updated
    });
  } catch (error) {
    console.error('Partial update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    await event.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});
module.exports = router;