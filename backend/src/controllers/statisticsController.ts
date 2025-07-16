import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { StatisticsService } from '@/services/statistics';

export const getGlobalStatistics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const stats = await StatisticsService.getGlobalStats();

  res.json({
    stats,
  });
});