const request = require('supertest');
const express = require('express');
const eventRoutes = require('../routes/events');
const Event = require('../models/Events');
const {
    createTestUser,
    createTestEvent,
    generateTimeSlots
} = require('./helpers');
const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);
describe('Event Routes', () => {
    let testUser, authToken;
    beforeEach(async () => {
        const result = await createTestUser();
        testUser = result.user;
        authToken = result.token;
    });
    describe('POST /api/events', () => {
        it('should create a new event successfully', async () => {
            const {
                startTime,
                endTime
            } = generateTimeSlots(1, 2);
            const eventData = {
                title: 'Team Meeting',
                startTime,
                endTime,
                status: 'BUSY',
                description: 'Weekly sync'
            };
            const response = await request(app).post('/api/events').set('Authorization', `Bearer ${authToken}`).send(eventData).expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Event created successfully');
            expect(response.body.event).toBeDefined();
            expect(response.body.event.title).toBe(eventData.title);
            expect(response.body.event.status).toBe('BUSY');
        });
        it('should fail when required fields are missing', async () => {
            const response = await request(app).post('/api/events').set('Authorization', `Bearer ${authToken}`).send({
                title: 'Incomplete Event'
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('start time');
        });
        it('should fail when end time is before start time', async () => {
            const now = new Date();
            const eventData = {
                title: 'Invalid Event',
                startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
                endTime: new Date(now.getTime() + 1 * 60 * 60 * 1000)
            };
            const response = await request(app).post('/api/events').set('Authorization', `Bearer ${authToken}`).send(eventData).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('End time must be after start time');
        });
        it('should detect conflicting events', async () => {
            const {
                startTime,
                endTime
            } = generateTimeSlots(1, 2);
            await createTestEvent(testUser._id, {
                startTime,
                endTime
            });
            const conflictData = {
                title: 'Conflicting Event',
                startTime: new Date(startTime.getTime() + 30 * 60 * 1000),
                endTime: new Date(endTime.getTime() + 30 * 60 * 1000)
            };
            const response = await request(app).post('/api/events').set('Authorization', `Bearer ${authToken}`).send(conflictData).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('conflicts');
            expect(response.body.conflicts).toBeDefined();
        });
        it('should fail without authentication', async () => {
            const {
                startTime,
                endTime
            } = generateTimeSlots(1, 2);
            const eventData = {
                title: 'No Auth Event',
                startTime,
                endTime
            };
            await request(app).post('/api/events').send(eventData).expect(401);
        });
    });
    describe('GET /api/events', () => {
        it('should return all events for authenticated user', async () => {
            await createTestEvent(testUser._id, {
                title: 'Event 1'
            });
            await createTestEvent(testUser._id, {
                title: 'Event 2',
                ...generateTimeSlots(3, 1)
            });
            const response = await request(app).get('/api/events').set('Authorization', `Bearer ${authToken}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(response.body.events).toHaveLength(2);
        });
        it('should filter events by status', async () => {
            await createTestEvent(testUser._id, {
                title: 'Busy Event',
                status: 'BUSY'
            });
            await createTestEvent(testUser._id, {
                title: 'Swappable Event',
                status: 'SWAPPABLE',
                ...generateTimeSlots(3, 1)
            });
            const response = await request(app).get('/api/events?status=SWAPPABLE').set('Authorization', `Bearer ${authToken}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.events[0].status).toBe('SWAPPABLE');
        });
        it('should not return events from other users', async () => {
            const {
                user: otherUser
            } = await createTestUser({
                email: 'other@example.com'
            });
            await createTestEvent(testUser._id, {
                title: 'My Event'
            });
            await createTestEvent(otherUser._id, {
                title: 'Other Event',
                ...generateTimeSlots(5, 1)
            });
            const response = await request(app).get('/api/events').set('Authorization', `Bearer ${authToken}`).expect(200);
            expect(response.body.count).toBe(1);
            expect(response.body.events[0].title).toBe('My Event');
        });
    });
    describe('GET /api/events/:id', () => {
        it('should return a specific event', async () => {
            const event = await createTestEvent(testUser._id, {
                title: 'Specific Event'
            });
            const response = await request(app).get(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event._id).toBe(event._id.toString());
            expect(response.body.event.title).toBe('Specific Event');
        });
        it('should fail for non-existent event', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/events/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Event not found');
        });
        it('should fail when accessing another user\'s event', async () => {
            const {
                user: otherUser
            } = await createTestUser({
                email: 'other@example.com'
            });
            const event = await createTestEvent(otherUser._id, {
                title: 'Other Event'
            });
            const response = await request(app).get(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).expect(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Not authorized');
        });
    });
    describe('PATCH /api/events/:id', () => {
        it('should update event with partial data', async () => {
            const event = await createTestEvent(testUser._id, {
                title: 'Original Title',
                status: 'BUSY'
            });
            const response = await request(app).patch(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).send({
                title: 'Updated Title'
            }).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event.title).toBe('Updated Title');
            expect(response.body.event.status).toBe('BUSY');
        });
        it('should update status only', async () => {
            const event = await createTestEvent(testUser._id, {
                status: 'BUSY'
            });
            const response = await request(app).patch(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).send({
                status: 'SWAPPABLE'
            }).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event.status).toBe('SWAPPABLE');
        });
        it('should validate time changes', async () => {
            const event = await createTestEvent(testUser._id);
            const {
                startTime,
                endTime
            } = generateTimeSlots(1, 2);
            const invalidEnd = new Date(startTime.getTime() - 60 * 60 * 1000);
            const response = await request(app).patch(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).send({
                startTime,
                endTime: invalidEnd
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('End time must be after start time');
        });
        it('should detect conflicts when updating times', async () => {
            const {
                startTime: start1,
                endTime: end1
            } = generateTimeSlots(1, 2);
            const {
                startTime: start2,
                endTime: end2
            } = generateTimeSlots(5, 2);
            const event1 = await createTestEvent(testUser._id, {
                startTime: start1,
                endTime: end1
            });
            await createTestEvent(testUser._id, {
                startTime: start2,
                endTime: end2
            });
            const response = await request(app).patch(`/api/events/${event1._id}`).set('Authorization', `Bearer ${authToken}`).send({
                startTime: start2,
                endTime: end2
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('conflict');
        });
        it('should fail with no fields to update', async () => {
            const event = await createTestEvent(testUser._id);
            const response = await request(app).patch(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).send({}).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No fields provided to update');
        });
    });
    describe('PATCH /api/events/:id/status', () => {
        it('should update event status', async () => {
            const event = await createTestEvent(testUser._id, {
                status: 'BUSY'
            });
            const response = await request(app).patch(`/api/events/${event._id}/status`).set('Authorization', `Bearer ${authToken}`).send({
                status: 'SWAPPABLE'
            }).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.event.status).toBe('SWAPPABLE');
        });
        it('should fail with invalid status', async () => {
            const event = await createTestEvent(testUser._id);
            const response = await request(app).patch(`/api/events/${event._id}/status`).set('Authorization', `Bearer ${authToken}`).send({
                status: 'INVALID_STATUS'
            }).expect(400);
            expect(response.body.success).toBe(false);
        });
    });
    describe('DELETE /api/events/:id', () => {
        it('should delete an event', async () => {
            const event = await createTestEvent(testUser._id);
            const response = await request(app).delete(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Event deleted successfully');
            const deletedEvent = await Event.findById(event._id);
            expect(deletedEvent).toBeNull();
        });
        it('should fail when deleting another user\'s event', async () => {
            const {
                user: otherUser
            } = await createTestUser({
                email: 'other@example.com'
            });
            const event = await createTestEvent(otherUser._id);
            const response = await request(app).delete(`/api/events/${event._id}`).set('Authorization', `Bearer ${authToken}`).expect(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Not authorized');
        });
    });
});