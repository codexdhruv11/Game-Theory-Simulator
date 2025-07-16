import { Response } from 'express';
import { validationResult } from 'express-validator';
import { GameSession, IGameSession } from '@/models/GameSession';
import { User } from '@/models/User';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { MoralAlignmentAnalyzer } from '@/services/moralAnalysis';
import { StatisticsService } from '@/services/statistics';

export const startGameSession = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      message: 'User must be authenticated to start a game session',
    });
    return;
  }

  const { gameType, gameSettings } = req.body;

  // Create new game session
  const gameSession = new GameSession({
    userId: req.user._id,
    gameType,
    gameData: {
      rounds: [],
      finalScores: new Map(),
      gameSettings: gameSettings || {},
      philosopherGuidance: [],
    },
    completed: false,
    startedAt: new Date(),
  });

  await gameSession.save();

  res.status(201).json({
    message: 'Game session started successfully',
    gameSession: {
      id: gameSession._id,
      gameType: gameSession.gameType,
      startedAt: gameSession.startedAt,
      gameSettings: gameSession.gameData.gameSettings,
    },
  });
});

export const submitGameRound = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      message: 'User must be authenticated to submit game rounds',
    });
    return;
  }

  const { sessionId } = req.params;
  const { roundNumber, playerChoices, outcomes, scores, philosopherGuidance } = req.body;

  // Find game session
  const gameSession = await GameSession.findOne({
    _id: sessionId,
    userId: req.user._id,
    completed: false,
  });

  if (!gameSession) {
    res.status(404).json({
      error: 'Game session not found',
      message: 'Session not found or already completed',
    });
    return;
  }

  // Analyze moral alignment based on choices
  const moralAnalysis = await MoralAlignmentAnalyzer.analyzeDecision(
    gameSession.gameType,
    playerChoices,
    outcomes,
    req.user
  );

  // Create round data
  const roundData = {
    roundNumber,
    playerChoices,
    outcomes,
    scores,
    timestamp: new Date(),
    ...(moralAnalysis && { moralAnalysis }),
  };

  // Add philosopher guidance if provided
  if (philosopherGuidance) {
    gameSession.gameData.philosopherGuidance!.push({
      philosopher: philosopherGuidance.philosopher,
      advice: philosopherGuidance.advice,
      round: roundNumber,
      timestamp: new Date(),
    });
  }

  // Add round to session
  gameSession.gameData.rounds.push(roundData);
  await gameSession.save();

  // Update user's moral alignment
  if (moralAnalysis && moralAnalysis.alignmentImpact) {
    await MoralAlignmentAnalyzer.updateUserAlignment(req.user, moralAnalysis.alignmentImpact);
  }

  res.json({
    message: 'Round submitted successfully',
    round: {
      roundNumber,
      moralAnalysis,
      timestamp: roundData.timestamp,
    },
  });
});

export const completeGameSession = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      message: 'User must be authenticated to complete game sessions',
    });
    return;
  }

  const { sessionId } = req.params;
  const { finalScores, winner } = req.body;

  // Find game session
  const gameSession = await GameSession.findOne({
    _id: sessionId,
    userId: req.user._id,
    completed: false,
  });

  if (!gameSession) {
    res.status(404).json({
      error: 'Game session not found',
      message: 'Session not found or already completed',
    });
    return;
  }

  // Complete the session
  gameSession.gameData.finalScores = finalScores;
  gameSession.gameData.winner = winner;
  gameSession.completed = true;
  gameSession.completedAt = new Date();

  await gameSession.save();

  // Update user statistics
  await StatisticsService.updateUserStats(req.user, gameSession);

  // Update global statistics
  await StatisticsService.updateGlobalStats(gameSession);

  res.json({
    message: 'Game session completed successfully',
    gameSession: {
      id: gameSession._id,
      gameType: gameSession.gameType,
      duration: gameSession.duration,
      finalScores: gameSession.gameData.finalScores,
      winner: gameSession.gameData.winner,
      completedAt: gameSession.completedAt,
    },
  });
});

export const getGameSession = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view game sessions',
    });
    return;
  }

  const { sessionId } = req.params;

  const gameSession = await GameSession.findOne({
    _id: sessionId,
    userId: req.user._id,
  });

  if (!gameSession) {
    res.status(404).json({
      error: 'Game session not found',
      message: 'Session not found or access denied',
    });
    return;
  }

  res.json({
    gameSession: {
      id: gameSession._id,
      gameType: gameSession.gameType,
      gameData: {
        ...gameSession.gameData,
        finalScores: gameSession.gameData.finalScores as any,
        rounds: gameSession.gameData.rounds.map(round => ({
          ...round,
          scores: round.scores,
        })),
      },
      duration: gameSession.duration,
      completed: gameSession.completed,
      startedAt: gameSession.startedAt,
      completedAt: gameSession.completedAt,
    },
  });
});

export const getUserGameHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view game history',
    });
    return;
  }

  const { gameType, limit = 20, offset = 0 } = req.query;

  const filter: any = { userId: req.user._id };
  if (gameType) {
    filter.gameType = gameType;
  }

  const gameSessions = await GameSession.find(filter)
    .sort({ startedAt: -1 })
    .limit(parseInt(limit as string))
    .skip(parseInt(offset as string))
    .select('gameType gameData.finalScores gameData.winner duration completed startedAt completedAt');

  const total = await GameSession.countDocuments(filter);

  res.json({
    gameSessions: gameSessions.map(session => ({
      id: session._id,
      gameType: session.gameType,
      finalScores: session.gameData.finalScores || {},
      winner: session.gameData.winner,
      duration: session.duration,
      completed: session.completed,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    })),
    pagination: {
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
    },
  });
});

export const getGameStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'User must be authenticated to view game statistics',
    });
    return;
  }

  const stats = await StatisticsService.getUserGameStats(req.user._id as any);

  res.json({
    stats,
  });
});