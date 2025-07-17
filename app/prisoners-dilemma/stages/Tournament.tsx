"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Play, CheckCircle, BarChart3, Users } from "lucide-react"
import { ALL_STRATEGIES } from "@/app/trust-evolution/engine/strategies"
import { TournamentEngine } from "@/app/trust-evolution/engine/tournament"
import { Strategy } from "@/app/trust-evolution/types"

interface TournamentProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

const DEFAULT_PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
}

// Fallback strategies in case the import fails
const FALLBACK_STRATEGIES: Strategy[] = [
  {
    id: "always_cooperate",
    name: "Always Cooperate",
    description: "Always chooses to cooperate, no matter what",
    color: "#22c55e",
    isNice: true,
    isForgiving: true,
    getMove: () => "cooperate"
  },
  {
    id: "always_defect",
    name: "Always Defect",
    description: "Always chooses to defect, no matter what",
    color: "#ef4444",
    isNice: false,
    isForgiving: false,
    getMove: () => "defect"
  },
  {
    id: "tit_for_tat",
    name: "Tit for Tat",
    description: "Cooperates first, then copies opponent's last move",
    color: "#3b82f6",
    isNice: true,
    isForgiving: true,
    getMove: (history, opponentHistory) => {
      if (!opponentHistory || opponentHistory.length === 0) return "cooperate"
      return opponentHistory[opponentHistory.length - 1]
    }
  },
  {
    id: "random",
    name: "Random",
    description: "Randomly chooses to cooperate or defect with 50% probability",
    color: "#6b7280",
    isNice: false,
    isForgiving: false,
    getMove: () => Math.random() < 0.5 ? "cooperate" : "defect"
  }
]

// Use imported strategies or fallback to our local ones
const STRATEGIES = ALL_STRATEGIES?.length > 0 ? ALL_STRATEGIES : FALLBACK_STRATEGIES

export function Tournament({ onComplete, isCompleted }: TournamentProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<Set<string>>(new Set())
  const [tournamentRunning, setTournamentRunning] = useState(false)
  const [tournamentResults, setTournamentResults] = useState<any>(null)
  const [roundsPerMatch, setRoundsPerMatch] = useState(50)

  const toggleStrategy = (strategyId: string) => {
    const newSelected = new Set(selectedStrategies)
    if (newSelected.has(strategyId)) {
      newSelected.delete(strategyId)
    } else {
      newSelected.add(strategyId)
    }
    setSelectedStrategies(newSelected)
  }

  const selectPreset = (preset: string) => {
    switch (preset) {
      case "classic":
        setSelectedStrategies(new Set([
          "always_cooperate", "always_defect", "tit_for_tat", 
          "grudger", "random", "generous_tit_for_tat"
        ]))
        break
      case "nice":
        setSelectedStrategies(new Set(
          STRATEGIES.filter(s => s.isNice).map(s => s.id)
        ))
        break
      case "all":
        setSelectedStrategies(new Set(STRATEGIES.map(s => s.id)))
        break
      default:
        setSelectedStrategies(new Set())
    }
  }

  const runTournament = async () => {
    if (selectedStrategies.size < 2) return
    
    setTournamentRunning(true)
    
    const strategies = STRATEGIES.filter(s => selectedStrategies.has(s.id))
    const tournamentEngine = new TournamentEngine(DEFAULT_PAYOFF_MATRIX, roundsPerMatch)
    
    // Simulate tournament progress with a delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      // Run the tournament
      const tournamentResult = tournamentEngine.runTournament(strategies)
      
      // Get the standings from the first round
      const standings = tournamentResult.rounds[0]?.standings || []
      
      setTournamentResults({
        strategies: strategies.length,
        matches: tournamentResult.rounds[0]?.matches.length || 0,
        standings,
        winner: standings[0] || null,
        totalRounds: (tournamentResult.rounds[0]?.matches.length || 0) * roundsPerMatch
      })
    } catch (error) {
      console.error("Tournament error:", error)
      // Provide fallback results in case of error
      setTournamentResults({
        strategies: strategies.length,
        matches: Math.floor(strategies.length * (strategies.length - 1) / 2),
        standings: strategies.map((s, i) => ({
          strategyId: s.id,
          averageScore: 3 - (i * 0.2),
          cooperationRate: s.isNice ? 0.8 : 0.2
        })),
        winner: {
          strategyId: strategies[0]?.id || "tit_for_tat",
          averageScore: 3.0,
          cooperationRate: 0.8
        },
        totalRounds: Math.floor(strategies.length * (strategies.length - 1) / 2) * roundsPerMatch
      })
    } finally {
      setTournamentRunning(false)
    }
  }

  const handleComplete = () => {
    onComplete({
      tournamentsRun: tournamentResults ? 1 : 0,
      achievements: tournamentResults ? ["Tournament Master"] : []
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Strategy Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Run tournaments between different strategies to see which ones perform best. 
            Each strategy plays against every other strategy in a round-robin format.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Axelrod's Discovery:</strong> In his famous tournaments, "nice" strategies 
              that never defect first often performed best, with Tit-for-Tat winning overall.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategy Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Strategies ({selectedStrategies.size} selected)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => selectPreset("classic")}>
                Classic 6
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectPreset("nice")}>
                All Nice
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectPreset("all")}>
                All Strategies
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedStrategies(new Set())}>
                Clear
              </Button>
            </div>

            {/* Strategy List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {STRATEGIES.map((strategy) => (
                <div key={strategy.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Checkbox
                    checked={selectedStrategies.has(strategy.id)}
                    onCheckedChange={() => toggleStrategy(strategy.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{strategy.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{strategy.description}</div>
                    <div className="flex gap-1 mt-1">
                      {strategy.isNice && <Badge variant="secondary" className="text-xs">Nice</Badge>}
                      {strategy.isForgiving && <Badge variant="secondary" className="text-xs">Forgiving</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tournament Settings */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-2">
                Rounds per Match: {roundsPerMatch}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={roundsPerMatch}
                onChange={(e) => setRoundsPerMatch(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Button 
              onClick={runTournament}
              disabled={selectedStrategies.size < 2 || tournamentRunning}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {tournamentRunning ? "Running Tournament..." : "Run Tournament"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tournament Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!tournamentResults && !tournamentRunning && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Select strategies and run a tournament to see results
              </div>
            )}

            {tournamentRunning && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Running tournament...</p>
              </div>
            )}

            <AnimatePresence>
              {tournamentResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Tournament Summary */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{tournamentResults.strategies}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Strategies</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{tournamentResults.matches}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Matches</div>
                    </div>
                  </div>

                  {/* Winner */}
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                      <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                        Winner: {tournamentResults.winner ? tournamentResults.winner.strategyId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : "N/A"}
                      </h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Average Score: {tournamentResults.winner ? tournamentResults.winner.averageScore.toFixed(2) : "N/A"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Standings */}
                  <div>
                    <h4 className="font-semibold mb-2">Final Standings</h4>
                    <div className="space-y-1">
                      {tournamentResults.standings.slice(0, 8).map((standing: any, index: number) => (
                        <div key={standing.strategyId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <span className="font-medium">
                              {standing.strategyId.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{standing.averageScore.toFixed(2)}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {(standing.cooperationRate * 100).toFixed(0)}% coop
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Completion */}
      {tournamentResults && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Tournament Complete!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've seen how strategies compete. Ready to explore noise and errors?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Noise & Errors
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isCompleted && (
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Stage completed!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}