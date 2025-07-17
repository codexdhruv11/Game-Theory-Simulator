// Re-export all engine modules for easy importing
export * from "./pdCore"
export * from "./strategies"
export * from "./tournament"
export * from "./evolution"

// Default game configurations
import { PayoffMatrix, GameConfig } from "../types"

export const DEFAULT_PAYOFF_MATRIX: PayoffMatrix = {
  cooperate: {
    cooperate: [3, 3], // Reward for mutual cooperation
    defect: [0, 5]     // Sucker's payoff vs Temptation
  },
  defect: {
    cooperate: [5, 0], // Temptation vs Sucker's payoff
    defect: [1, 1]     // Punishment for mutual defection
  }
}

export const AXELROD_PAYOFF_MATRIX: PayoffMatrix = {
  cooperate: {
    cooperate: [3, 3],
    defect: [0, 5]
  },
  defect: {
    cooperate: [5, 0],
    defect: [1, 1]
  }
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  payoffMatrix: DEFAULT_PAYOFF_MATRIX,
  roundsPerMatch: 200,
  noiseLevel: 0,
  enableNoise: false,
  customStrategies: []
}

// Utility functions
export function validatePayoffMatrix(matrix: PayoffMatrix): boolean {
  const { cooperate, defect } = matrix
  const T = defect.cooperate[0]    // Temptation
  const R = cooperate.cooperate[0] // Reward
  const P = defect.defect[0]       // Punishment
  const S = cooperate.defect[0]    // Sucker's payoff
  
  // Check prisoner's dilemma conditions: T > R > P > S
  return T > R && R > P && P > S && (2 * R) > (T + S)
}

export function calculatePayoff(
  move1: "cooperate" | "defect",
  move2: "cooperate" | "defect",
  matrix: PayoffMatrix
): [number, number] {
  return matrix[move1][move2]
}

export function addNoise(
  intendedMove: "cooperate" | "defect",
  noiseLevel: number
): "cooperate" | "defect" {
  if (Math.random() < noiseLevel) {
    return intendedMove === "cooperate" ? "defect" : "cooperate"
  }
  return intendedMove
}