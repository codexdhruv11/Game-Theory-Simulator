import { Strategy, Tournament, TournamentMatch, TournamentRound, StrategyStats } from "../types"
import { PrisonersDilemmaGame } from "./pdCore"

/**
 * Tournament engine for running strategy competitions
 */
export class TournamentEngine {
  private game: PrisonersDilemmaGame
  private roundsPerMatch: number
  private noiseLevel: number

  constructor(
    payoffMatrix: any,
    roundsPerMatch: number = 200,
    noiseLevel: number = 0
  ) {
    this.game = new PrisonersDilemmaGame(payoffMatrix)
    this.roundsPerMatch = roundsPerMatch
    this.noiseLevel = noiseLevel
  }

  /**
   * Run a complete round-robin tournament
   */
  runTournament(strategies: Strategy[]): Tournament {
    const tournament: Tournament = {
      id: `tournament_${Date.now()}`,
      name: `Tournament ${new Date().toLocaleDateString()}`,
      strategies,
      rounds: [],
      currentRound: 0,
      isComplete: false
    }

    // Run round-robin: each strategy plays against every other strategy
    const matches: TournamentMatch[] = []
    
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const match = this.runMatch(strategies[i], strategies[j])
        matches.push(match)
      }
    }

    // Calculate standings
    const standings = this.calculateStandings(strategies, matches)

    const round: TournamentRound = {
      roundNumber: 1,
      matches,
      standings
    }

    tournament.rounds.push(round)
    tournament.currentRound = 1
    tournament.isComplete = true
    tournament.winner = standings[0]?.strategyId ? 
      strategies.find(s => s.id === standings[0].strategyId) : undefined

    return tournament
  }

  /**
   * Run a match between two strategies
   */
  private runMatch(strategy1: Strategy, strategy2: Strategy): TournamentMatch {
    const results = this.game.playMatch(
      strategy1,
      strategy2,
      this.roundsPerMatch,
      this.noiseLevel
    )

    const [strategy1Score, strategy2Score] = this.game.getTotalScores()

    return {
      strategy1,
      strategy2,
      results,
      strategy1Score,
      strategy2Score,
      rounds: this.roundsPerMatch
    }
  }

  /**
   * Calculate tournament standings
   */
  private calculateStandings(
    strategies: Strategy[],
    matches: TournamentMatch[]
  ): StrategyStats[] {
    const stats: { [strategyId: string]: StrategyStats } = {}

    // Initialize stats for all strategies
    strategies.forEach(strategy => {
      stats[strategy.id] = {
        strategyId: strategy.id,
        totalScore: 0,
        totalGames: 0,
        cooperationRate: 0,
        averageScore: 0,
        wins: 0,
        losses: 0,
        ties: 0
      }
    })

    // Process all matches
    matches.forEach(match => {
      const { strategy1, strategy2, strategy1Score, strategy2Score, results } = match

      // Update scores and games
      stats[strategy1.id].totalScore += strategy1Score
      stats[strategy1.id].totalGames += 1
      stats[strategy2.id].totalScore += strategy2Score
      stats[strategy2.id].totalGames += 1

      // Update win/loss/tie records
      if (strategy1Score > strategy2Score) {
        stats[strategy1.id].wins += 1
        stats[strategy2.id].losses += 1
      } else if (strategy2Score > strategy1Score) {
        stats[strategy2.id].wins += 1
        stats[strategy1.id].losses += 1
      } else {
        stats[strategy1.id].ties += 1
        stats[strategy2.id].ties += 1
      }

      // Calculate cooperation rates
      const strategy1Cooperations = results.filter(r => r.player1Move === "cooperate").length
      const strategy2Cooperations = results.filter(r => r.player2Move === "cooperate").length
      
      stats[strategy1.id].cooperationRate = 
        (stats[strategy1.id].cooperationRate * (stats[strategy1.id].totalGames - 1) + 
         strategy1Cooperations / results.length) / stats[strategy1.id].totalGames

      stats[strategy2.id].cooperationRate = 
        (stats[strategy2.id].cooperationRate * (stats[strategy2.id].totalGames - 1) + 
         strategy2Cooperations / results.length) / stats[strategy2.id].totalGames
    })

    // Calculate average scores
    Object.values(stats).forEach(stat => {
      stat.averageScore = stat.totalGames > 0 ? stat.totalScore / stat.totalGames : 0
    })

    // Sort by total score (descending)
    return Object.values(stats).sort((a, b) => b.totalScore - a.totalScore)
  }

  /**
   * Run a single elimination tournament
   */
  runEliminationTournament(strategies: Strategy[]): Tournament {
    if (strategies.length < 2) {
      throw new Error("Need at least 2 strategies for elimination tournament")
    }

    const tournament: Tournament = {
      id: `elimination_${Date.now()}`,
      name: `Elimination Tournament ${new Date().toLocaleDateString()}`,
      strategies,
      rounds: [],
      currentRound: 0,
      isComplete: false
    }

    let currentStrategies = [...strategies]
    let roundNumber = 1

    while (currentStrategies.length > 1) {
      const matches: TournamentMatch[] = []
      const nextRoundStrategies: Strategy[] = []

      // Pair up strategies for matches
      for (let i = 0; i < currentStrategies.length; i += 2) {
        if (i + 1 < currentStrategies.length) {
          const match = this.runMatch(currentStrategies[i], currentStrategies[i + 1])
          matches.push(match)

          // Winner advances
          const winner = match.strategy1Score >= match.strategy2Score ? 
            match.strategy1 : match.strategy2
          nextRoundStrategies.push(winner)
        } else {
          // Odd number of strategies, last one gets a bye
          nextRoundStrategies.push(currentStrategies[i])
        }
      }

      const standings = this.calculateStandings(currentStrategies, matches)
      
      const round: TournamentRound = {
        roundNumber,
        matches,
        standings
      }

      tournament.rounds.push(round)
      currentStrategies = nextRoundStrategies
      roundNumber++
    }

    tournament.currentRound = roundNumber - 1
    tournament.isComplete = true
    tournament.winner = currentStrategies[0]

    return tournament
  }

  /**
   * Get head-to-head statistics between two strategies
   */
  getHeadToHeadStats(
    strategy1: Strategy,
    strategy2: Strategy,
    numMatches: number = 10
  ): {
    strategy1Wins: number
    strategy2Wins: number
    ties: number
    averageScores: [number, number]
    cooperationRates: [number, number]
  } {
    let strategy1Wins = 0
    let strategy2Wins = 0
    let ties = 0
    let totalScores: [number, number] = [0, 0]
    let totalCooperations: [number, number] = [0, 0]
    let totalRounds = 0

    for (let i = 0; i < numMatches; i++) {
      const match = this.runMatch(strategy1, strategy2)
      
      if (match.strategy1Score > match.strategy2Score) {
        strategy1Wins++
      } else if (match.strategy2Score > match.strategy1Score) {
        strategy2Wins++
      } else {
        ties++
      }

      totalScores[0] += match.strategy1Score
      totalScores[1] += match.strategy2Score

      const s1Cooperations = match.results.filter(r => r.player1Move === "cooperate").length
      const s2Cooperations = match.results.filter(r => r.player2Move === "cooperate").length
      
      totalCooperations[0] += s1Cooperations
      totalCooperations[1] += s2Cooperations
      totalRounds += match.results.length
    }

    return {
      strategy1Wins,
      strategy2Wins,
      ties,
      averageScores: [
        totalScores[0] / numMatches,
        totalScores[1] / numMatches
      ],
      cooperationRates: [
        totalCooperations[0] / totalRounds,
        totalCooperations[1] / totalRounds
      ]
    }
  }

  /**
   * Update tournament settings
   */
  updateSettings(roundsPerMatch?: number, noiseLevel?: number): void {
    if (roundsPerMatch !== undefined) {
      this.roundsPerMatch = roundsPerMatch
    }
    if (noiseLevel !== undefined) {
      this.noiseLevel = noiseLevel
    }
  }
}