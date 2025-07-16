import { JWTUtils } from '../src/utils/jwt';
import { generateGuestId } from '../src/utils/uuid';
import bcrypt from 'bcryptjs';

describe('JWT Authentication Tests', () => {
  // Mock user objects for testing
  const mockRegularUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    isGuest: false,
    password: 'hashedpassword123',
    profile: {
      displayName: 'Test User',
      joinDate: new Date(),
      lastActive: new Date(),
    },
    gameStats: {
      totalGamesPlayed: 0,
      totalScore: 0,
      winRate: 0,
      achievements: [],
    },
    moralAlignment: {
      utilitarian: 0,
      deontological: 0,
      virtue: 0,
      contractual: 0,
      care: 0,
      lastUpdated: new Date(),
    },
    preferences: {
      theme: 'system',
      notifications: true,
      privacy: {
        showProfile: true,
        showStats: true,
        showAlignment: false,
      },
    },
    progress: {
      level: 1,
      experience: 0,
      unlockedFeatures: ['basic-games'],
      completedTutorials: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGuestUser = {
    _id: '507f1f77bcf86cd799439012',
    username: 'guest_user',
    isGuest: true,
    guestId: generateGuestId(),
    profile: {
      displayName: 'Guest User',
      joinDate: new Date(),
      lastActive: new Date(),
    },
    gameStats: {
      totalGamesPlayed: 0,
      totalScore: 0,
      winRate: 0,
      achievements: [],
    },
    moralAlignment: {
      utilitarian: 0,
      deontological: 0,
      virtue: 0,
      contractual: 0,
      care: 0,
      lastUpdated: new Date(),
    },
    preferences: {
      theme: 'system',
      notifications: true,
      privacy: {
        showProfile: true,
        showStats: true,
        showAlignment: false,
      },
    },
    progress: {
      level: 1,
      experience: 0,
      unlockedFeatures: ['basic-games'],
      completedTutorials: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('JWT Token Generation', () => {
    it('should generate access token for regular user', () => {
      const accessToken = JWTUtils.generateAccessToken(mockRegularUser as any);
      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(accessToken.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate refresh token for regular user', () => {
      const refreshToken = JWTUtils.generateRefreshToken(mockRegularUser as any);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.').length).toBe(3);
    });

    it('should generate token pair for regular user', () => {
      const tokenPair = JWTUtils.generateTokenPair(mockRegularUser as any);
      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.refreshToken).not.toBe('');
    });

    it('should generate access token for guest user', () => {
      const accessToken = JWTUtils.generateAccessToken(mockGuestUser as any);
      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(accessToken.split('.').length).toBe(3);
    });

    it('should generate token pair for guest user (no refresh token)', () => {
      const tokenPair = JWTUtils.generateTokenPair(mockGuestUser as any);
      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBe(''); // No refresh token for guests
    });

    it('should throw error when generating refresh token for guest user', () => {
      expect(() => {
        JWTUtils.generateRefreshToken(mockGuestUser as any);
      }).toThrow('Refresh tokens are not available for guest users');
    });
  });

  describe('JWT Token Verification', () => {
    it('should verify access token for regular user', () => {
      const accessToken = JWTUtils.generateAccessToken(mockRegularUser as any);
      const payload = JWTUtils.verifyAccessToken(accessToken);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('isGuest');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
      
      expect(payload.userId).toBe(mockRegularUser._id);
      expect(payload.username).toBe(mockRegularUser.username);
      expect(payload.isGuest).toBe(false);
    });

    it('should verify access token for guest user', () => {
      const accessToken = JWTUtils.generateAccessToken(mockGuestUser as any);
      const payload = JWTUtils.verifyAccessToken(accessToken);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('isGuest');
      expect(payload).toHaveProperty('guestId');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
      
      expect(payload.userId).toBe(mockGuestUser._id);
      expect(payload.username).toBe(mockGuestUser.username);
      expect(payload.isGuest).toBe(true);
      expect(payload.guestId).toBe(mockGuestUser.guestId);
    });

    it('should verify refresh token for regular user', () => {
      const refreshToken = JWTUtils.generateRefreshToken(mockRegularUser as any);
      const payload = JWTUtils.verifyRefreshToken(refreshToken);
      
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('isGuest');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
      
      expect(payload.userId).toBe(mockRegularUser._id);
      expect(payload.username).toBe(mockRegularUser.username);
      expect(payload.isGuest).toBe(false);
    });

    it('should throw error for invalid access token', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for malformed access token', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('malformed.token.structure');
      }).toThrow();
    });

    it('should throw error for empty access token', () => {
      expect(() => {
        JWTUtils.verifyAccessToken('');
      }).toThrow();
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        JWTUtils.verifyRefreshToken('invalid-refresh-token');
      }).toThrow();
    });
  });

  describe('JWT Token Utilities', () => {
    it('should extract token from valid authorization header', () => {
      const token = 'sample-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      const extracted = JWTUtils.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for invalid authorization header formats', () => {
      const testCases = [
        'InvalidHeader',
        'Bearer',
        'Basic token',
        'Bearer token extra',
        '',
        undefined,
      ];

      testCases.forEach(header => {
        const extracted = JWTUtils.extractTokenFromHeader(header);
        expect(extracted).toBeNull();
      });
    });

    it('should get token expiry date', () => {
      const token = JWTUtils.generateAccessToken(mockRegularUser as any);
      const expiry = JWTUtils.getTokenExpiry(token);
      
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid token when getting expiry', () => {
      const expiry = JWTUtils.getTokenExpiry('invalid-token');
      expect(expiry).toBeNull();
    });

    it('should detect valid tokens as not expired', () => {
      const token = JWTUtils.generateAccessToken(mockRegularUser as any);
      const isExpired = JWTUtils.isTokenExpired(token);
      
      expect(isExpired).toBe(false);
    });

    it('should detect invalid tokens as expired', () => {
      const isExpired = JWTUtils.isTokenExpired('invalid-token');
      expect(isExpired).toBe(true);
    });
  });

  describe('Password Hashing and Comparison', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const saltRounds = 4; // Use lower rounds for testing
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should compare password correctly', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const saltRounds = 4;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const isMatch = await bcrypt.compare(password, hashedPassword);
      const isNotMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Guest ID Generation', () => {
    it('should generate unique guest IDs', () => {
      const guestId1 = generateGuestId();
      const guestId2 = generateGuestId();
      
      expect(guestId1).toBeDefined();
      expect(guestId2).toBeDefined();
      expect(guestId1).not.toBe(guestId2);
      expect(typeof guestId1).toBe('string');
      expect(typeof guestId2).toBe('string');
    });

    it('should generate guest IDs with consistent format', () => {
      const guestId = generateGuestId();
      
      expect(guestId).toBeDefined();
      expect(guestId.length).toBeGreaterThan(0);
      expect(typeof guestId).toBe('string');
      // Check if it follows the expected guest ID format: guest_timestamp_randomhex
      const guestIdRegex = /^guest_\d+_[0-9a-f]{16}$/;
      expect(guestIdRegex.test(guestId)).toBe(true);
      expect(guestId.startsWith('guest_')).toBe(true);
    });
  });

  describe('Authentication Flow Simulation', () => {
    it('should simulate complete login flow', () => {
      // 1. Generate tokens for user
      const tokens = JWTUtils.generateTokenPair(mockRegularUser as any);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // 2. Verify access token
      const accessPayload = JWTUtils.verifyAccessToken(tokens.accessToken);
      expect(accessPayload.userId).toBe(mockRegularUser._id);
      expect(accessPayload.username).toBe(mockRegularUser.username);
      expect(accessPayload.isGuest).toBe(false);

      // 3. Verify refresh token
      const refreshPayload = JWTUtils.verifyRefreshToken(tokens.refreshToken);
      expect(refreshPayload.userId).toBe(mockRegularUser._id);
      expect(refreshPayload.username).toBe(mockRegularUser.username);
      expect(refreshPayload.isGuest).toBe(false);
    });

    it('should simulate guest login flow', () => {
      // 1. Generate tokens for guest user
      const tokens = JWTUtils.generateTokenPair(mockGuestUser as any);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBe(''); // No refresh token for guests

      // 2. Verify access token
      const accessPayload = JWTUtils.verifyAccessToken(tokens.accessToken);
      expect(accessPayload.userId).toBe(mockGuestUser._id);
      expect(accessPayload.username).toBe(mockGuestUser.username);
      expect(accessPayload.isGuest).toBe(true);
      expect(accessPayload.guestId).toBe(mockGuestUser.guestId);
    });

    it('should simulate token refresh flow', () => {
      // 1. Generate initial tokens
      const initialTokens = JWTUtils.generateTokenPair(mockRegularUser as any);
      expect(initialTokens.accessToken).toBeDefined();
      expect(initialTokens.refreshToken).toBeDefined();

      // 2. Verify refresh token
      const refreshPayload = JWTUtils.verifyRefreshToken(initialTokens.refreshToken);
      expect(refreshPayload.userId).toBe(mockRegularUser._id);

      // 3. Generate new access token
      const newAccessToken = JWTUtils.generateAccessToken(mockRegularUser as any);
      expect(newAccessToken).toBeDefined();

      // 4. Verify new access token
      const newPayload = JWTUtils.verifyAccessToken(newAccessToken);
      expect(newPayload.userId).toBe(mockRegularUser._id);
      expect(newPayload.username).toBe(mockRegularUser.username);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing JWT secrets gracefully', () => {
      const originalSecret = process.env.JWT_SECRET;
      const originalRefreshSecret = process.env.JWT_REFRESH_SECRET;
      
      // Remove secrets
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;
      
      expect(() => {
        JWTUtils.generateAccessToken(mockRegularUser as any);
      }).toThrow();
      
      expect(() => {
        JWTUtils.generateRefreshToken(mockRegularUser as any);
      }).toThrow();
      
      // Restore secrets
      process.env.JWT_SECRET = originalSecret;
      process.env.JWT_REFRESH_SECRET = originalRefreshSecret;
    });

    it('should handle various invalid token formats', () => {
      const invalidTokens = [
        '',
        'invalid',
        'invalid.token',
        'invalid.token.format.extra',
        'Bearer token',
        null,
        undefined,
      ];

      invalidTokens.forEach(token => {
        expect(() => {
          JWTUtils.verifyAccessToken(token as any);
        }).toThrow();
      });
    });
  });
});
