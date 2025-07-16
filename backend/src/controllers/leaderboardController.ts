import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '@/models/User';
import { GameSession } from '@/models/GameSession';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import mongoose from 'mongoose';

export const getGlobalLeaderboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  const { category = 'totalScore', gameType, timeframe = 'all', limit = 20, offset = 0 } = req.query;

  let leaderboard;

  switch (category) {
    case 'totalScore':
      leaderboard = await getTotalScoreLeaderboard(
        parseInt(limit as string),
        parseInt(offset as string),
        gameType as string,
        timeframe as string
      );
      break;
    case 'winRate':
      leaderboard = await getWinRateLeaderboard(
        parseInt(limit as string),
        parseInt(offset as string),
        gameType as string,
        timeframe as string
      );
      break;
    case 'gamesPlayed':
      leaderboard = await getGamesPlayedLeaderboard(
        parseInt(limit as string),
        parseInt(offset as string),
        gameType as string,
        timeframe as string
      );
      break;
    case 'level':
      leaderboard = await getLevelLeaderboard(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      break;
    case 'cooperation':
      leaderboard = await getCooperationLeaderboard(
        parseInt(limit as string),
        parseInt(offset as string),
        timeframe as string
      );
      break;
    default:
      res.status(400).json({
        error: 'Invalid category',
        message: 'Category must be one of: totalScore, winRate, gamesPlayed, level, cooperation',
      });
      return;
  }

  res.json({
    leaderboard,
    category,
    gameType: gameType || 'all',
    timeframe,
  });
});

export const getUserRanking = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view ranking',
    });
    return;
  }

  const { category = 'totalScore', gameType } = req.query;

  const ranking = await getUserRankingInCategory(
    req.user._id as any,
    category as string,
    gameType as string
  );

  res.json({
    ranking,
    category,
    gameType: gameType || 'all',
  });
});

async function getTotalScoreLeaderboard(limit: number, offset: number, gameType?: string, timeframe?: string) {
  const matchStage: any = { isGuest: false };
  
  // Add timeframe filter if specified
  if (timeframe && timeframe !== 'all') {
    const timeFilter = getTimeFilter(timeframe);
    if (timeFilter) {
      matchStage['profile.lastActive'] = { $gte: timeFilter };
    }
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'gamesessions',
        localField: '_id',
        foreignField: 'userId',
        as: 'sessions',
        pipeline: gameType ? [{ $match: { gameType, completed: true } }] : [{ $match: { completed: true } }]
      }
    },
    {
      $addFields: {
        totalScore: {
          $sum: {
            $map: {
              input: '$sessions',
              as: 'session',
              in: { $sum: { $objectToArray: '$$session.gameData.finalScores' } }
            }
          }
        },
        gamesPlayed: { $size: '$sessions' }
      }
    },
    { $match: { gamesPlayed: { $gt: 0 } } },
    { $sort: { totalScore: -1 as any } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        username: 1,
        'profile.displayName': 1,
        'profile.avatar': 1,
        totalScore: 1,
        gamesPlayed: 1,
        'gameStats.winRate': 1,
        'progress.level': 1
      }
    }
  ];

  return await User.aggregate(pipeline);
}

async function getWinRateLeaderboard(limit: number, offset: number, gameType?: string, timeframe?: string) {
  const matchStage: any = { 
    isGuest: false,
    'gameStats.totalGamesPlayed': { $gte: 5 } // Minimum games for win rate ranking
  };

  if (timeframe && timeframe !== 'all') {
    const timeFilter = getTimeFilter(timeframe);
    if (timeFilter) {
      matchStage['profile.lastActive'] = { $gte: timeFilter };
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { 'gameStats.winRate': -1 as any, 'gameStats.totalGamesPlayed': -1 as any } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        username: 1,
        'profile.displayName': 1,
        'profile.avatar': 1,
        'gameStats.winRate': 1,
        'gameStats.totalGamesPlayed': 1,
        'progress.level': 1
      }
    }
  ];

  return await User.aggregate(pipeline);
}

async function getGamesPlayedLeaderboard(limit: number, offset: number, gameType?: string, timeframe?: string) {
  const matchStage: any = { isGuest: false };

  if (timeframe && timeframe !== 'all') {
    const timeFilter = getTimeFilter(timeframe);
    if (timeFilter) {
      matchStage['profile.lastActive'] = { $gte: timeFilter };
    }
  }

  const pipeline = [
    { $match: matchStage },
    { $sort: { 'gameStats.totalGamesPlayed': -1 as any } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        username: 1,
        'profile.displayName': 1,
        'profile.avatar': 1,
        'gameStats.totalGamesPlayed': 1,
        'gameStats.totalScore': 1,
        'progress.level': 1
      }
    }
  ];

  return await User.aggregate(pipeline);
}

async function getLevelLeaderboard(limit: number, offset: number) {
  const pipeline = [
    { $match: { isGuest: false } },
    { $sort: { 'progress.level': -1 as any, 'progress.experience': -1 as any } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        username: 1,
        'profile.displayName': 1,
        'profile.avatar': 1,
        'progress.level': 1,
        'progress.experience': 1,
        'gameStats.totalGamesPlayed': 1
      }
    }
  ];

  return await User.aggregate(pipeline);
}

async function getCooperationLeaderboard(limit: number, offset: number, timeframe?: string) {
  // This would require analyzing prisoner's dilemma games for cooperation rate
  const timeFilter = timeframe && timeframe !== 'all' ? getTimeFilter(timeframe) : null;
  
  const matchStage: any = {
    gameType: 'prisoners-dilemma',
    completed: true,
  };

  if (timeFilter) {
    matchStage.completedAt = { $gte: timeFilter };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        cooperationRate: {
          $divide: [
            {
              $size: {
                $filter: {
                  input: '$gameData.rounds',
                  cond: {
                    $or: [
                      { $eq: ['$$this.playerChoices.player1', 'cooperate'] },
                      { $eq: ['$$this.playerChoices.choice', 'cooperate'] }
                    ]
                  }
                }
              }
            },
            { $size: '$gameData.rounds' }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$userId',
        avgCooperationRate: { $avg: '$cooperationRate' },
        gamesPlayed: { $sum: 1 }
      }
    },
    { $match: { gamesPlayed: { $gte: 3 } } }, // Minimum games for cooperation ranking
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $match: { 'user.isGuest': false } },
    { $sort: { avgCooperationRate: -1 as any } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        username: '$user.username',
        'profile.displayName': '$user.profile.displayName',
        'profile.avatar': '$user.profile.avatar',
        cooperationRate: { $multiply: ['$avgCooperationRate', 100] },
        gamesPlayed: 1,
        'progress.level': '$user.progress.level'
      }
    }
  ];

  return await GameSession.aggregate(pipeline);
}

async function getUserRankingInCategory(userId: mongoose.Types.ObjectId, category: string, gameType?: string) {
  // This would calculate the user's specific ranking in the given category
  // Implementation would depend on the specific category
  
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  let rank = 0;
  let total = 0;

  switch (category) {
    case 'totalScore':
      const scoreRanking = await User.countDocuments({
        isGuest: false,
        'gameStats.totalScore': { $gt: user.gameStats.totalScore }
      });
      rank = scoreRanking + 1;
      total = await User.countDocuments({ isGuest: false, 'gameStats.totalGamesPlayed': { $gt: 0 } });
      break;

    case 'level':
      const levelRanking = await User.countDocuments({
        isGuest: false,
        $or: [
          { 'progress.level': { $gt: user.progress.level } },
          {
            'progress.level': user.progress.level,
            'progress.experience': { $gt: user.progress.experience }
          }
        ]
      });
      rank = levelRanking + 1;
      total = await User.countDocuments({ isGuest: false });
      break;

    default:
      return null;
  }

  return {
    rank,
    total,
    percentile: Math.round(((total - rank + 1) / total) * 100),
  };
}

function getTimeFilter(timeframe: string): Date | null {
  const now = new Date();
  
  switch (timeframe) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}