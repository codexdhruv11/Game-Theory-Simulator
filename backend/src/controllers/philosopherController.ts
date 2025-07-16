import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Philosopher, IPhilosopher } from '@/models/Philosopher';
import { asyncHandler } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

export const getAllPhilosophers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { era, school, limit = 20, offset = 0 } = req.query;

  const filter: any = { isActive: true };
  if (era) filter.era = era;
  if (school) filter.school = school;

  const philosophers = await Philosopher.find(filter)
    .sort({ 'popularity.timesSelected': -1 })
    .limit(parseInt(limit as string))
    .skip(parseInt(offset as string))
    .select('-gameGuidance'); // Exclude detailed guidance from list view

  const total = await Philosopher.countDocuments(filter);

  res.json({
    philosophers,
    pagination: {
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
    },
  });
});

export const getPhilosopher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const philosopher = await Philosopher.findOne({ slug, isActive: true });

  if (!philosopher) {
    res.status(404).json({
      error: 'Philosopher not found',
      message: 'The requested philosopher could not be found',
    });
    return;
  }

  res.json({
    philosopher,
  });
});

export const getPhilosopherGuidance = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const { gameType, situation } = req.query;

  const philosopher = await Philosopher.findOne({ slug, isActive: true });

  if (!philosopher) {
    res.status(404).json({
      error: 'Philosopher not found',
      message: 'The requested philosopher could not be found',
    });
    return;
  }

  // Get game-specific guidance
  const guidance = getGameGuidance(philosopher, gameType as string, situation as string);

  // Update philosopher popularity
  philosopher.popularity.timesSelected += 1;
  await philosopher.save();

  res.json({
    philosopher: {
      name: philosopher.name,
      slug: philosopher.slug,
      avatar: philosopher.avatar,
    },
    guidance,
  });
});

export const ratePhilosopher = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      message: 'User must be authenticated to rate philosophers',
    });
    return;
  }

  const { slug } = req.params;
  const { rating } = req.body;

  const philosopher = await Philosopher.findOne({ slug, isActive: true });

  if (!philosopher) {
    res.status(404).json({
      error: 'Philosopher not found',
      message: 'The requested philosopher could not be found',
    });
    return;
  }

  // Update rating (simplified - in production, you'd track individual user ratings)
  const newTotalRatings = philosopher.popularity.totalRatings + 1;
  const newAverageRating = (
    (philosopher.popularity.averageRating * philosopher.popularity.totalRatings) + rating
  ) / newTotalRatings;

  philosopher.popularity.totalRatings = newTotalRatings;
  philosopher.popularity.averageRating = Math.round(newAverageRating * 100) / 100;

  await philosopher.save();

  res.json({
    message: 'Rating submitted successfully',
    averageRating: philosopher.popularity.averageRating,
    totalRatings: philosopher.popularity.totalRatings,
  });
});

function getGameGuidance(philosopher: IPhilosopher, gameType: string, situation?: string): any {
  const gameGuidance = philosopher.gameGuidance;

  switch (gameType) {
    case 'prisoners-dilemma':
      return {
        type: 'prisoners-dilemma',
        cooperationAdvice: gameGuidance.prisonersDilemma.cooperationAdvice,
        defectionAdvice: gameGuidance.prisonersDilemma.defectionAdvice,
        generalStrategy: gameGuidance.prisonersDilemma.generalStrategy,
        reasoning: gameGuidance.prisonersDilemma.reasoning,
        quote: getRelevantQuote(philosopher, 'cooperation'),
      };

    case 'nash-equilibrium':
      return {
        type: 'nash-equilibrium',
        advice: gameGuidance.nashEquilibrium.advice,
        reasoning: gameGuidance.nashEquilibrium.reasoning,
        quote: getRelevantQuote(philosopher, 'strategy'),
      };

    case 'zero-sum-game':
      return {
        type: 'zero-sum-game',
        advice: gameGuidance.zeroSumGame.advice,
        reasoning: gameGuidance.zeroSumGame.reasoning,
        quote: getRelevantQuote(philosopher, 'competition'),
      };

    case 'auction-theory':
      return {
        type: 'auction-theory',
        biddingAdvice: gameGuidance.auctionTheory.biddingAdvice,
        reasoning: gameGuidance.auctionTheory.reasoning,
        quote: getRelevantQuote(philosopher, 'value'),
      };

    case 'evolutionary-game':
      return {
        type: 'evolutionary-game',
        strategyAdvice: gameGuidance.evolutionaryGame.strategyAdvice,
        reasoning: gameGuidance.evolutionaryGame.reasoning,
        quote: getRelevantQuote(philosopher, 'evolution'),
      };

    case 'repeated-games':
      return {
        type: 'repeated-games',
        longTermStrategy: gameGuidance.repeatedGames.longTermStrategy,
        cooperationThreshold: gameGuidance.repeatedGames.cooperationThreshold,
        reasoning: gameGuidance.repeatedGames.reasoning,
        quote: getRelevantQuote(philosopher, 'reputation'),
      };

    case 'network-games':
      return {
        type: 'network-games',
        coordinationAdvice: gameGuidance.networkGames.coordinationAdvice,
        reasoning: gameGuidance.networkGames.reasoning,
        quote: getRelevantQuote(philosopher, 'society'),
      };

    case 'cooperative-games':
      return {
        type: 'cooperative-games',
        coalitionAdvice: gameGuidance.cooperativeGames.coalitionAdvice,
        reasoning: gameGuidance.cooperativeGames.reasoning,
        quote: getRelevantQuote(philosopher, 'cooperation'),
      };

    default:
      return {
        type: 'general',
        advice: 'Consider the ethical implications of your choices and their consequences for all involved.',
        reasoning: philosopher.philosophy.ethicalFramework,
        quote: philosopher.philosophy.keyQuotes[0] || null,
      };
  }
}

function getRelevantQuote(philosopher: IPhilosopher, context: string): any {
  // Simple quote selection based on context
  const quotes = philosopher.philosophy.keyQuotes;
  if (!quotes.length) return null;

  // Try to find a relevant quote based on context
  const relevantQuote = quotes.find(quote => 
    quote.context.toLowerCase().includes(context) ||
    quote.text.toLowerCase().includes(context)
  );

  return relevantQuote || quotes[0];
}