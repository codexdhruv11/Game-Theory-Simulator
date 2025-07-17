"use client"

import { useState, useCallback, useEffect } from "react"
import { TournamentEngine } from "../engine/tournament"
import { Strategy, Tournament, TournamentRound, StrategyStats } from "../types"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"

interface UseTournamentOptions {
  initialRoundsPerMatch?: number
  initialNoiseLevel?: number
  autoStart?: boolean
}

export function useTournament(
  strategies: Strategy[],
  options: UseTournamentOptions = {}
) {
  const {
    initialRoundsPerMatch = 200,
    initialNoiseLevel = 0,
    autoStart = false
  } = options

  // Tournament state
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roundsPerMatch, setRoundsPerMatch] = useState(initialRoundsPerMatch)
  const [noiseLevel, setNoiseLevel] = useState(initialNoiseLevel)
  const [tournamentEngine, setTournamentEngine] = useState(() => 
    new TournamentEngine(DEFAULT_PAYOFF_MATRIX, initialRoundsPerMatch, initialNoiseLevel)
  )

  // Initialize or update tournament engine when configuration changes
  useEffect(() => {
    setTournamentEngine(new TournamentEngine(
      DEFAULT_PAYOFF_MATRIX,
      roundsPerMatch,
      noiseLevel
    ))
  }, [roundsPerMatch, noiseLevel])

  // Auto-start tournament if specified
  useEffect(() => {
    if (autoStart && strategies.length > 1 && !tournament) {
      startTournament()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, strategies.length])

  // Start tournament
  const startTournament = useCallback(() => {
    if (strategies.length < 2) {
      setError("Need at least 2 strategies to run a tournament")
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      // Use setTimeout to allow UI to update before running the tournament
      setTimeout(() => {
        const newTournament = tournamentEngine.runTournament(strategies)
        setTournament(newTournament)
        setIsRunning(false)
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error running tournament")
      setIsRunning(false)
    }
  }, [strategies, tournamentEngine])

  // Run elimination tournament
  const runEliminationTournament = useCallback(() => {
    if (strategies.length < 2) {
      setError("Need at least 2 strategies to run a tournament")
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      // Use setTimeout to allow UI to update before running the tournament
      setTimeout(() => {
        const newTournament = tournamentEngine.runEliminationTournament(strategies)
        setTournament(newTournament)
        setIsRunning(false)
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error running tournament")
      setIsRunning(false)
    }
  }, [strategies, tournamentEngine])

  // Reset tournament
  const resetTournament = useCallback(() => {
    setTournament(null)
    setError(null)
  }, [])

  // Get head-to-head stats between two strategies
  const getHeadToHeadStats = useCallback((
    strategy1: Strategy,
    strategy2: Strategy,
    numMatches: number = 10
  ) => {
    return tournamentEngine.getHeadToHeadStats(strategy1, strategy2, numMatches)
  }, [tournamentEngine])

  // Update tournament settings
  const updateSettings = useCallback((
    newRoundsPerMatch?: number,
    newNoiseLevel?: number
  ) => {
    if (newRoundsPerMatch !== undefined) {
      setRoundsPerMatch(newRoundsPerMatch)
    }
    if (newNoiseLevel !== undefined) {
      setNoiseLevel(newNoiseLevel)
    }
  }, [])

  // Get current tournament winner
  const getWinner = useCallback(() => {
    return tournament?.winner || null
  }, [tournament])

  // Get current tournament standings
  const getStandings = useCallback(() => {
    if (!tournament || tournament.rounds.length === 0) {
      return []
    }
    return tournament.rounds[tournament.rounds.length - 1].standings
  }, [tournament])

  // Get cooperation rates for all strategies
  const getCooperationRates = useCallback(() => {
    const standings = getStandings()
    return standings.map(stat => ({
      strategyId: stat.strategyId,
      cooperationRate: stat.cooperationRate
    }))
  }, [getStandings])

  return {
    tournament,
    isRunning,
    error,
    roundsPerMatch,
    noiseLevel,
    startTournament,
    runEliminationTournament,
    resetTournament,
    getHeadToHeadStats,
    updateSettings,
    getWinner,
    getStandings,
    getCooperationRates
  }
} 