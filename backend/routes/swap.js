const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = require('../models/Events');
const SwapRequest = require('../models/SwapRequest');
const {
  protect
} = require('../middleware/auth');
router.get('/swap-requests/incoming', protect, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      recipient: req.user._id,
      status: 'PENDING'
    }).populate({
      path: 'requester',
      select: 'fullName email'
    }).populate({
      path: 'mySlot',
      select: 'title startTime endTime status'
    }).populate({
      path: 'theirSlot',
      select: 'title startTime endTime status'
    }).sort({
      createdAt: -1
    });
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error('Get incoming swap requests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch incoming swap requests'
    });
  }
});
router.get('/swap-requests/outgoing', protect, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      requester: req.user._id
    }).populate({
      path: 'recipient',
      select: 'fullName email'
    }).populate({
      path: 'mySlot',
      select: 'title startTime endTime status'
    }).populate({
      path: 'theirSlot',
      select: 'title startTime endTime status'
    }).sort({
      createdAt: -1
    });
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error('Get outgoing swap requests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch outgoing swap requests'
    });
  }
});
router.post('/swap-request', protect, async (req, res) => {
  const {
    mySlotId,
    theirSlotId
  } = req.body || {};
  if (!mySlotId || !theirSlotId) {
    return res.status(400).json({
      success: false,
      message: 'mySlotId and theirSlotId are required'
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);
    if (!mySlot || !theirSlot) {
      throw new Error('One or both slots were not found');
    }
    if (!mySlot.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not own the provided mySlotId'
      });
    }
    if (theirSlot.userId.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot request swap for your own slot'
      });
    }
    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({
        success: false,
        message: 'Both slots must be SWAPPABLE to request a swap'
      });
    }
    const swapReq = await SwapRequest.create([{
      requester: req.user._id,
      recipient: theirSlot.userId,
      mySlot: mySlot._id,
      theirSlot: theirSlot._id,
      status: 'PENDING'
    }], {
      session
    });
    await Event.findByIdAndUpdate(mySlot._id, {
      status: 'SWAP_PENDING'
    }, {
      session
    });
    await Event.findByIdAndUpdate(theirSlot._id, {
      status: 'SWAP_PENDING'
    }, {
      session
    });
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      success: true,
      message: 'Swap request created',
      request: swapReq[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create swap-request error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create swap request'
    });
  }
});
router.post('/swap-response/:requestId', protect, async (req, res) => {
  const {
    requestId
  } = req.params;
  const {
    accept
  } = req.body || {};
  if (typeof accept !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'accept (boolean) is required'
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const swap = await SwapRequest.findById(requestId).session(session);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }
    if (swap.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Swap request is not pending'
      });
    }
    if (!swap.recipient.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request'
      });
    }
    const mySlot = await Event.findById(swap.mySlot).session(session);
    const theirSlot = await Event.findById(swap.theirSlot).session(session);
    if (!mySlot || !theirSlot) {
      throw new Error('One or both slots were not found');
    }
    if (!accept) {
      swap.status = 'REJECTED';
      await swap.save({
        session
      });
      await Event.findByIdAndUpdate(mySlot._id, {
        status: 'SWAPPABLE'
      }, {
        session
      });
      await Event.findByIdAndUpdate(theirSlot._id, {
        status: 'SWAPPABLE'
      }, {
        session
      });
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({
        success: true,
        message: 'Swap request rejected',
        request: swap
      });
    }
    const ownerA = mySlot.userId;
    const ownerB = theirSlot.userId;
    if (mySlot.status !== 'SWAP_PENDING' || theirSlot.status !== 'SWAP_PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Slots are not in SWAP_PENDING state'
      });
    }
    await Event.findByIdAndUpdate(mySlot._id, {
      userId: ownerB,
      status: 'BUSY'
    }, {
      session
    });
    await Event.findByIdAndUpdate(theirSlot._id, {
      userId: ownerA,
      status: 'BUSY'
    }, {
      session
    });
    swap.status = 'ACCEPTED';
    await swap.save({
      session
    });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      success: true,
      message: 'Swap request accepted',
      request: swap
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Swap response error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to respond to swap request'
    });
  }
});
module.exports = router;