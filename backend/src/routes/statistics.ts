import { Router } from 'express';
import { getGlobalStatistics } from '@/controllers/statisticsController';

const router = Router();

// Routes
router.get('/global', getGlobalStatistics);

export default router;