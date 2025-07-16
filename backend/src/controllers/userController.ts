import { Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { StatisticsService } from '../services/statistics';
import { GameSession } from '../models/GameSession';

export const getUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view profile',
    });
    return;
  }

  // Remove password from response
  const userResponse = req.user.toObject();
  delete userResponse.password;

  res.json({
    user: userResponse,
  });
});

export const updateUserProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to update profile',
    });
    return;
  }

  const { displayName, bio, favoritePhilosopher } = req.body;

  // Update profile fields
  if (displayName !== undefined) {
    req.user.profile.displayName = displayName;
  }
  if (bio !== undefined) {
    req.user.profile.bio = bio;
  }
  if (favoritePhilosopher !== undefined) {
    req.user.profile.favoritePhilosopher = favoritePhilosopher;
  }

  await req.user.save();

  // Remove password from response
  const userResponse = req.user.toObject();
  delete userResponse.password;

  res.json({
    message: 'Profile updated successfully',
    user: userResponse,
  });
});

export const updateUserPreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to update preferences',
    });
    return;
  }

  const { theme, notifications, privacy } = req.body;

  // Update preference fields
  if (theme !== undefined) {
    req.user.preferences.theme = theme;
  }
  if (notifications !== undefined) {
    req.user.preferences.notifications = notifications;
  }
  if (privacy !== undefined) {
    if (privacy.showProfile !== undefined) {
      req.user.preferences.privacy.showProfile = privacy.showProfile;
    }
    if (privacy.showStats !== undefined) {
      req.user.preferences.privacy.showStats = privacy.showStats;
    }
    if (privacy.showAlignment !== undefined) {
      req.user.preferences.privacy.showAlignment = privacy.showAlignment;
    }
  }

  await req.user.save();

  res.json({
    message: 'Preferences updated successfully',
    preferences: req.user.preferences,
  });
});

export const getUserProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view progress',
    });
    return;
  }

  // Get detailed game statistics
  const gameStats = await StatisticsService.getUserGameStats(req.user._id as any);

  res.json({
    progress: req.user.progress,
    gameStats,
    moralAlignment: req.user.moralAlignment,
  });
});

export const getUserAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view achievements',
    });
    return;
  }

  // Get achievement details
  const achievements = req.user.gameStats.achievements.map(achievementId => {
    return {
      id: achievementId,
      ...getAchievementDetails(achievementId),
    };
  });

  res.json({
    achievements,
    totalAchievements: achievements.length,
  });
});

export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to delete account',
    });
    return;
  }

  if (req.user.isGuest) {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Guest accounts cannot be permanently deleted',
    });
    return;
  }

  // Delete all user's game sessions
  await GameSession.deleteMany({ userId: req.user._id });

  // Delete user account
  await req.user.deleteOne();

  res.json({
    message: 'Account deleted successfully',
  });
});

function getAchievementDetails(achievementId: string) {
  const achievements: Record<string, { name: string; description: string; icon: string }> = {
    'first-game': {
      name: 'First Steps',
      description: 'Completed your first game',
      icon: '🎮',
    },
    'veteran-player': {
      name: 'Veteran Player',
      description: 'Completed 10 games',
      icon: '🏆',
    },
    'game-master': {
      name: 'Game Master',
      description: 'Completed 50 games',
      icon: '👑',
    },
    'pure-cooperator': {
      name: 'Pure Cooperator',
      description: 'Cooperated in every round of a Prisoner\'s Dilemma game',
      icon: '🤝',
    },
    'utilitarian-aligned': {
      name: 'Utilitarian Thinker',
      description: 'Strong alignment with utilitarian ethics',
      icon: '⚖️',
    },
    'deontological-aligned': {
      name: 'Duty-Bound',
      description: 'Strong alignment with deontological ethics',
      icon: '📜',
    },
    'virtue-aligned': {
      name: 'Virtuous Character',
      description: 'Strong alignment with virtue ethics',
      icon: '✨',
    },
    'contractual-aligned': {
      name: 'Fair Dealer',
      description: 'Strong alignment with contractual ethics',
      icon: '🤝',
    },
    'care-aligned': {
      name: 'Caring Soul',
      description: 'Strong alignment with care ethics',
      icon: '💝',
    },
  };

  return achievements[achievementId] || {
    name: 'Unknown Achievement',
    description: 'Achievement details not found',
    icon: '❓',
  };
}