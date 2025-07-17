import { useState, useEffect } from 'react';

// Types
export type Move = 'cooperate' | 'defect';
export type GameResult = {
  playerMove: Move;
  opponentMove: Move;
  playerScore: number;
  opponentScore: number;
  round?: number;
};

export type Strategy = {
  name: string;
  description: string;
  execute: (history: GameResult[], currentRound: number) => Move;
  characteristics?: {
    nice?: number;
    forgiving?: number;
    retaliating?: number;
    complexity?: number;
    memory?: number;
  };
};

export type TournamentResult = {
  strategy: string;
  totalScore: number;
  wins: number;
  losses: number;
  ties: number;
  averageScore: number;
  cooperationRate: number;
  rank?: number;
};

// Constants
export const PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
};

// Predefined strategies
export const STRATEGIES: Record<string, Strategy> = {
  alwaysCooperate: {
    name: "Always Cooperate",
    description: "Always chooses to cooperate regardless of opponent's moves",
    execute: () => 'cooperate',
    characteristics: {
      nice: 100,
      forgiving: 100,
      retaliating: 0,
      complexity: 0,
      memory: 0
    }
  },
  alwaysDefect: {
    name: "Always Defect",
    description: "Always chooses to defect regardless of opponent's moves",
    execute: () => 'defect',
    characteristics: {
      nice: 0,
      forgiving: 0,
      retaliating: 100,
      complexity: 0,
      memory: 0
    }
  },
  titForTat: {
    name: "Tit for Tat",
    description: "Starts with cooperation, then copies opponent's previous move",
    execute: (history) => {
      if (history.length === 0) return 'cooperate';
      return history[history.length - 1].opponentMove;
    },
    characteristics: {
      nice: 70,
      forgiving: 50,
      retaliating: 100,
      complexity: 30,
      memory: 10
    }
  },
  grudger: {
    name: "Grudger",
    description: "Cooperates until opponent defects, then always defects",
    execute: (history) => {
      return history.some(result => result.opponentMove === 'defect') 
        ? 'defect' 
        : 'cooperate';
    },
    characteristics: {
      nice: 50,
      forgiving: 0,
      retaliating: 100,
      complexity: 40,
      memory: 100
    }
  },
  random: {
    name: "Random",
    description: "Makes random choices with no pattern",
    execute: () => Math.random() < 0.5 ? 'cooperate' : 'defect',
    characteristics: {
      nice: 50,
      forgiving: 50,
      retaliating: 50,
      complexity: 10,
      memory: 0
    }
  },
  pavlov: {
    name: "Pavlov",
    description: "Repeats move if successful, switches if unsuccessful",
    execute: (history) => {
      if (history.length === 0) return 'cooperate';
      const lastResult = history[history.length - 1];
      // If got a good outcome (3 or 5 points), repeat the move
      return (lastResult.playerScore === 3 || lastResult.playerScore === 5) 
        ? lastResult.playerMove 
        : (lastResult.playerMove === 'cooperate' ? 'defect' : 'cooperate');
    },
    characteristics: {
      nice: 60,
      forgiving: 70,
      retaliating: 60,
      complexity: 70,
      memory: 20
    }
  },
  titForTwoTats: {
    name: "Tit for Two Tats",
    description: "Only defects after opponent defects twice in a row",
    execute: (history) => {
      if (history.length < 2) return 'cooperate';
      return (history[history.length - 1].opponentMove === 'defect' && 
              history[history.length - 2].opponentMove === 'defect')
        ? 'defect'
        : 'cooperate';
    },
    characteristics: {
      nice: 80,
      forgiving: 80,
      retaliating: 60,
      complexity: 50,
      memory: 20
    }
  }
};

// Game utility functions
export function calculateScore(playerMove: Move, opponentMove: Move): [number, number] {
  return PAYOFF_MATRIX[playerMove][opponentMove] as [number, number];
}

export function playIteration(playerStrategy: Strategy, opponentStrategy: Strategy, history: GameResult[] = []): GameResult {
  const currentRound = history.length;
  const playerMove = playerStrategy.execute(history, currentRound);
  
  // Create a reversed history for the opponent's perspective
  const opponentHistory = history.map(result => ({
    playerMove: result.opponentMove,
    opponentMove: result.playerMove,
    playerScore: result.opponentScore,
    opponentScore: result.playerScore,
    round: result.round
  }));
  
  const opponentMove = opponentStrategy.execute(opponentHistory, currentRound);
  const [playerScore, opponentScore] = calculateScore(playerMove, opponentMove);
  
  return {
    playerMove,
    opponentMove,
    playerScore,
    opponentScore,
    round: currentRound + 1
  };
}

export function runGame(playerStrategy: Strategy, opponentStrategy: Strategy, rounds: number): GameResult[] {
  const history: GameResult[] = [];
  
  for (let i = 0; i < rounds; i++) {
    history.push(playIteration(playerStrategy, opponentStrategy, history));
  }
  
  return history;
}

// Analysis functions
export function calculateGameStats(results: GameResult[]) {
  if (results.length === 0) return null;
  
  const totalPlayerScore = results.reduce((sum, result) => sum + result.playerScore, 0);
  const totalOpponentScore = results.reduce((sum, result) => sum + result.opponentScore, 0);
  const playerCooperationCount = results.filter(r => r.playerMove === 'cooperate').length;
  const opponentCooperationCount = results.filter(r => r.opponentMove === 'cooperate').length;
  
  return {
    totalPlayerScore,
    totalOpponentScore,
    averagePlayerScore: totalPlayerScore / results.length,
    averageOpponentScore: totalOpponentScore / results.length,
    playerCooperationRate: playerCooperationCount / results.length,
    opponentCooperationRate: opponentCooperationCount / results.length,
    mutualCooperationRate: results.filter(r => r.playerMove === 'cooperate' && r.opponentMove === 'cooperate').length / results.length,
    mutualDefectionRate: results.filter(r => r.playerMove === 'defect' && r.opponentMove === 'defect').length / results.length,
    playerWins: results.filter(r => r.playerScore > r.opponentScore).length,
    opponentWins: results.filter(r => r.playerScore < r.opponentScore).length,
    ties: results.filter(r => r.playerScore === r.opponentScore).length,
    totalRounds: results.length
  };
}

export function analyzeStrategy(strategy: Strategy): Record<string, number> {
  const characteristics = strategy.characteristics || {};
  
  // Default values if characteristics are missing
  return {
    nice: characteristics.nice ?? 50,
    forgiving: characteristics.forgiving ?? 50,
    retaliating: characteristics.retaliating ?? 50,
    complexity: characteristics.complexity ?? 50,
    memory: characteristics.memory ?? 50
  };
}

export function runTournament(strategies: Strategy[], rounds: number = 100): TournamentResult[] {
  const results: TournamentResult[] = [];
  
  // Initialize results
  strategies.forEach(strategy => {
    results.push({
      strategy: strategy.name,
      totalScore: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      averageScore: 0,
      cooperationRate: 0
    });
  });
  
  // Run each strategy against all others
  for (let i = 0; i < strategies.length; i++) {
    for (let j = 0; j < strategies.length; j++) {
      if (i === j) continue; // Skip playing against self
      
      const gameResults = runGame(strategies[i], strategies[j], rounds);
      const stats = calculateGameStats(gameResults);
      
      if (!stats) continue;
      
      // Update results for strategy i
      const resultIndex = results.findIndex(r => r.strategy === strategies[i].name);
      if (resultIndex >= 0) {
        results[resultIndex].totalScore += stats.totalPlayerScore;
        results[resultIndex].cooperationRate += stats.playerCooperationRate;
        
        if (stats.totalPlayerScore > stats.totalOpponentScore) {
          results[resultIndex].wins += 1;
        } else if (stats.totalPlayerScore < stats.totalOpponentScore) {
          results[resultIndex].losses += 1;
        } else {
          results[resultIndex].ties += 1;
        }
      }
    }
  }
  
  // Calculate averages and ranks
  const totalMatches = strategies.length - 1;
  results.forEach((result: TournamentResult) => {
    result.averageScore = result.totalScore / (totalMatches * rounds);
    result.cooperationRate = result.cooperationRate / totalMatches;
  });
  
  // Sort by average score and assign ranks
  return results
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((result, index) => ({
      ...result,
      rank: index + 1
    }));
}

export function generateInsights(results: GameResult[]): string[] {
  const insights: string[] = [];
  const stats = calculateGameStats(results);
  
  if (!stats) return insights;
  
  // Cooperation patterns
  if (stats.playerCooperationRate > 0.8) {
    insights.push("You're very cooperative! This works well with nice strategies but can be exploited.");
  } else if (stats.playerCooperationRate < 0.2) {
    insights.push("You rarely cooperate. This can maximize short-term gains but may hurt long-term outcomes.");
  }
  
  // Response to defection
  const defectionResponses = results.slice(1).filter((result, i) => 
    results[i].opponentMove === 'defect'
  );
  
  const retaliationRate = defectionResponses.length > 0 
    ? defectionResponses.filter(r => r.playerMove === 'defect').length / defectionResponses.length
    : 0;
  
  if (retaliationRate > 0.8) {
    insights.push("You strongly retaliate against defection. This can discourage exploitation.");
  } else if (retaliationRate < 0.2) {
    insights.push("You rarely retaliate against defection, which may encourage continued exploitation.");
  }
  
  // Pattern recognition
  if (stats.mutualCooperationRate > 0.6) {
    insights.push("You've established mutual cooperation frequently, maximizing collective outcomes.");
  } else if (stats.mutualDefectionRate > 0.6) {
    insights.push("You're stuck in mutual defection often, creating suboptimal outcomes for both players.");
  }
  
  return insights;
}

// React hooks
export function useGameHistory(initialHistory: GameResult[] = []) {
  const [history, setHistory] = useState<GameResult[]>(initialHistory);
  const [stats, setStats] = useState(() => calculateGameStats(initialHistory) || {
    totalPlayerScore: 0,
    totalOpponentScore: 0,
    averagePlayerScore: 0,
    averageOpponentScore: 0,
    playerCooperationRate: 0,
    opponentCooperationRate: 0,
    mutualCooperationRate: 0,
    mutualDefectionRate: 0,
    playerWins: 0,
    opponentWins: 0,
    ties: 0,
    totalRounds: 0
  });
  
  useEffect(() => {
    setStats(calculateGameStats(history) || stats);
  }, [history, stats]);
  
  const addResult = (result: GameResult) => {
    setHistory(prev => [...prev, result]);
  };
  
  const resetHistory = () => {
    setHistory([]);
  };
  
  return {
    history,
    stats,
    addResult,
    resetHistory
  };
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
  unlocked?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game of Prisoner\'s Dilemma',
    icon: '🎮',
    condition: (stats) => stats.totalRounds >= 1
  },
  {
    id: 'cooperation_streak',
    name: 'Peace Maker',
    description: 'Cooperate 5 times in a row',
    icon: '🕊️',
    condition: (stats) => {
      const history = stats.history || [];
      let streak = 0;
      for (const result of history) {
        if (result.playerMove === 'cooperate') {
          streak++;
          if (streak >= 5) return true;
        } else {
          streak = 0;
        }
      }
      return false;
    }
  },
  {
    id: 'defection_master',
    name: 'Opportunist',
    description: 'Score at least 5 points in a single round',
    icon: '💰',
    condition: (stats) => {
      const history = stats.history || [];
      return history.some(result => result.playerScore >= 5);
    }
  },
  {
    id: 'balanced_player',
    name: 'Balanced Player',
    description: 'Maintain a cooperation rate between 40-60%',
    icon: '⚖️',
    condition: (stats) => {
      return stats.playerCooperationRate >= 0.4 && 
             stats.playerCooperationRate <= 0.6 && 
             stats.totalRounds >= 10;
    }
  },
  {
    id: 'tournament_winner',
    name: 'Tournament Champion',
    description: 'Win a tournament against at least 3 other strategies',
    icon: '🏆',
    condition: (stats) => {
      return stats.tournamentRank === 1 && stats.tournamentParticipants >= 4;
    }
  }
];

export function checkAchievements(stats: any, unlockedAchievements: string[] = []): Achievement[] {
  return ACHIEVEMENTS
    .filter(achievement => !unlockedAchievements.includes(achievement.id) && achievement.condition(stats))
    .map((achievement: Achievement) => ({ ...achievement, unlocked: true }));
} 