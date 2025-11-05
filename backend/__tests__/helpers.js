const User = require('../models/RegisterUser');
const Event = require('../models/Events');
const SwapRequest = require('../models/SwapRequest');
const {
    generateToken
} = require('../utils/jwt');
const createTestUser = async (overrides = {}) => {
    const defaults = {
        fullName: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };
    const userData = {
        ...defaults,
        ...overrides
    };
    const user = await User.create(userData);
    const token = generateToken(user._id);
    return {
        user,
        token
    };
};
const createTestUsers = async (count = 2) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const {
            user,
            token
        } = await createTestUser({
            fullName: `Test User ${i + 1}`,
            email: `testuser${i + 1}${Date.now()}@example.com`
        });
        users.push({
            user,
            token
        });
    }
    return users;
};
const createTestEvent = async (userId, overrides = {}) => {
    const now = new Date();
    const defaults = {
        title: 'Test Event',
        startTime: new Date(now.getTime() + 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        status: 'BUSY',
        userId
    };
    const eventData = {
        ...defaults,
        ...overrides
    };
    return await Event.create(eventData);
};
const createSwapRequest = async (requesterId, recipientId, mySlotId, theirSlotId, status = 'PENDING') => {
    return await SwapRequest.create({
        requester: requesterId,
        recipient: recipientId,
        mySlot: mySlotId,
        theirSlot: theirSlotId,
        status
    });
};
const generateTimeSlots = (offsetHours = 1, durationHours = 1) => {
    const now = new Date();
    const startTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    return {
        startTime,
        endTime
    };
};
module.exports = {
    createTestUser,
    createTestUsers,
    createTestEvent,
    createSwapRequest,
    generateTimeSlots
};