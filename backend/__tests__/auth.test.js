const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const User = require('../models/RegisterUser');
const {
    createTestUser
} = require('./helpers');
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            const response = await request(app).post('/api/auth/register').send(userData).expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.fullName).toBe(userData.fullName);
            expect(response.body.user.password).toBeUndefined();
            expect(response.body.token).toBeDefined();
        });
        it('should fail when required fields are missing', async () => {
            const response = await request(app).post('/api/auth/register').send({
                email: 'test@example.com'
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('All fields are required');
        });
        it('should fail when email already exists', async () => {
            const userData = {
                fullName: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123'
            };
            await request(app).post('/api/auth/register').send(userData);
            const response = await request(app).post('/api/auth/register').send(userData).expect(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User with this email already exists');
        });
        it('should hash the password before saving', async () => {
            const userData = {
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };
            await request(app).post('/api/auth/register').send(userData);
            const user = await User.findOne({
                email: userData.email
            }).select('+password');
            expect(user.password).not.toBe(userData.password);
            expect(user.password).toMatch(/^\$2[aby]\$/);
        });
    });
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const userData = {
                fullName: 'Login Test',
                email: 'login@example.com',
                password: 'password123'
            };
            await request(app).post('/api/auth/register').send(userData);
            const response = await request(app).post('/api/auth/login').send({
                email: userData.email,
                password: userData.password
            }).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.token).toBeDefined();
        });
        it('should fail with invalid email', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123'
            }).expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid email or password');
        });
        it('should fail with invalid password', async () => {
            const userData = {
                fullName: 'Password Test',
                email: 'passtest@example.com',
                password: 'correctpassword'
            };
            await request(app).post('/api/auth/register').send(userData);
            const response = await request(app).post('/api/auth/login').send({
                email: userData.email,
                password: 'wrongpassword'
            }).expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid email or password');
        });
        it('should fail when email or password is missing', async () => {
            const response = await request(app).post('/api/auth/login').send({
                email: 'test@example.com'
            }).expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email and password are required');
        });
    });
    describe('GET /api/auth/me', () => {
        it('should return user profile with valid token', async () => {
            const {
                user,
                token
            } = await createTestUser();
            const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
            expect(response.body.user._id.toString()).toBe(user._id.toString());
            expect(response.body.user.email).toBe(user.email);
        });
        it('should fail without authentication token', async () => {
            const response = await request(app).get('/api/auth/me').expect(401);
            expect(response.body.success).toBe(false);
        });
        it('should fail with invalid token', async () => {
            const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken').expect(401);
            expect(response.body.success).toBe(false);
        });
    });
});