import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JWTPayload {
  userId: string;
  username: string;
  isGuest: boolean;
  guestId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTUtils {
  private static getSecret(type: 'access' | 'refresh' = 'access'): string {
    const secret = type === 'access' 
      ? process.env.JWT_SECRET 
      : process.env.JWT_REFRESH_SECRET;
    
    if (!secret) {
      throw new Error(`JWT ${type} secret is not defined in environment variables`);
    }
    return secret;
  }

  private static getExpiresIn(type: 'access' | 'refresh' | 'guest' = 'access'): string {
    switch (type) {
      case 'refresh':
        return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      case 'guest':
        return process.env.JWT_GUEST_EXPIRES_IN || '24h';
      default:
        return process.env.JWT_EXPIRES_IN || '15m';
    }
  }

  static generateAccessToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      username: user.username,
      isGuest: user.isGuest,
      ...(user.isGuest && user.guestId && { guestId: user.guestId }),
    };

    const expiresIn = user.isGuest 
      ? this.getExpiresIn('guest') 
      : this.getExpiresIn('access');

    return jwt.sign(payload, this.getSecret('access'), {
      expiresIn,
      issuer: 'game-theory-simulator',
      audience: 'game-theory-simulator-frontend',
    } as any);
  }

  static generateRefreshToken(user: IUser): string {
    if (user.isGuest) {
      throw new Error('Refresh tokens are not available for guest users');
    }

    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      username: user.username,
      isGuest: false,
    };

    return jwt.sign(payload, this.getSecret('refresh'), {
      expiresIn: this.getExpiresIn('refresh'),
      issuer: 'game-theory-simulator',
      audience: 'game-theory-simulator-frontend',
    } as any);
  }

  static generateTokenPair(user: IUser): TokenPair {
    if (user.isGuest) {
      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: '', // No refresh token for guests
      };
    }

    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.getSecret('access'), {
        issuer: 'game-theory-simulator',
        audience: 'game-theory-simulator-frontend',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.getSecret('refresh'), {
        issuer: 'game-theory-simulator',
        audience: 'game-theory-simulator-frontend',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token);
    if (!expiry) {
      return true;
    }
    return expiry.getTime() <= Date.now();
  }
}