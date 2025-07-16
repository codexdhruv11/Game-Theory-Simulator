import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllPhilosophers,
  getPhilosopher,
  getPhilosopherGuidance,
  ratePhilosopher,
} from '@/controllers/philosopherController';
import { optionalAuth, authenticate } from '@/middleware/auth';

const router = Router();

// Validation rules
const philosopherSlugValidation = [
  param('slug')
    .isSlug()
    .withMessage('Invalid philosopher slug'),
];

const guidanceValidation = [
  param('slug')
    .isSlug()
    .withMessage('Invalid philosopher slug'),
  query('gameType')
    .isIn([
      'prisoners-dilemma',
      'nash-equilibrium',
      'zero-sum-game',
      'auction-theory',
      'evolutionary-game',
      'repeated-games',
      'network-games',
      'cooperative-games',
    ])
    .withMessage('Invalid game type'),
  query('situation')
    .optional()
    .isString()
    .withMessage('Situation must be a string'),
];

const ratingValidation = [
  param('slug')
    .isSlug()
    .withMessage('Invalid philosopher slug'),
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

const listValidation = [
  query('era')
    .optional()
    .isIn(['Ancient', 'Medieval', 'Renaissance', 'Enlightenment', 'Modern', 'Contemporary'])
    .withMessage('Invalid era'),
  query('school')
    .optional()
    .isString()
    .withMessage('School must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// Routes
router.get('/', listValidation, getAllPhilosophers);
router.get('/:slug', philosopherSlugValidation, getPhilosopher);
router.get('/:slug/guidance', guidanceValidation, optionalAuth, getPhilosopherGuidance);
router.post('/:slug/rate', ratingValidation, authenticate, ratePhilosopher);

export default router;