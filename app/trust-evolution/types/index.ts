// Core game types
export type Move = "cooperate" | "defect"

export interface GameResult {
  player1Move: Move
  player2Move: Move
  player1Score: number
  player2Score: number
  round: number
}

export interface PayoffMatrix {
  cooperate: {
    cooperate: [number, number]
    defect: [number, number]
  }
  defect: {
    cooperate: [number, number]
    defect: [number, number]
  }
}

// Strategy types
export interface Strategy {
  id: string
  name: string
  description: string
  color: string
  getMove: (history: GameResult[], opponentHistory: Move[]) => Move
  isNice?: boolean
  isProvokable?: boolean
  isForgiving?: boolean
  isClear?: boolean
}

export interface StrategyStats {
  strategyId: string
  totalScore: number
  totalGames: number
  cooperationRate: number
  averageScore: number
  wins: number
  losses: number
  ties: number
}

// Tournament types
export interface TournamentMatch {
  strategy1: Strategy
  strategy2: Strategy
  results: GameResult[]
  strategy1Score: number
  strategy2Score: number
  rounds: number
}

export interface TournamentRound {
  roundNumber: number
  matches: TournamentMatch[]
  standings: StrategyStats[]
}

export interface Tournament {
  id: string
  name: string
  strategies: Strategy[]
  rounds: TournamentRound[]
  currentRound: number
  isComplete: boolean
  winner?: Strategy
}

// Evolution types
export interface Population {
  [strategyId: string]: number
}

export interface EvolutionGeneration {
  generation: number
  population: Population
  averageFitness: number
  cooperationRate: number
  dominantStrategy?: string
}

export interface EvolutionConfig {
  populationSize: number
  mutationRate: number
  selectionPressure: number
  roundsPerGeneration: number
  maxGenerations: number
}

// Game configuration
export interface GameConfig {
  payoffMatrix: PayoffMatrix
  roundsPerMatch: number
  noiseLevel: number
  enableNoise: boolean
  customStrategies: Strategy[]
}

// UI state types
export interface GameState {
  currentStage: string
  completedStages: string[]
  userStats: {
    totalGames: number
    totalScore: number
    cooperationRate: number
    favoriteStrategy?: string
  }
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

// Analysis types
export interface GameAnalysis {
  cooperationTrends: number[]
  strategyEffectiveness: { [strategyId: string]: number }
  evolutionaryStability: number
  noiseImpact: number
  insights: string[]
}

// Export types
export interface ExportData {
  tournament?: Tournament
  evolution?: EvolutionGeneration[]
  gameConfig: GameConfig
  timestamp: Date
  version: string
}

// Utility types
export type GamePhase = "setup" | "playing" | "paused" | "complete"
export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert"
export type VisualizationMode = "simple" | "detailed" | "scientific"