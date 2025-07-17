import { Strategy, GameResult, Move } from "../types"

/**
 * Collection of classic game theory strategies for the Prisoner's Dilemma
 */

// Always Cooperate
export const ALWAYS_COOPERATE: Strategy = {
  id: "always_cooperate",
  name: "Always Cooperate",
  description: "Always chooses to cooperate, no matter what",
  color: "#22c55e",
  isNice: true,
  isProvokable: false,
  isForgiving: true,
  isClear: true,
  getMove: () => "cooperate"
}

// Always Defect
export const ALWAYS_DEFECT: Strategy = {
  id: "always_defect",
  name: "Always Defect",
  description: "Always chooses to defect, no matter what",
  color: "#ef4444",
  isNice: false,
  isProvokable: false,
  isForgiving: false,
  isClear: true,
  getMove: () => "defect"
}

// Tit for Tat
export const TIT_FOR_TAT: Strategy = {
  id: "tit_for_tat",
  name: "Tit for Tat",
  description: "Cooperates first, then copies opponent's last move",
  color: "#3b82f6",
  isNice: true,
  isProvokable: true,
  isForgiving: true,
  isClear: true,
  getMove: (history, opponentHistory) => {
    if (opponentHistory.length === 0) return "cooperate"
    return opponentHistory[opponentHistory.length - 1]
  }
}

// Tit for Two Tats
export const TIT_FOR_TWO_TATS: Strategy = {
  id: "tit_for_two_tats",
  name: "Tit for Two Tats",
  description: "Only retaliates after opponent defects twice in a row",
  color: "#8b5cf6",
  isNice: true,
  isProvokable: true,
  isForgiving: true,
  isClear: true,
  getMove: (history, opponentHistory) => {
    if (opponentHistory.length < 2) return "cooperate"
    const lastTwo = opponentHistory.slice(-2)
    return lastTwo.every(move => move === "defect") ? "defect" : "cooperate"
  }
}

// Grudger (Grim Trigger)
export const GRUDGER: Strategy = {
  id: "grudger",
  name: "Grudger",
  description: "Cooperates until opponent defects once, then always defects",
  color: "#dc2626",
  isNice: true,
  isProvokable: true,
  isForgiving: false,
  isClear: true,
  getMove: (history, opponentHistory) => {
    return opponentHistory.includes("defect") ? "defect" : "cooperate"
  }
}

// Pavlov (Win-Stay, Lose-Shift)
export const PAVLOV: Strategy = {
  id: "pavlov",
  name: "Pavlov",
  description: "Repeats last move if it worked well, switches if it didn't",
  color: "#f59e0b",
  isNice: true,
  isProvokable: true,
  isForgiving: true,
  isClear: false,
  getMove: (history, opponentHistory) => {
    if (history.length === 0) return "cooperate"
    
    const lastResult = history[history.length - 1]
    const myLastMove = lastResult.player1Move
    const opponentLastMove = lastResult.player2Move
    
    // Win-Stay: if last outcome was good (CC or DD), repeat
    // Lose-Shift: if last outcome was bad (CD or DC), switch
    if (
      (myLastMove === "cooperate" && opponentLastMove === "cooperate") ||
      (myLastMove === "defect" && opponentLastMove === "defect")
    ) {
      return myLastMove // Stay
    } else {
      return myLastMove === "cooperate" ? "defect" : "cooperate" // Shift
    }
  }
}

// Random
export const RANDOM: Strategy = {
  id: "random",
  name: "Random",
  description: "Randomly chooses to cooperate or defect with 50% probability",
  color: "#6b7280",
  isNice: false,
  isProvokable: false,
  isForgiving: false,
  isClear: false,
  getMove: () => Math.random() < 0.5 ? "cooperate" : "defect"
}

// Generous Tit for Tat
export const GENEROUS_TIT_FOR_TAT: Strategy = {
  id: "generous_tit_for_tat",
  name: "Generous Tit for Tat",
  description: "Like Tit for Tat, but sometimes forgives defections",
  color: "#10b981",
  isNice: true,
  isProvokable: true,
  isForgiving: true,
  isClear: false,
  getMove: (history, opponentHistory) => {
    if (opponentHistory.length === 0) return "cooperate"
    
    const lastOpponentMove = opponentHistory[opponentHistory.length - 1]
    if (lastOpponentMove === "cooperate") return "cooperate"
    
    // 10% chance to forgive a defection
    return Math.random() < 0.1 ? "cooperate" : "defect"
  }
}

// Suspicious Tit for Tat
export const SUSPICIOUS_TIT_FOR_TAT: Strategy = {
  id: "suspicious_tit_for_tat",
  name: "Suspicious Tit for Tat",
  description: "Like Tit for Tat, but starts by defecting",
  color: "#7c3aed",
  isNice: false,
  isProvokable: true,
  isForgiving: true,
  isClear: true,
  getMove: (history, opponentHistory) => {
    if (opponentHistory.length === 0) return "defect"
    return opponentHistory[opponentHistory.length - 1]
  }
}

// Prober
export const PROBER: Strategy = {
  id: "prober",
  name: "Prober",
  description: "Starts with D-C-C, then plays Tit for Tat if opponent retaliated",
  color: "#ec4899",
  isNice: false,
  isProvokable: true,
  isForgiving: true,
  isClear: false,
  getMove: (history, opponentHistory) => {
    // First three moves: D-C-C
    if (history.length === 0) return "defect"
    if (history.length === 1) return "cooperate"
    if (history.length === 2) return "cooperate"
    
    // Check if opponent retaliated to our initial defection
    const opponentRetaliated = opponentHistory.slice(0, 3).includes("defect")
    
    if (opponentRetaliated) {
      // Play Tit for Tat
      return opponentHistory[opponentHistory.length - 1]
    } else {
      // Opponent didn't retaliate, so exploit by always defecting
      return "defect"
    }
  }
}

// Copykitten (Tit for Two Tats variant)
export const COPYKITTEN: Strategy = {
  id: "copykitten",
  name: "Copykitten",
  description: "More forgiving version of Tit for Tat - needs two defections to retaliate",
  color: "#f97316",
  isNice: true,
  isProvokable: true,
  isForgiving: true,
  isClear: true,
  getMove: (history, opponentHistory) => {
    if (opponentHistory.length < 2) return "cooperate"
    
    // Only defect if opponent defected in the last two rounds
    const lastTwo = opponentHistory.slice(-2)
    return lastTwo.filter(move => move === "defect").length >= 2 ? "defect" : "cooperate"
  }
}

// Simpleton
export const SIMPLETON: Strategy = {
  id: "simpleton",
  name: "Simpleton",
  description: "Cooperates if both players made the same move last round",
  color: "#84cc16",
  isNice: true,
  isProvokable: false,
  isForgiving: true,
  isClear: false,
  getMove: (history, opponentHistory) => {
    if (history.length === 0) return "cooperate"
    
    const lastResult = history[history.length - 1]
    const myLastMove = lastResult.player1Move
    const opponentLastMove = lastResult.player2Move
    
    // Cooperate if both made the same move, defect if different
    return myLastMove === opponentLastMove ? "cooperate" : "defect"
  }
}

// All available strategies
export const ALL_STRATEGIES: Strategy[] = [
  ALWAYS_COOPERATE,
  ALWAYS_DEFECT,
  TIT_FOR_TAT,
  TIT_FOR_TWO_TATS,
  GRUDGER,
  PAVLOV,
  RANDOM,
  GENEROUS_TIT_FOR_TAT,
  SUSPICIOUS_TIT_FOR_TAT,
  PROBER,
  COPYKITTEN,
  SIMPLETON
]

// Strategy categories for educational purposes
export const NICE_STRATEGIES = ALL_STRATEGIES.filter(s => s.isNice)
export const MEAN_STRATEGIES = ALL_STRATEGIES.filter(s => !s.isNice)
export const FORGIVING_STRATEGIES = ALL_STRATEGIES.filter(s => s.isForgiving)
export const UNFORGIVING_STRATEGIES = ALL_STRATEGIES.filter(s => !s.isForgiving)

// Get strategy by ID
export function getStrategyById(id: string): Strategy | undefined {
  return ALL_STRATEGIES.find(strategy => strategy.id === id)
}

// Create a custom strategy
export function createCustomStrategy(
  id: string,
  name: string,
  description: string,
  color: string,
  getMove: (history: GameResult[], opponentHistory: Move[]) => Move,
  properties?: {
    isNice?: boolean
    isProvokable?: boolean
    isForgiving?: boolean
    isClear?: boolean
  }
): Strategy {
  return {
    id,
    name,
    description,
    color,
    getMove,
    ...properties
  }
}