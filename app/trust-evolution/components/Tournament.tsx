"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { TournamentEngine, ALL_STRATEGIES } from "../engine"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { Tournament as TournamentType, Strategy, StrategyStats } from "../types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface TournamentProps {
  onComplete: () => void
}

export function Tournament({ onComplete }: TournamentProps) {
  const [tournament, setTournament] = useState<TournamentType | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [userBet, setUserBet] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [roundsPerMatch, setRoundsPerMatch] = useState(200)
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(
    ALL_STRATEGIES.slice(0, 6) // Start with 6 strategies
  )

  // Initialize tournament engine
  const tournamentEngine = new TournamentEngine(
    DEFAULT_PAYOFF_MATRIX,
    roundsPerMatch,
    0 // No noise in tournament
  )

  const runTournament = () => {
    setIsRunning(true)
    setShowResults(false)
    
    // Small delay to allow UI to update
    setTimeout(() => {
      const newTournament = tournamentEngine.runTournament(selectedStrategies)
      setTournament(newTournament)
      setIsRunning(false)
      setShowResults(true)
    }, 500)
  }

  const handleBet = (strategyId: string) => {
    setUserBet(strategyId)
  }

  const checkBetResult = () => {
    if (!tournament || !userBet) return null
    
    const winner = tournament.winner
    if (!winner) return null
    
    return winner.id === userBet
  }

  const formatData = (standings: StrategyStats[]) => {
    return standings.map(stat => ({
      name: selectedStrategies.find(s => s.id === stat.strategyId)?.name || stat.strategyId,
      score: stat.totalScore,
      id: stat.strategyId,
      cooperationRate: Math.round(stat.cooperationRate * 100)
    }))
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Tournament: Strategy Competition</CardTitle>
        <p className="text-muted-foreground">
          Watch strategies compete against each other and bet on which one will win
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!userBet && !isRunning && !showResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Place your bet</h3>
            <p>Which strategy do you think will win the tournament?</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedStrategies.map((strategy) => (
                <Button
                  key={strategy.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center justify-center"
                  style={{ borderColor: strategy.color }}
                  onClick={() => handleBet(strategy.id)}
                >
                  <span className="font-bold">{strategy.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{strategy.description}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {userBet && !isRunning && !showResults && (
          <div className="text-center space-y-4">
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-base"
              style={{ borderColor: selectedStrategies.find(s => s.id === userBet)?.color }}
            >
              Your bet: {selectedStrategies.find(s => s.id === userBet)?.name}
            </Badge>
            
            <div>
              <Button onClick={runTournament} className="mx-auto">
                Start Tournament
              </Button>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Running tournament matches...</p>
          </div>
        )}

        {showResults && tournament && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tournament Results</h3>
              {checkBetResult() !== null && (
                <Badge variant={checkBetResult() ? "default" : "destructive"}>
                  {checkBetResult() ? "Your bet won!" : "Your bet lost!"}
                </Badge>
              )}
            </div>

            {/* Standings Chart */}
            <div className="h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatData(tournament.rounds[0].standings)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value, name === "score" ? "Total Score" : "Cooperation %"]}
                    labelFormatter={(label) => `Strategy: ${label}`}
                  />
                  <Bar dataKey="score" name="Total Score">
                    {formatData(tournament.rounds[0].standings).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedStrategies.find(s => s.id === entry.id)?.color || "#000"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Winner */}
            {tournament.winner && (
              <Card className="border-2" style={{ borderColor: tournament.winner.color }}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Tournament Winner</h3>
                    <div className="text-3xl font-bold" style={{ color: tournament.winner.color }}>
                      {tournament.winner.name}
                    </div>
                    <p className="text-muted-foreground">{tournament.winner.description}</p>
                    
                    <div className="mt-4 flex justify-center space-x-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Score</div>
                        <div className="text-2xl font-bold">
                          <AnimatedCounter 
                            value={tournament.rounds[0].standings[0].totalScore} 
                            duration={1.5}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cooperation Rate</div>
                        <div className="text-2xl font-bold">
                          {Math.round(tournament.rounds[0].standings[0].cooperationRate * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => {
                setUserBet(null)
                setShowResults(false)
                setTournament(null)
              }}>
                New Tournament
              </Button>
              <Button onClick={onComplete}>Continue to Evolution</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 