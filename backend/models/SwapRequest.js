const mongoose = require('mongoose');
const swapRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  theirSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    required: true
  }
}, {
  timestamps: true
});
swapRequestSchema.index({
  requester: 1,
  createdAt: -1
});
swapRequestSchema.index({
  recipient: 1,
  status: 1,
  createdAt: -1
});
swapRequestSchema.index({
  mySlot: 1
});
swapRequestSchema.index({
  theirSlot: 1
});
const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
module.exports = SwapRequest;