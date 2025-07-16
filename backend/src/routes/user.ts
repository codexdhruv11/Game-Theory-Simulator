import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferences,
  getUserProgress,
  getUserAchievements,
  deleteUser,
} from '../controllers/userController';
import { authenticate, requireRegisteredUser } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validation rules
const updateProfileValidation = [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Display name must be 1-50 characters long'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be at most 500 characters'),
  body('favoritePhilosopher')
    .optional()
    .isString()
    .withMessage('Favorite philosopher must be a string'),
];

const updatePreferencesValidation = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'academic', 'neon', 'system'])
    .withMessage('Theme must be one of: light, dark, academic, neon, system'),
  body('notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications must be a boolean'),
  body('privacy')
    .optional()
    .isObject()
    .withMessage('Privacy settings must be an object'),
  body('privacy.showProfile')
    .optional()
    .isBoolean()
    .withMessage('Show profile must be a boolean'),
  body('privacy.showStats')
    .optional()
    .isBoolean()
    .withMessage('Show stats must be a boolean'),
  body('privacy.showAlignment')
    .optional()
    .isBoolean()
    .withMessage('Show alignment must be a boolean'),
];

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateProfileValidation, updateUserProfile);
router.put('/preferences', updatePreferencesValidation, updateUserPreferences);
router.get('/progress', getUserProgress);
router.get('/achievements', getUserAchievements);
router.delete('/account', requireRegisteredUser, deleteUser);

export default router;