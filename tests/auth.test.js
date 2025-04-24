const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Authentication Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Test@123',
                    phone: '1234567890',
                    address: 'Test Address'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should not register user with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'Test@123',
                    phone: '1234567890',
                    address: 'Test Address'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login user with valid credentials', async () => {
            // First register a user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'Test@123',
                    phone: '1234567890',
                    address: 'Test Address'
                });

            // Then try to login
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test@123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });
}); 