import { Router } from 'express';
import { getMoralAlignment, getMoralAnalysis } from '@/controllers/moralController';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All moral routes require authentication
router.use(authenticate);

// Routes
router.get('/alignment', getMoralAlignment);
router.get('/analysis', getMoralAnalysis);

export default router;