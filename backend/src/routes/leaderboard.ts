import { Router } from 'express';
import { query } from 'express-validator';
import {
  getGlobalLeaderboard,
  getUserRanking,
} from '@/controllers/leaderboardController';
import { optionalAuth, authenticate } from '@/middleware/auth';

const router = Router();

// Validation rules
const leaderboardValidation = [
  query('category')
    .optional()
    .isIn(['totalScore', 'winRate', 'gamesPlayed', 'level', 'cooperation'])
    .withMessage('Category must be one of: totalScore, winRate, gamesPlayed, level, cooperation'),
  query('gameType')
    .optional()
    .isIn([
      'prisoners-dilemma',
      'nash-equilibrium',
      'zero-sum-game',
      'auction-simulator',
      'evolutionary-game',
      'network-game',
      'cooperative-game',
      'mechanism-design',
      'behavioral-economics',
      'signaling-game',
      'matching-theory',
      'voting-theory',
      'repeated-games'
    ])
    .withMessage('Invalid game type'),
  query('timeframe')
    .optional()
    .isIn(['all', 'week', 'month', 'year'])
    .withMessage('Timeframe must be one of: all, week, month, year'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

const rankingValidation = [
  query('category')
    .optional()
    .isIn(['totalScore', 'winRate', 'gamesPlayed', 'level', 'cooperation'])
    .withMessage('Category must be one of: totalScore, winRate, gamesPlayed, level, cooperation'),
  query('gameType')
    .optional()
    .isString()
    .withMessage('Game type must be a string'),
];

// Routes
router.get('/global', leaderboardValidation, getGlobalLeaderboard);
router.get('/my-ranking', rankingValidation, authenticate, getUserRanking);

export default router;