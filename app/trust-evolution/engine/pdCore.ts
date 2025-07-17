import { Move, GameResult, PayoffMatrix, Strategy } from "../types"

/**
 * Core Prisoner's Dilemma game engine
 */
export class PrisonersDilemmaGame {
  private payoffMatrix: PayoffMatrix
  private history: GameResult[] = []
  private roundNumber: number = 0

  constructor(payoffMatrix: PayoffMatrix) {
    this.payoffMatrix = payoffMatrix
  }

  /**
   * Play a single round between two strategies
   */
  playRound(
    strategy1: Strategy,
    strategy2: Strategy,
    noiseLevel: number = 0
  ): GameResult {
    // Get moves from strategies based on history
    const player1History = this.history.map(r => r.player1Move)
    const player2History = this.history.map(r => r.player2Move)
    
    let move1 = strategy1.getMove(this.history, player2History)
    let move2 = strategy2.getMove(this.history, player1History)

    // Apply noise if enabled
    if (noiseLevel > 0) {
      if (Math.random() < noiseLevel) {
        move1 = move1 === "cooperate" ? "defect" : "cooperate"
      }
      if (Math.random() < noiseLevel) {
        move2 = move2 === "cooperate" ? "defect" : "cooperate"
      }
    }

    // Calculate payoffs
    const [score1, score2] = this.payoffMatrix[move1][move2]

    const result: GameResult = {
      player1Move: move1,
      player2Move: move2,
      player1Score: score1,
      player2Score: score2,
      round: ++this.roundNumber
    }

    this.history.push(result)
    return result
  }

  /**
   * Play a complete match between two strategies
   */
  playMatch(
    strategy1: Strategy,
    strategy2: Strategy,
    rounds: number,
    noiseLevel: number = 0
  ): GameResult[] {
    this.reset()
    const results: GameResult[] = []

    for (let i = 0; i < rounds; i++) {
      const result = this.playRound(strategy1, strategy2, noiseLevel)
      results.push(result)
    }

    return results
  }

  /**
   * Get the current game history
   */
  getHistory(): GameResult[] {
    return [...this.history]
  }

  /**
   * Get total scores for both players
   */
  getTotalScores(): [number, number] {
    return this.history.reduce(
      (totals, result) => [
        totals[0] + result.player1Score,
        totals[1] + result.player2Score
      ],
      [0, 0]
    )
  }

  /**
   * Get cooperation rates for both players
   */
  getCooperationRates(): [number, number] {
    if (this.history.length === 0) return [0, 0]

    const player1Cooperations = this.history.filter(r => r.player1Move === "cooperate").length
    const player2Cooperations = this.history.filter(r => r.player2Move === "cooperate").length

    return [
      player1Cooperations / this.history.length,
      player2Cooperations / this.history.length
    ]
  }

  /**
   * Reset the game state
   */
  reset(): void {
    this.history = []
    this.roundNumber = 0
  }

  /**
   * Get payoff matrix
   */
  getPayoffMatrix(): PayoffMatrix {
    return this.payoffMatrix
  }

  /**
   * Update payoff matrix
   */
  setPayoffMatrix(matrix: PayoffMatrix): void {
    this.payoffMatrix = matrix
  }
}

/**
 * Utility functions for game analysis
 */
export function analyzeGameResults(results: GameResult[]): {
  totalRounds: number
  cooperationRate: number
  mutualCooperationRate: number
  mutualDefectionRate: number
  exploitationRate: number
  averageScore: [number, number]
} {
  if (results.length === 0) {
    return {
      totalRounds: 0,
      cooperationRate: 0,
      mutualCooperationRate: 0,
      mutualDefectionRate: 0,
      exploitationRate: 0,
      averageScore: [0, 0]
    }
  }

  const totalRounds = results.length
  const cooperations = results.filter(r => 
    r.player1Move === "cooperate" || r.player2Move === "cooperate"
  ).length
  const mutualCooperations = results.filter(r => 
    r.player1Move === "cooperate" && r.player2Move === "cooperate"
  ).length
  const mutualDefections = results.filter(r => 
    r.player1Move === "defect" && r.player2Move === "defect"
  ).length
  const exploitations = results.filter(r => 
    (r.player1Move === "cooperate" && r.player2Move === "defect") ||
    (r.player1Move === "defect" && r.player2Move === "cooperate")
  ).length

  const totalScores = results.reduce(
    (totals, result) => [
      totals[0] + result.player1Score,
      totals[1] + result.player2Score
    ],
    [0, 0]
  )

  return {
    totalRounds,
    cooperationRate: cooperations / (totalRounds * 2),
    mutualCooperationRate: mutualCooperations / totalRounds,
    mutualDefectionRate: mutualDefections / totalRounds,
    exploitationRate: exploitations / totalRounds,
    averageScore: [totalScores[0] / totalRounds, totalScores[1] / totalRounds]
  }
}