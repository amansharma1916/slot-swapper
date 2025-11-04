const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function (value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
      message: '{VALUE} is not a valid status'
    },
    default: 'BUSY',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});
eventSchema.index({
  userId: 1,
  startTime: 1
});
eventSchema.index({
  status: 1
});
eventSchema.virtual('duration').get(function () {
  return this.endTime - this.startTime;
});
eventSchema.methods.isPast = function () {
  return this.endTime < new Date();
};
eventSchema.methods.isOngoing = function () {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now;
};
eventSchema.methods.conflictsWith = function (startTime, endTime) {
  return startTime >= this.startTime && startTime < this.endTime || endTime > this.startTime && endTime <= this.endTime || startTime <= this.startTime && endTime >= this.endTime;
};
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;