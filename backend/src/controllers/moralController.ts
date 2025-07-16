import { Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { MoralAlignmentAnalyzer } from '@/services/moralAnalysis';
import { GameSession } from '@/models/GameSession';

export const getMoralAlignment = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view moral alignment',
    });
    return;
  }

  const dominantAlignment = MoralAlignmentAnalyzer.getDominantAlignment(req.user);
  const alignmentDescription = MoralAlignmentAnalyzer.getAlignmentDescription(dominantAlignment);

  res.json({
    alignment: req.user.moralAlignment,
    dominant: {
      type: dominantAlignment,
      description: alignmentDescription,
    },
    lastUpdated: req.user.moralAlignment.lastUpdated,
  });
});

export const getMoralAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view moral analysis',
    });
    return;
  }

  // Get recent game sessions with moral analysis
  const recentSessions = await GameSession.find({
    userId: req.user._id,
    completed: true,
    'gameData.rounds.moralAnalysis': { $exists: true },
  })
    .sort({ completedAt: -1 })
    .limit(10)
    .select('gameType gameData.rounds.moralAnalysis completedAt');

  const moralDecisions = recentSessions.flatMap(session =>
    session.gameData.rounds
      .filter(round => round.moralAnalysis)
      .map(round => ({
        gameType: session.gameType,
        decision: round.moralAnalysis!.decision,
        reasoning: round.moralAnalysis!.reasoning,
        alignmentImpact: round.moralAnalysis!.alignmentImpact,
        timestamp: round.timestamp,
        sessionDate: session.completedAt,
      }))
  );

  // Calculate alignment trends
  const alignmentTrends = calculateAlignmentTrends(moralDecisions);

  res.json({
    recentDecisions: moralDecisions.slice(0, 20),
    trends: alignmentTrends,
    summary: {
      totalDecisions: moralDecisions.length,
      dominantAlignment: MoralAlignmentAnalyzer.getDominantAlignment(req.user),
      alignmentStrength: getAlignmentStrength(req.user),
    },
  });
});

function calculateAlignmentTrends(decisions: any[]): Record<string, number[]> {
  const trends: Record<string, number[]> = {
    utilitarian: [],
    deontological: [],
    virtue: [],
    contractual: [],
    care: [],
  };

  // Group decisions by week and calculate average impact
  const weeklyData: Record<string, Record<string, number[]>> = {};
  
  decisions.forEach(decision => {
    const week = getWeekKey(decision.timestamp);
    if (!weeklyData[week]) {
      weeklyData[week] = {
        utilitarian: [],
        deontological: [],
        virtue: [],
        contractual: [],
        care: [],
      };
    }

    Object.entries(decision.alignmentImpact).forEach(([alignment, impact]) => {
      weeklyData[week][alignment].push(impact as number);
    });
  });

  // Calculate weekly averages
  Object.entries(weeklyData).forEach(([week, alignments]) => {
    Object.entries(alignments).forEach(([alignment, impacts]) => {
      const average = impacts.length > 0 
        ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length 
        : 0;
      trends[alignment].push(average);
    });
  });

  return trends;
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `${year}-W${week}`;
}

function getAlignmentStrength(user: any): string {
  const alignments = user.moralAlignment;
  const maxAlignment = Math.max(
    Math.abs(alignments.utilitarian),
    Math.abs(alignments.deontological),
    Math.abs(alignments.virtue),
    Math.abs(alignments.contractual),
    Math.abs(alignments.care)
  );

  if (maxAlignment < 20) return 'Developing';
  if (maxAlignment < 50) return 'Moderate';
  if (maxAlignment < 80) return 'Strong';
  return 'Very Strong';
}