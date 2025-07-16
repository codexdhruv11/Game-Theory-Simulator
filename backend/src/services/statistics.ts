import mongoose from 'mongoose';
import { IUser } from '@/models/User';
import { IGameSession } from '@/models/GameSession';

export interface UserGameStats {
  totalGamesPlayed: number;
  gamesByType: Record<string, number>;
  totalScore: number;
  averageScore: number;
  winRate: number;
  favoriteGame: string;
  totalPlayTime: number; // in seconds
  averageGameDuration: number;
  achievements: string[];
  recentGames: Array<{
    gameType: string;
    score: number;
    winner: boolean;
    completedAt: Date;
  }>;
}

export interface GlobalStats {
  totalGamesPlayed: number;
  totalUsers: number;
  activeUsers: number; // users active in last 30 days
  gamesByType: Record<string, number>;
  averageSessionDuration: number;
  mostPopularGame: string;
  cooperationRate: number; // for prisoner's dilemma games
  lastUpdated: Date;
}

export class StatisticsService {
  static async updateUserStats(user: IUser, gameSession: IGameSession): Promise<void> {
    // Update basic game stats
    user.gameStats.totalGamesPlayed += 1;
    
    // Calculate total score from final scores
    const userScore = Object.values(gameSession.gameData.finalScores as any).reduce((sum: number, score: any) => sum + score, 0);
    user.gameStats.totalScore += userScore;

    // Update win rate
    const isWinner = gameSession.gameData.winner === 'player1' || gameSession.gameData.winner === user.username;
    if (isWinner) {
      const newWinRate = ((user.gameStats.winRate * (user.gameStats.totalGamesPlayed - 1)) + 100) / user.gameStats.totalGamesPlayed;
      user.gameStats.winRate = Math.round(newWinRate * 100) / 100;
    } else {
      const newWinRate = (user.gameStats.winRate * (user.gameStats.totalGamesPlayed - 1)) / user.gameStats.totalGamesPlayed;
      user.gameStats.winRate = Math.round(newWinRate * 100) / 100;
    }

    // Update favorite game (most played)
    const gameStats = await this.getUserGameStats(user._id as any);
    const mostPlayedGame = Object.entries(gameStats.gamesByType).reduce((a, b) => 
      gameStats.gamesByType[a[0]] > gameStats.gamesByType[b[0]] ? a : b
    );
    user.gameStats.favoriteGame = mostPlayedGame[0];

    // Check for achievements
    const newAchievements = await this.checkAchievements(user, gameSession);
    user.gameStats.achievements = [...new Set([...user.gameStats.achievements, ...newAchievements])];

    // Update experience and level
    const experienceGained = this.calculateExperienceGained(gameSession);
    user.progress.experience += experienceGained;
    
    const newLevel = Math.floor(user.progress.experience / 1000) + 1;
    if (newLevel > user.progress.level) {
      user.progress.level = newLevel;
      // Unlock new features based on level
      const unlockedFeatures = this.getUnlockedFeatures(newLevel);
      user.progress.unlockedFeatures = [...new Set([...user.progress.unlockedFeatures, ...unlockedFeatures])];
    }

    await user.save();
  }

  static async updateGlobalStats(gameSession: IGameSession): Promise<void> {
    // This would typically update a separate GlobalStats collection
    // For now, we'll implement basic tracking
    console.log(`Global stats updated for game: ${gameSession.gameType}`);
  }

  static async getUserGameStats(userId: mongoose.Types.ObjectId): Promise<UserGameStats> {
    const pipeline = [
      { $match: { userId, completed: true } },
      {
        $group: {
          _id: null,
          totalGamesPlayed: { $sum: 1 },
          totalScore: { $sum: { $sum: { $objectToArray: '$gameData.finalScores' } } },
          totalPlayTime: { $sum: '$duration' },
          gamesByType: {
            $push: '$gameType'
          },
          recentGames: {
            $push: {
              gameType: '$gameType',
              finalScores: '$gameData.finalScores',
              winner: '$gameData.winner',
              completedAt: '$completedAt'
            }
          }
        }
      }
    ];

    const result = await mongoose.model('GameSession').aggregate(pipeline);
    
    if (!result.length) {
      return {
        totalGamesPlayed: 0,
        gamesByType: {},
        totalScore: 0,
        averageScore: 0,
        winRate: 0,
        favoriteGame: '',
        totalPlayTime: 0,
        averageGameDuration: 0,
        achievements: [],
        recentGames: [],
      };
    }

    const stats = result[0];
    
    // Process games by type
    const gamesByType: Record<string, number> = {};
    stats.gamesByType.forEach((gameType: string) => {
      gamesByType[gameType] = (gamesByType[gameType] || 0) + 1;
    });

    // Find most popular game
    const favoriteGame = Object.entries(gamesByType).reduce((a, b) => 
      gamesByType[a[0]] > gamesByType[b[0]] ? a : b
    )[0] || '';

    // Process recent games (last 10)
    const recentGames = stats.recentGames
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10)
      .map((game: any) => ({
        gameType: game.gameType,
        score: Array.from(Object.values(game.finalScores)).reduce((sum: number, score: any) => sum + score, 0),
        winner: game.winner === 'player1', // Simplified winner detection
        completedAt: game.completedAt,
      }));

    return {
      totalGamesPlayed: stats.totalGamesPlayed,
      gamesByType,
      totalScore: stats.totalScore,
      averageScore: stats.totalGamesPlayed > 0 ? Math.round(stats.totalScore / stats.totalGamesPlayed) : 0,
      winRate: 0, // This would need more complex calculation
      favoriteGame,
      totalPlayTime: stats.totalPlayTime,
      averageGameDuration: stats.totalGamesPlayed > 0 ? Math.round(stats.totalPlayTime / stats.totalGamesPlayed) : 0,
      achievements: [], // Would be fetched from user document
      recentGames,
    };
  }

  static async getGlobalStats(): Promise<GlobalStats> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalGamesPlayed: { $sum: 1 },
          gamesByType: { $push: '$gameType' },
          totalDuration: { $sum: '$duration' },
          completedGames: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          }
        }
      }
    ];

    const gameStats = await mongoose.model('GameSession').aggregate(pipeline);
    
    const userStats = await mongoose.model('User').aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$profile.lastActive', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const gameData = gameStats[0] || {};
    const userData = userStats[0] || {};

    // Process games by type
    const gamesByType: Record<string, number> = {};
    (gameData.gamesByType || []).forEach((gameType: string) => {
      gamesByType[gameType] = (gamesByType[gameType] || 0) + 1;
    });

    const mostPopularGame = Object.entries(gamesByType).reduce((a, b) => 
      gamesByType[a[0]] > gamesByType[b[0]] ? a : b
    )[0] || '';

    return {
      totalGamesPlayed: gameData.totalGamesPlayed || 0,
      totalUsers: userData.totalUsers || 0,
      activeUsers: userData.activeUsers || 0,
      gamesByType,
      averageSessionDuration: gameData.completedGames > 0 ? Math.round(gameData.totalDuration / gameData.completedGames) : 0,
      mostPopularGame,
      cooperationRate: 0, // Would need specific calculation for prisoner's dilemma
      lastUpdated: new Date(),
    };
  }

  private static async checkAchievements(user: IUser, gameSession: IGameSession): Promise<string[]> {
    const achievements: string[] = [];

    // First game achievement
    if (user.gameStats.totalGamesPlayed === 1) {
      achievements.push('first-game');
    }

    // Game-specific achievements
    if (user.gameStats.totalGamesPlayed === 10) {
      achievements.push('veteran-player');
    }

    if (user.gameStats.totalGamesPlayed === 50) {
      achievements.push('game-master');
    }

    // Cooperation achievements for prisoner's dilemma
    if (gameSession.gameType === 'prisoners-dilemma') {
      const cooperationRounds = gameSession.gameData.rounds.filter(round => 
        round.playerChoices.player1 === 'cooperate' || round.playerChoices.choice === 'cooperate'
      ).length;
      
      if (cooperationRounds === gameSession.gameData.rounds.length && gameSession.gameData.rounds.length >= 5) {
        achievements.push('pure-cooperator');
      }
    }

    // Moral alignment achievements
    const dominantAlignment = this.getDominantAlignment(user);
    if (Math.abs((user.moralAlignment as any)[dominantAlignment]) > 50) {
      achievements.push(`${dominantAlignment}-aligned`);
    }

    return achievements;
  }

  private static calculateExperienceGained(gameSession: IGameSession): number {
    let baseExp = 100; // Base experience per game

    // Bonus for completing longer games
    if (gameSession.gameData.rounds.length > 10) {
      baseExp += 50;
    }

    // Bonus for game duration
    if (gameSession.duration > 300) { // 5 minutes
      baseExp += 25;
    }

    // Bonus for cooperation in prisoner's dilemma
    if (gameSession.gameType === 'prisoners-dilemma') {
      const cooperationRounds = gameSession.gameData.rounds.filter(round => 
        round.playerChoices.player1 === 'cooperate' || round.playerChoices.choice === 'cooperate'
      ).length;
      
      const cooperationRate = cooperationRounds / gameSession.gameData.rounds.length;
      baseExp += Math.round(cooperationRate * 50);
    }

    return baseExp;
  }

  private static getUnlockedFeatures(level: number): string[] {
    const features: string[] = [];

    if (level >= 2) features.push('advanced-games');
    if (level >= 3) features.push('philosopher-guidance');
    if (level >= 5) features.push('moral-alignment-tracking');
    if (level >= 7) features.push('leaderboards');
    if (level >= 10) features.push('custom-games');

    return features;
  }

  private static getDominantAlignment(user: IUser): string {
    const alignments = {
      utilitarian: user.moralAlignment.utilitarian,
      deontological: user.moralAlignment.deontological,
      virtue: user.moralAlignment.virtue,
      contractual: user.moralAlignment.contractual,
      care: user.moralAlignment.care,
    };

    return Object.entries(alignments).reduce((a, b) => 
      alignments[a[0] as keyof typeof alignments] > alignments[b[0] as keyof typeof alignments] ? a : b
    )[0];
  }
}