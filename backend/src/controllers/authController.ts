import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User, IUser } from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateGuestId } from '../utils/uuid';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  const { email, username, password, displayName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username },
    ],
  });

  if (existingUser) {
    res.status(409).json({
      error: 'User already exists',
      message: existingUser.email === email.toLowerCase() 
        ? 'Email already registered' 
        : 'Username already taken',
    });
    return;
  }

  // Create new user
  const user = new User({
    email: email.toLowerCase(),
    username,
    password,
    isGuest: false,
    profile: {
      displayName: displayName || username,
    },
    progress: {
      unlockedFeatures: ['basic-games'], // Start with basic features
    },
  });

  await user.save();

  // Generate tokens
  const tokens = JWTUtils.generateTokenPair(user);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    message: 'User registered successfully',
    user: userResponse,
    tokens,
  });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ 
    email: email.toLowerCase(),
    isGuest: false,
  });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password',
    });
    return;
  }

  // Update last active
  user.profile.lastActive = new Date();
  await user.save();

  // Generate tokens
  const tokens = JWTUtils.generateTokenPair(user);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    message: 'Login successful',
    user: userResponse,
    tokens,
  });
});

export const loginGuest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;

  // Generate unique guest ID
  const guestId = generateGuestId();
  const guestUsername = username || `Guest_${Date.now()}`;

  // Create guest user
  const user = new User({
    username: guestUsername,
    isGuest: true,
    guestId,
    profile: {
      displayName: guestUsername,
    },
    progress: {
      unlockedFeatures: ['basic-games'], // Guests get basic features
    },
  });

  await user.save();

  // Generate access token (no refresh token for guests)
  const tokens = JWTUtils.generateTokenPair(user);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    message: 'Guest session created',
    user: userResponse,
    tokens,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      error: 'Refresh token required',
      message: 'Please provide a refresh token',
    });
    return;
  }

  try {
    const payload = JWTUtils.verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(payload.userId);
    if (!user || user.isGuest) {
      res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found or guest user',
      });
      return;
    }

    // Generate new access token
    const accessToken = JWTUtils.generateAccessToken(user);

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid refresh token',
      message: error instanceof Error ? error.message : 'Token verification failed',
    });
  }
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // For now, logout is handled client-side by removing tokens
  // In a more sophisticated setup, we might maintain a token blacklist
  
  res.json({
    message: 'Logout successful',
  });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'No user found in request',
    });
    return;
  }

  // Update last active
  req.user.profile.lastActive = new Date();
  await req.user.save();

  // Remove password from response
  const userResponse = req.user.toObject();
  delete userResponse.password;

  res.json({
    user: userResponse,
  });
});

export const convertGuestToUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  if (!req.user || !req.user.isGuest) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Only guest users can be converted to registered users',
    });
    return;
  }

  const { email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ 
    email: email.toLowerCase(),
    isGuest: false,
  });

  if (existingUser) {
    res.status(409).json({
      error: 'Email already registered',
      message: 'This email is already associated with another account',
    });
    return;
  }

  // Convert guest to registered user
  req.user.email = email.toLowerCase();
  req.user.password = password;
  req.user.isGuest = false;
  req.user.guestId = undefined;

  await req.user.save();

  // Generate new tokens
  const tokens = JWTUtils.generateTokenPair(req.user);

  // Remove password from response
  const userResponse = req.user.toObject();
  delete userResponse.password;

  res.json({
    message: 'Guest account converted to registered user successfully',
    user: userResponse,
    tokens,
  });
});