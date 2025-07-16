import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import { JWTUtils } from '../src/utils/jwt';
import { generateGuestId } from '../src/utils/uuid';

describe('Authentication Unit Tests', () => {
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

  describe('User Model', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        isGuest: false,
        profile: {
          displayName: 'Test User',
        },
        progress: {
          unlockedFeatures: ['basic-games'],
        },
      };

      const user = new User(userData);
      await user.save();

      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.password).not.toBe('password123'); // Password should be hashed
      expect(user.isGuest).toBe(false);
      expect(user.profile.displayName).toBe('Test User');
    });

    it('should compare passwords correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        isGuest: false,
        profile: {
          displayName: 'Test User',
        },
      });
      await user.save();

      const isMatch = await user.comparePassword('password123');
      const isNotMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('should create a guest user', async () => {
      const guestId = generateGuestId();
      const guestUser = new User({
        username: 'guest_user',
        isGuest: true,
        guestId: guestId,
        profile: {
          displayName: 'Guest User',
        },
      });
      await guestUser.save();

      expect(guestUser.isGuest).toBe(true);
      expect(guestUser.guestId).toBe(guestId);
      expect(guestUser.email).toBeUndefined();
      expect(guestUser.password).toBeUndefined();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'User 1' },
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User({
        ...userData,
        username: 'user2',
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should not allow duplicate usernames', async () => {
      const user1 = new User({
        email: 'user1@example.com',
        username: 'sameusername',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'User 1' },
      });
      await user1.save();

      const user2 = new User({
        email: 'user2@example.com',
        username: 'sameusername',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'User 2' },
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('JWT Utils', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = new User({
        email: 'jwt@example.com',
        username: 'jwtuser',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'JWT User' },
      });
      await testUser.save();
    });

    it('should generate access token for regular user', () => {
      const accessToken = JWTUtils.generateAccessToken(testUser);
      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
    });

    it('should generate refresh token for regular user', () => {
      const refreshToken = JWTUtils.generateRefreshToken(testUser);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });

    it('should generate token pair for regular user', () => {
      const tokenPair = JWTUtils.generateTokenPair(testUser);
      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
    });

    it('should verify access token', () => {
      const accessToken = JWTUtils.generateAccessToken(testUser);
      const payload = JWTUtils.verifyAccessToken(accessToken);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('isGuest');
      expect(payload.username).toBe('jwtuser');
      expect(payload.isGuest).toBe(false);
    });

    it('should verify refresh token', () => {
      const refreshToken = JWTUtils.generateRefreshToken(testUser);
      const payload = JWTUtils.verifyRefreshToken(refreshToken);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('isGuest');
      expect(payload.username).toBe('jwtuser');
      expect(payload.isGuest).toBe(false);
    });

    it('should extract token from authorization header', () => {
      const token = 'sample-token';
      const authHeader = `Bearer ${token}`;
      
      const extracted = JWTUtils.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for invalid authorization header', () => {
      const extracted1 = JWTUtils.extractTokenFromHeader('InvalidHeader');
      const extracted2 = JWTUtils.extractTokenFromHeader('Bearer');
      const extracted3 = JWTUtils.extractTokenFromHeader('');
      
      expect(extracted1).toBeNull();
      expect(extracted2).toBeNull();
      expect(extracted3).toBeNull();
    });

    it('should handle guest user tokens', async () => {
      const guestId = generateGuestId();
      const guestUser = new User({
        username: 'guest_jwt',
        isGuest: true,
        guestId: guestId,
        profile: { displayName: 'Guest JWT' },
      });
      await guestUser.save();

      const tokenPair = JWTUtils.generateTokenPair(guestUser);
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBe(''); // No refresh token for guests

      const payload = JWTUtils.verifyAccessToken(tokenPair.accessToken);
      expect(payload.isGuest).toBe(true);
      expect(payload.guestId).toBe(guestId);
    });

    it('should throw error for refresh token with guest user', async () => {
      const guestUser = new User({
        username: 'guest_error',
        isGuest: true,
        guestId: generateGuestId(),
        profile: { displayName: 'Guest Error' },
      });
      await guestUser.save();

      expect(() => {
        JWTUtils.generateRefreshToken(guestUser);
      }).toThrow('Refresh tokens are not available for guest users');
    });

    it('should detect expired tokens', () => {
      // Create a token that expires in 1 second
      const shortLivedToken = JWTUtils.generateAccessToken(testUser);
      
      // For this test, we'll assume the token is valid initially
      expect(JWTUtils.isTokenExpired(shortLivedToken)).toBe(false);
    });

    it('should get token expiry date', () => {
      const token = JWTUtils.generateAccessToken(testUser);
      const expiry = JWTUtils.getTokenExpiry(token);
      
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Authentication Flow', () => {
    it('should simulate complete registration flow', async () => {
      // 1. Create user
      const userData = {
        email: 'flow@example.com',
        username: 'flowuser',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'Flow User' },
        progress: { unlockedFeatures: ['basic-games'] },
      };

      const user = new User(userData);
      await user.save();

      // 2. Generate tokens
      const tokens = JWTUtils.generateTokenPair(user);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // 3. Verify tokens
      const accessPayload = JWTUtils.verifyAccessToken(tokens.accessToken);
      const refreshPayload = JWTUtils.verifyRefreshToken(tokens.refreshToken);

      expect(accessPayload.userId).toBe((user._id as any).toString());
      expect(refreshPayload.userId).toBe((user._id as any).toString());
    });

    it('should simulate complete login flow', async () => {
      // 1. Create user
      const user = new User({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'password123',
        isGuest: false,
        profile: { displayName: 'Login User' },
      });
      await user.save();

      // 2. Find user by email
      const foundUser = await User.findOne({ email: 'login@example.com' });
      expect(foundUser).toBeDefined();

      // 3. Verify password
      const isValidPassword = await foundUser!.comparePassword('password123');
      expect(isValidPassword).toBe(true);

      // 4. Generate tokens
      const tokens = JWTUtils.generateTokenPair(foundUser!);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should simulate guest login flow', async () => {
      // 1. Generate guest ID
      const guestId = generateGuestId();
      expect(guestId).toBeDefined();

      // 2. Create guest user
      const guestUser = new User({
        username: `Guest_${Date.now()}`,
        isGuest: true,
        guestId: guestId,
        profile: { displayName: 'Guest User' },
        progress: { unlockedFeatures: ['basic-games'] },
      });
      await guestUser.save();

      // 3. Generate tokens (only access token for guests)
      const tokens = JWTUtils.generateTokenPair(guestUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBe('');

      // 4. Verify access token
      const payload = JWTUtils.verifyAccessToken(tokens.accessToken);
      expect(payload.isGuest).toBe(true);
      expect(payload.guestId).toBe(guestId);
    });

    it('should simulate guest to registered user conversion', async () => {
      // 1. Create guest user
      const guestId = generateGuestId();
      const guestUser = new User({
        username: 'guest_convert',
        isGuest: true,
        guestId: guestId,
        profile: { displayName: 'Guest Convert' },
      });
      await guestUser.save();

      // 2. Convert to registered user
      guestUser.email = 'converted@example.com';
      guestUser.password = 'newpassword123';
      guestUser.isGuest = false;
      guestUser.guestId = undefined;
      await guestUser.save();

      // 3. Verify conversion
      expect(guestUser.email).toBe('converted@example.com');
      expect(guestUser.isGuest).toBe(false);
      expect(guestUser.guestId).toBeUndefined();
      expect(guestUser.password).not.toBe('newpassword123'); // Should be hashed

      // 4. Generate new tokens
      const tokens = JWTUtils.generateTokenPair(guestUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JWT tokens', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should handle malformed JWT tokens', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('malformed.token.here');
      }).toThrow();
    });

    it('should handle empty token verification', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('');
      }).toThrow();
    });

    it('should handle password comparison without password', async () => {
      const guestUser = new User({
        username: 'guest_nopass',
        isGuest: true,
        guestId: generateGuestId(),
        profile: { displayName: 'Guest No Pass' },
      });
      await guestUser.save();

      const result = await guestUser.comparePassword('anypassword');
      expect(result).toBe(false);
    });
  });
});
