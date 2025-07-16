import { Request, Response, NextFunction } from 'express';
import { JWTUtils, JWTPayload } from '../utils/jwt';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  jwtPayload?: JWTPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    const payload = JWTUtils.verifyAccessToken(token);
    
    // Find the user in the database
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found',
      });
      return;
    }

    // Check if guest user and validate guest ID
    if (payload.isGuest && payload.guestId !== user.guestId) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid guest session',
      });
      return;
    }

    // Attach user and payload to request
    req.user = user;
    req.jwtPayload = payload;
    
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({
      error: 'Authentication failed',
      message,
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const payload = JWTUtils.verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    
    if (user) {
      // Check guest user validation
      if (payload.isGuest && payload.guestId !== user.guestId) {
        // Invalid guest session, continue without authentication
        next();
        return;
      }
      
      req.user = user;
      req.jwtPayload = payload;
    }
    
    next();
  } catch (error) {
    // Token verification failed, continue without authentication
    next();
  }
};

export const requireRegisteredUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this feature',
    });
    return;
  }

  if (req.user.isGuest) {
    res.status(403).json({
      error: 'Registration required',
      message: 'This feature requires a registered account',
    });
    return;
  }

  next();
};

export const requireGuestOrRegistered = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in or continue as guest',
    });
    return;
  }

  next();
};