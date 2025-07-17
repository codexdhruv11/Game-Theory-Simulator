import { Strategy, Population, EvolutionGeneration, EvolutionConfig } from "../types"
import { PrisonersDilemmaGame } from "./pdCore"
import { TournamentEngine } from "./tournament"

/**
 * Evolution engine for simulating strategy evolution over generations
 */
export class EvolutionEngine {
  private strategies: Strategy[]
  private config: EvolutionConfig
  private game: PrisonersDilemmaGame
  private tournament: TournamentEngine
  private generations: EvolutionGeneration[] = []

  constructor(
    strategies: Strategy[],
    config: EvolutionConfig,
    payoffMatrix: any
  ) {
    this.strategies = strategies
    this.config = config
    this.game = new PrisonersDilemmaGame(payoffMatrix)
    this.tournament = new TournamentEngine(payoffMatrix, config.roundsPerGeneration)
  }

  /**
   * Initialize population with equal distribution
   */
  initializePopulation(): Population {
    const population: Population = {}
    const strategyCount = Math.floor(this.config.populationSize / this.strategies.length)
    const remainder = this.config.populationSize % this.strategies.length

    this.strategies.forEach((strategy, index) => {
      population[strategy.id] = strategyCount + (index < remainder ? 1 : 0)
    })

    return population
  }

  /**
   * Run evolution simulation
   */
  runEvolution(initialPopulation?: Population): EvolutionGeneration[] {
    this.generations = []
    let currentPopulation = initialPopulation || this.initializePopulation()

    // Initial generation
    const initialGeneration = this.createGeneration(0, currentPopulation)
    this.generations.push(initialGeneration)

    for (let gen = 1; gen <= this.config.maxGenerations; gen++) {
      // Calculate fitness for each strategy
      const fitness = this.calculateFitness(currentPopulation)
      
      // Create next generation based on fitness
      currentPopulation = this.createNextGeneration(currentPopulation, fitness)
      
      // Apply mutations
      currentPopulation = this.applyMutations(currentPopulation)
      
      // Create generation record
      const generation = this.createGeneration(gen, currentPopulation)
      this.generations.push(generation)

      // Check for convergence or extinction
      if (this.hasConverged(currentPopulation) || this.hasExtinction(currentPopulation)) {
        break
      }
    }

    return this.generations
  }

  /**
   * Calculate fitness for each strategy in the current population
   */
  private calculateFitness(population: Population): { [strategyId: string]: number } {
    const fitness: { [strategyId: string]: number } = {}
    const totalPopulation = Object.values(population).reduce((sum, count) => sum + count, 0)

    // Initialize fitness scores
    this.strategies.forEach(strategy => {
      fitness[strategy.id] = 0
    })

    // Run matches between all strategy pairs
    for (const strategy1 of this.strategies) {
      for (const strategy2 of this.strategies) {
        const count1 = population[strategy1.id] || 0
        const count2 = population[strategy2.id] || 0
        
        if (count1 > 0 && count2 > 0) {
          // Run a match between these strategies
          const results = this.game.playMatch(
            strategy1,
            strategy2,
            this.config.roundsPerGeneration
          )
          
          const [score1, score2] = this.game.getTotalScores()
          
          // Weight the scores by population frequencies
          const weight = (count1 * count2) / (totalPopulation * totalPopulation)
          fitness[strategy1.id] += score1 * weight
          fitness[strategy2.id] += score2 * weight
        }
      }
    }

    return fitness
  }

  /**
   * Create next generation based on fitness proportional selection
   */
  private createNextGeneration(
    currentPopulation: Population,
    fitness: { [strategyId: string]: number }
  ): Population {
    const nextPopulation: Population = {}
    
    // Initialize with zeros
    this.strategies.forEach(strategy => {
      nextPopulation[strategy.id] = 0
    })

    // Calculate total fitness
    const totalFitness = Object.values(fitness).reduce((sum, f) => sum + f, 0)
    
    if (totalFitness === 0) {
      // If no fitness, maintain current population
      return { ...currentPopulation }
    }

    // Selection pressure adjustment
    const adjustedFitness: { [strategyId: string]: number } = {}
    Object.keys(fitness).forEach(strategyId => {
      adjustedFitness[strategyId] = Math.pow(fitness[strategyId], this.config.selectionPressure)
    })

    const adjustedTotalFitness = Object.values(adjustedFitness).reduce((sum, f) => sum + f, 0)

    // Proportional selection
    for (let i = 0; i < this.config.populationSize; i++) {
      const random = Math.random() * adjustedTotalFitness
      let cumulative = 0
      
      for (const strategyId of Object.keys(adjustedFitness)) {
        cumulative += adjustedFitness[strategyId]
        if (random <= cumulative) {
          nextPopulation[strategyId]++
          break
        }
      }
    }

    return nextPopulation
  }

  /**
   * Apply random mutations to the population
   */
  private applyMutations(population: Population): Population {
    const mutatedPopulation = { ...population }
    const totalPopulation = Object.values(population).reduce((sum, count) => sum + count, 0)
    const mutationsToApply = Math.floor(totalPopulation * this.config.mutationRate)

    for (let i = 0; i < mutationsToApply; i++) {
      // Remove one individual from a random strategy
      const fromStrategies = Object.keys(mutatedPopulation).filter(id => mutatedPopulation[id] > 0)
      if (fromStrategies.length === 0) continue
      
      const fromStrategy = fromStrategies[Math.floor(Math.random() * fromStrategies.length)]
      mutatedPopulation[fromStrategy]--

      // Add one individual to a random strategy
      const toStrategy = this.strategies[Math.floor(Math.random() * this.strategies.length)]
      mutatedPopulation[toStrategy.id]++
    }

    return mutatedPopulation
  }

  /**
   * Create a generation record
   */
  private createGeneration(generation: number, population: Population): EvolutionGeneration {
    const totalPopulation = Object.values(population).reduce((sum, count) => sum + count, 0)
    
    // Calculate average fitness (simplified)
    const fitness = this.calculateFitness(population)
    const averageFitness = Object.values(fitness).reduce((sum, f) => sum + f, 0) / Object.keys(fitness).length

    // Calculate cooperation rate (based on strategy properties)
    let totalCooperativeIndividuals = 0
    this.strategies.forEach(strategy => {
      const count = population[strategy.id] || 0
      if (strategy.isNice) {
        totalCooperativeIndividuals += count
      }
    })
    const cooperationRate = totalCooperativeIndividuals / totalPopulation

    // Find dominant strategy
    let dominantStrategy: string | undefined
    let maxCount = 0
    Object.entries(population).forEach(([strategyId, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantStrategy = strategyId
      }
    })

    return {
      generation,
      population: { ...population },
      averageFitness,
      cooperationRate,
      dominantStrategy
    }
  }

  /**
   * Check if population has converged (one strategy dominates)
   */
  private hasConverged(population: Population): boolean {
    const totalPopulation = Object.values(population).reduce((sum, count) => sum + count, 0)
    const maxCount = Math.max(...Object.values(population))
    return maxCount / totalPopulation > 0.95 // 95% dominance
  }

  /**
   * Check if any strategy has gone extinct
   */
  private hasExtinction(population: Population): boolean {
    const activeStrategies = Object.values(population).filter(count => count > 0).length
    return activeStrategies < 2
  }

  /**
   * Get evolution history
   */
  getGenerations(): EvolutionGeneration[] {
    return [...this.generations]
  }

  /**
   * Get current generation
   */
  getCurrentGeneration(): EvolutionGeneration | undefined {
    return this.generations[this.generations.length - 1]
  }

  /**
   * Reset evolution
   */
  reset(): void {
    this.generations = []
  }

  /**
   * Update evolution configuration
   */
  updateConfig(newConfig: Partial<EvolutionConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Add custom strategy to evolution
   */
  addStrategy(strategy: Strategy): void {
    if (!this.strategies.find(s => s.id === strategy.id)) {
      this.strategies.push(strategy)
    }
  }

  /**
   * Remove strategy from evolution
   */
  removeStrategy(strategyId: string): void {
    this.strategies = this.strategies.filter(s => s.id !== strategyId)
  }
}