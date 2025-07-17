"use client"

import { Strategy, GameResult, EvolutionGeneration, StrategyStats } from "../types"

/**
 * Calculate cooperation rate from game results
 */
export function calculateCooperationRate(results: GameResult[]): number {
  if (results.length === 0) return 0
  
  const cooperations = results.filter(r => 
    r.player1Move === "cooperate" || r.player2Move === "cooperate"
  ).length
  
  return cooperations / (results.length * 2)
}

/**
 * Calculate mutual cooperation rate from game results
 */
export function calculateMutualCooperationRate(results: GameResult[]): number {
  if (results.length === 0) return 0
  
  const mutualCooperations = results.filter(r => 
    r.player1Move === "cooperate" && r.player2Move === "cooperate"
  ).length
  
  return mutualCooperations / results.length
}

/**
 * Calculate mutual defection rate from game results
 */
export function calculateMutualDefectionRate(results: GameResult[]): number {
  if (results.length === 0) return 0
  
  const mutualDefections = results.filter(r => 
    r.player1Move === "defect" && r.player2Move === "defect"
  ).length
  
  return mutualDefections / results.length
}

/**
 * Calculate exploitation rate from game results
 */
export function calculateExploitationRate(results: GameResult[]): number {
  if (results.length === 0) return 0
  
  const exploitations = results.filter(r => 
    (r.player1Move === "cooperate" && r.player2Move === "defect") ||
    (r.player1Move === "defect" && r.player2Move === "cooperate")
  ).length
  
  return exploitations / results.length
}

/**
 * Calculate strategy effectiveness across generations
 */
export function calculateStrategyEffectiveness(
  generations: EvolutionGeneration[],
  strategies: Strategy[]
): Record<string, number> {
  if (generations.length < 2) {
    return strategies.reduce((acc, strategy) => {
      acc[strategy.id] = 0
      return acc
    }, {} as Record<string, number>)
  }
  
  // Calculate average growth rate for each strategy
  const effectiveness: Record<string, number> = {}
  
  strategies.forEach(strategy => {
    const growthRates: number[] = []
    
    for (let i = 1; i < generations.length; i++) {
      const prevPop = generations[i - 1].population[strategy.id] || 0
      const currentPop = generations[i].population[strategy.id] || 0
      
      if (prevPop > 0) {
        const growthRate = (currentPop - prevPop) / prevPop
        growthRates.push(growthRate)
      }
    }
    
    // Average growth rate
    effectiveness[strategy.id] = growthRates.length > 0
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : 0
  })
  
  return effectiveness
}

/**
 * Calculate evolutionary stability measure
 * Higher values indicate more stable strategies
 */
export function calculateEvolutionaryStability(
  generations: EvolutionGeneration[],
  strategies: Strategy[]
): Record<string, number> {
  if (generations.length < 5) {
    return strategies.reduce((acc, strategy) => {
      acc[strategy.id] = 0
      return acc
    }, {} as Record<string, number>)
  }
  
  // Calculate population stability for each strategy
  const stability: Record<string, number> = {}
  
  strategies.forEach(strategy => {
    const populations: number[] = generations.map(gen => gen.population[strategy.id] || 0)
    
    // Calculate standard deviation of population
    const mean = populations.reduce((sum, pop) => sum + pop, 0) / populations.length
    const squaredDiffs = populations.map(pop => Math.pow(pop - mean, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / populations.length
    const stdDev = Math.sqrt(variance)
    
    // Normalize by mean (coefficient of variation)
    const normalizedStdDev = mean > 0 ? stdDev / mean : 0
    
    // Invert so higher values mean more stable
    stability[strategy.id] = normalizedStdDev > 0 ? 1 / normalizedStdDev : 0
  })
  
  return stability
}

/**
 * Calculate noise impact on strategies
 */
export function calculateNoiseImpact(
  noisyResults: GameResult[],
  cleanResults: GameResult[],
  strategies: Strategy[]
): Record<string, number> {
  if (noisyResults.length === 0 || cleanResults.length === 0) {
    return strategies.reduce((acc, strategy) => {
      acc[strategy.id] = 0
      return acc
    }, {} as Record<string, number>)
  }
  
  // Calculate score differences with and without noise
  const impact: Record<string, number> = {}
  
  // This is a simplified calculation - in a real implementation,
  // we would need to track which strategy played which role
  const cleanScores = cleanResults.reduce(
    (sum, result) => sum + result.player1Score + result.player2Score,
    0
  ) / (cleanResults.length * 2)
  
  const noisyScores = noisyResults.reduce(
    (sum, result) => sum + result.player1Score + result.player2Score,
    0
  ) / (noisyResults.length * 2)
  
  // Calculate relative impact
  const relativeImpact = cleanScores > 0 ? (noisyScores - cleanScores) / cleanScores : 0
  
  // Assign same impact to all strategies for now
  strategies.forEach(strategy => {
    impact[strategy.id] = relativeImpact
  })
  
  return impact
}

/**
 * Generate insights based on tournament results
 */
export function generateTournamentInsights(
  standings: StrategyStats[],
  strategies: Strategy[]
): string[] {
  if (standings.length === 0) return []
  
  const insights: string[] = []
  
  // Find winner
  const winner = standings[0]
  const winnerStrategy = strategies.find(s => s.id === winner.strategyId)
  
  if (winnerStrategy) {
    insights.push(`${winnerStrategy.name} won the tournament with an average score of ${winner.averageScore.toFixed(2)}.`)
    
    // Check if winner is nice
    if (winnerStrategy.isNice) {
      insights.push(`The winning strategy never defects first, showing that being "nice" can be effective.`)
    } else {
      insights.push(`The winning strategy is not "nice" (it can defect first), suggesting that in this environment, aggression can be rewarded.`)
    }
    
    // Check if winner is forgiving
    if (winnerStrategy.isForgiving) {
      insights.push(`${winnerStrategy.name} is forgiving, showing that the ability to restore cooperation after defection is valuable.`)
    } else {
      insights.push(`${winnerStrategy.name} is not forgiving, suggesting that holding grudges was effective in this tournament.`)
    }
  }
  
  // Analyze cooperation rates
  const averageCooperationRate = standings.reduce(
    (sum, stat) => sum + stat.cooperationRate,
    0
  ) / standings.length
  
  if (averageCooperationRate > 0.7) {
    insights.push(`High overall cooperation rate (${(averageCooperationRate * 100).toFixed(0)}%) indicates a cooperative environment.`)
  } else if (averageCooperationRate < 0.3) {
    insights.push(`Low overall cooperation rate (${(averageCooperationRate * 100).toFixed(0)}%) indicates a competitive environment.`)
  }
  
  return insights
}

/**
 * Generate insights based on evolution results
 */
export function generateEvolutionInsights(
  generations: EvolutionGeneration[],
  strategies: Strategy[]
): string[] {
  if (generations.length === 0) return []
  
  const insights: string[] = []
  
  // Analyze final generation
  const finalGen = generations[generations.length - 1]
  
  // Find dominant strategy
  let maxPop = 0
  let dominantId = ""
  
  Object.entries(finalGen.population).forEach(([id, pop]) => {
    if (pop > maxPop) {
      maxPop = pop
      dominantId = id
    }
  })
  
  const dominantStrategy = strategies.find(s => s.id === dominantId)
  const totalPop = Object.values(finalGen.population).reduce((sum, pop) => sum + pop, 0)
  const dominantPercentage = maxPop / totalPop
  
  if (dominantStrategy && dominantPercentage > 0.5) {
    insights.push(`${dominantStrategy.name} dominated the population with ${(dominantPercentage * 100).toFixed(0)}% of individuals.`)
    
    if (dominantStrategy.isNice && dominantStrategy.isForgiving) {
      insights.push(`The dominance of ${dominantStrategy.name} suggests that being nice and forgiving leads to evolutionary success.`)
    } else if (dominantStrategy.isNice && !dominantStrategy.isForgiving) {
      insights.push(`The dominance of ${dominantStrategy.name} suggests that being nice but unforgiving can be an effective evolutionary strategy.`)
    } else if (!dominantStrategy.isNice && dominantStrategy.isForgiving) {
      insights.push(`The dominance of ${dominantStrategy.name} suggests that being initially aggressive but forgiving later can be effective.`)
    } else {
      insights.push(`The dominance of ${dominantStrategy.name} suggests that aggressive, unforgiving strategies can thrive in certain environments.`)
    }
  } else {
    insights.push(`No single strategy dominated the population, suggesting a balanced ecosystem of strategies.`)
  }
  
  // Analyze cooperation rate trend
  if (generations.length > 5) {
    const firstCoopRate = generations[0].cooperationRate
    const lastCoopRate = finalGen.cooperationRate
    const coopRateChange = lastCoopRate - firstCoopRate
    
    if (coopRateChange > 0.2) {
      insights.push(`Cooperation increased significantly over time, suggesting evolution favors cooperation in this environment.`)
    } else if (coopRateChange < -0.2) {
      insights.push(`Cooperation decreased over time, suggesting defection was more successful in this environment.`)
    } else {
      insights.push(`Cooperation rates remained relatively stable throughout evolution.`)
    }
  }
  
  return insights
} 