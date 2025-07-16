import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  startGameSession,
  submitGameRound,
  completeGameSession,
  getGameSession,
  getUserGameHistory,
  getGameStats,
} from '@/controllers/gameController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All game routes require authentication
router.use(authenticate);

// Validation rules
const gameTypes = [
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
];

const startGameValidation = [
  body('gameType')
    .isIn(gameTypes)
    .withMessage(`Game type must be one of: ${gameTypes.join(', ')}`),
  body('gameSettings')
    .optional()
    .isObject()
    .withMessage('Game settings must be an object'),
];

const submitRoundValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('roundNumber')
    .isInt({ min: 1 })
    .withMessage('Round number must be a positive integer'),
  body('playerChoices')
    .isObject()
    .withMessage('Player choices must be an object'),
  body('outcomes')
    .isObject()
    .withMessage('Outcomes must be an object'),
  body('scores')
    .isObject()
    .withMessage('Scores must be an object'),
  body('philosopherGuidance')
    .optional()
    .isObject()
    .withMessage('Philosopher guidance must be an object'),
];

const completeGameValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('finalScores')
    .isObject()
    .withMessage('Final scores must be an object'),
  body('winner')
    .optional()
    .isString()
    .withMessage('Winner must be a string'),
];

const sessionIdValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID'),
];

const historyValidation = [
  query('gameType')
    .optional()
    .isIn(gameTypes)
    .withMessage(`Game type must be one of: ${gameTypes.join(', ')}`),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// Routes
router.post('/sessions', startGameValidation, startGameSession);
router.post('/sessions/:sessionId/rounds', submitRoundValidation, submitGameRound);
router.post('/sessions/:sessionId/complete', completeGameValidation, completeGameSession);
router.get('/sessions/:sessionId', sessionIdValidation, getGameSession);
router.get('/history', historyValidation, getUserGameHistory);
router.get('/stats', getGameStats);

export default router;