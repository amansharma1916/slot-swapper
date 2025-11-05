const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const swapRoutes = require('../routes/swap');
const Event = require('../models/Events');
const SwapRequest = require('../models/SwapRequest');
const {
    createTestUsers,
    createTestEvent,
    generateTimeSlots,
    createSwapRequest
} = require('./helpers');
const app = express();
app.use(express.json());
app.use('/api', swapRoutes);
describe('Swap Routes', () => {
    let user1, user2, token1, token2;
    let event1, event2;
    beforeEach(async () => {
        const users = await createTestUsers(2);
        user1 = users[0].user;
        token1 = users[0].token;
        user2 = users[1].user;
        token2 = users[1].token;
        const {
            startTime: start1,
            endTime: end1
        } = generateTimeSlots(1, 2);
        const {
            startTime: start2,
            endTime: end2
        } = generateTimeSlots(5, 2);
        event1 = await createTestEvent(user1._id, {
            title: 'User1 Swappable Event',
            startTime: start1,
            endTime: end1,
            status: 'SWAPPABLE'
        });
        event2 = await createTestEvent(user2._id, {
            title: 'User2 Swappable Event',
            startTime: start2,
            endTime: end2,
            status: 'SWAPPABLE'
        });
    });
    describe('POST /api/swap-request', () => {
        it('should create a swap request successfully', async () => {
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: event2._id
            }).expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Swap request created');
            expect(response.body.request).toBeDefined();
            expect(response.body.request.status).toBe('PENDING');
            const updatedEvent1 = await Event.findById(event1._id);
            const updatedEvent2 = await Event.findById(event2._id);
            expect(updatedEvent1.status).toBe('SWAP_PENDING');
            expect(updatedEvent2.status).toBe('SWAP_PENDING');
        });
        it('should fail when mySlotId or theirSlotId is missing', async () => {
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });
        it('should fail when user does not own mySlot', async () => {
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event2._id,
                theirSlotId: event1._id
            }).expect(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('do not own');
        });
        it('should fail when trying to swap with own slot', async () => {
            const {
                startTime,
                endTime
            } = generateTimeSlots(10, 2);
            const anotherEvent = await createTestEvent(user1._id, {
                title: 'Another User1 Event',
                startTime,
                endTime,
                status: 'SWAPPABLE'
            });
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: anotherEvent._id
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Cannot request swap for your own slot');
        });
        it('should fail when slots are not SWAPPABLE', async () => {
            await Event.findByIdAndUpdate(event1._id, {
                status: 'BUSY'
            });
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: event2._id
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('must be SWAPPABLE');
        });
        it('should fail when slot does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: fakeId
            }).expect(400);
            expect(response.body.success).toBe(false);
        });
        it('should rollback on transaction failure', async () => {
            const initialEvent1Status = event1.status;
            const initialEvent2Status = event2.status;
            const fakeId = 'invalid-id-format';
            try {
                await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                    mySlotId: event1._id,
                    theirSlotId: fakeId
                });
            } catch (err) { }
            const checkEvent1 = await Event.findById(event1._id);
            const checkEvent2 = await Event.findById(event2._id);
            expect(checkEvent1.status).toBe(initialEvent1Status);
            expect(checkEvent2.status).toBe(initialEvent2Status);
        });
    });
    describe('POST /api/swap-response/:requestId', () => {
        let swapRequest;
        beforeEach(async () => {
            const response = await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: event2._id
            });
            swapRequest = response.body.request;
        });
        describe('Accept Swap', () => {
            it('should accept swap and exchange slot ownership', async () => {
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                }).expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe('Swap request accepted');
                const updatedEvent1 = await Event.findById(event1._id);
                const updatedEvent2 = await Event.findById(event2._id);
                expect(updatedEvent1.userId.toString()).toBe(user2._id.toString());
                expect(updatedEvent2.userId.toString()).toBe(user1._id.toString());
                expect(updatedEvent1.status).toBe('BUSY');
                expect(updatedEvent2.status).toBe('BUSY');
                const updatedSwap = await SwapRequest.findById(swapRequest._id);
                expect(updatedSwap.status).toBe('ACCEPTED');
            });
            it('should fail if requester tries to accept their own request', async () => {
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token1}`).send({
                    accept: true
                }).expect(403);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('not authorized');
            });
            it('should maintain data integrity on accept', async () => {
                await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                });
                const allEvents = await Event.find({});
                expect(allEvents.length).toBe(2);
                const allSwaps = await SwapRequest.find({});
                expect(allSwaps.length).toBe(1);
                expect(allSwaps[0].status).toBe('ACCEPTED');
            });
        });
        describe('Reject Swap', () => {
            it('should reject swap and restore SWAPPABLE status', async () => {
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: false
                }).expect(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe('Swap request rejected');
                const updatedEvent1 = await Event.findById(event1._id);
                const updatedEvent2 = await Event.findById(event2._id);
                expect(updatedEvent1.status).toBe('SWAPPABLE');
                expect(updatedEvent2.status).toBe('SWAPPABLE');
                expect(updatedEvent1.userId.toString()).toBe(user1._id.toString());
                expect(updatedEvent2.userId.toString()).toBe(user2._id.toString());
                const updatedSwap = await SwapRequest.findById(swapRequest._id);
                expect(updatedSwap.status).toBe('REJECTED');
            });
        });
        describe('Edge Cases', () => {
            it('should fail when accept parameter is missing', async () => {
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({}).expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('accept');
            });
            it('should fail when swap request does not exist', async () => {
                const fakeId = new mongoose.Types.ObjectId();
                const response = await request(app).post(`/api/swap-response/${fakeId}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                }).expect(404);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toBe('Swap request not found');
            });
            it('should fail when swap is already accepted', async () => {
                await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                });
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                }).expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('not pending');
            });
            it('should fail when swap is already rejected', async () => {
                await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: false
                });
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                }).expect(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('not pending');
            });
            it('should rollback accept if transaction fails', async () => {
                await Event.findByIdAndDelete(event1._id);
                const response = await request(app).post(`/api/swap-response/${swapRequest._id}`).set('Authorization', `Bearer ${token2}`).send({
                    accept: true
                }).expect(400);
                expect(response.body.success).toBe(false);
                const checkSwap = await SwapRequest.findById(swapRequest._id);
                expect(checkSwap.status).toBe('PENDING');
                const checkEvent2 = await Event.findById(event2._id);
                expect(checkEvent2.status).toBe('SWAP_PENDING');
            });
        });
    });
    describe('GET /api/swap-requests/incoming', () => {
        it('should return incoming pending swap requests', async () => {
            await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: event2._id
            });
            const response = await request(app).get('/api/swap-requests/incoming').set('Authorization', `Bearer ${token2}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.requests).toHaveLength(1);
            expect(response.body.requests[0].status).toBe('PENDING');
            expect(response.body.requests[0].requester).toBeDefined();
            expect(response.body.requests[0].mySlot).toBeDefined();
            expect(response.body.requests[0].theirSlot).toBeDefined();
        });
        it('should not return accepted/rejected requests', async () => {
            const req = await createSwapRequest(user1._id, user2._id, event1._id, event2._id);
            await SwapRequest.findByIdAndUpdate(req._id, {
                status: 'ACCEPTED'
            });
            const response = await request(app).get('/api/swap-requests/incoming').set('Authorization', `Bearer ${token2}`).expect(200);
            expect(response.body.count).toBe(0);
        });
        it('should return empty array when no incoming requests', async () => {
            const response = await request(app).get('/api/swap-requests/incoming').set('Authorization', `Bearer ${token2}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(0);
            expect(response.body.requests).toEqual([]);
        });
    });
    describe('GET /api/swap-requests/outgoing', () => {
        it('should return outgoing swap requests', async () => {
            await request(app).post('/api/swap-request').set('Authorization', `Bearer ${token1}`).send({
                mySlotId: event1._id,
                theirSlotId: event2._id
            });
            const response = await request(app).get('/api/swap-requests/outgoing').set('Authorization', `Bearer ${token1}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.requests).toHaveLength(1);
            expect(response.body.requests[0].recipient).toBeDefined();
        });
        it('should return all statuses (pending, accepted, rejected)', async () => {
            await createSwapRequest(user1._id, user2._id, event1._id, event2._id, 'PENDING');
            const {
                startTime,
                endTime
            } = generateTimeSlots(10, 2);
            const event3 = await createTestEvent(user1._id, {
                startTime,
                endTime,
                status: 'SWAPPABLE'
            });
            const event4 = await createTestEvent(user2._id, {
                startTime: generateTimeSlots(15, 2).startTime,
                endTime: generateTimeSlots(15, 2).endTime,
                status: 'SWAPPABLE'
            });
            await createSwapRequest(user1._id, user2._id, event3._id, event4._id, 'ACCEPTED');
            const response = await request(app).get('/api/swap-requests/outgoing').set('Authorization', `Bearer ${token1}`).expect(200);
            expect(response.body.count).toBeGreaterThanOrEqual(2);
        });
    });
});