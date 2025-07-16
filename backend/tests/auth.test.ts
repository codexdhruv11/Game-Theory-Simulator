import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { JWTUtils } from '../src/utils/jwt';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/game-theory-simulator-test';
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          displayName: 'Test User',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not register user with missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const newUser = new User({
        email: 'testlogin@example.com',
        username: 'testlogin',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'Test Login' },
        progress: { unlockedFeatures: ['basic-games'] },
      });
      await newUser.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testlogin@example.com', password: 'password123' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' });
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/auth/guest', () => {
    it('should login as guest', async () => {
      const res = await request(app).post('/api/auth/guest').send({});
      expect(res.statusCode).toEqual(201);
      expect(res.body.user.isGuest).toBe(true);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token', async () => {
      const user = await User.findOne({ username: 'testlogin' });
      const refreshToken = user && JWTUtils.generateRefreshToken(user);
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});

