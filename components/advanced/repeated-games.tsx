"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  playRepeatedGame,
  runTournament,
  analyzeCooperationRate,
  findNashEquilibrium,
  calculateFolkTheoremBounds,
  strategies,
  type Strategy,
  type RepeatedGameResult,
  type Tournament
} from "@/lib/game-theory/repeated-games"

export function RepeatedGames() {
  const [selectedStrategy1, setSelectedStrategy1] = useState<Strategy>(strategies[2]) // Tit for Tat
  const [selectedStrategy2, setSelectedStrategy2] = useState<Strategy>(strategies[1]) // Always Defect
  const [gameResults, setGameResults] = useState<RepeatedGameResult[]>([])
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [rounds, setRounds] = useState([50])
  const [discountFactor, setDiscountFactor] = useState([0.9])
  const [isRunning, setIsRunning] = useState(false)

  const runGame = () => {
    const results = playRepeatedGame(selectedStrategy1, selectedStrategy2, rounds[0])
    setGameResults(results)
  }

  const runFullTournament = () => {
    setIsRunning(true)
    setTimeout(() => {
      const tournamentResults = runTournament(strategies, rounds[0])
      setTournament(tournamentResults)
      setIsRunning(false)
    }, 100)
  }

  const cooperationRate = gameResults.length > 0 ? analyzeCooperationRate(gameResults) : 0
  const nashEquilibrium = findNashEquilibrium(discountFactor[0])
  const folkTheorem = calculateFolkTheoremBounds(discountFactor[0])

  const chartData = gameResults.map(result => ({
    round: result.round,
    player1Score: result.cumulativeScore1,
    player2Score: result.cumulativeScore2,
    cooperation: (result.player1Action === 'cooperate' ? 1 : 0) + (result.player2Action === 'cooperate' ? 1 : 0)
  }))

  return (
    <div className="space-y-4">
      <Tabs defaultValue="game" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="game">Head-to-Head</TabsTrigger>
          <TabsTrigger value="tournament">Tournament</TabsTrigger>
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="game" className="space-y-4">
          {/* Strategy Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strategy Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium">Rounds: {rounds[0]}</label>
                <Slider
                  value={rounds}
                  onValueChange={setRounds}
                  max={200}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Player 1 Strategy:</label>
                  <select
                    className="w-full mt-1 p-2 border rounded text-xs"
                    value={selectedStrategy1.name}
                    onChange={(e) => {
                      const strategy = strategies.find(s => s.name === e.target.value)
                      if (strategy) setSelectedStrategy1(strategy)
                    }}
                  >
                    {strategies.map(strategy => (
                      <option key={strategy.name} value={strategy.name}>
                        {strategy.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedStrategy1.description}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Player 2 Strategy:</label>
                  <select
                    className="w-full mt-1 p-2 border rounded text-xs"
                    value={selectedStrategy2.name}
                    onChange={(e) => {
                      const strategy = strategies.find(s => s.name === e.target.value)
                      if (strategy) setSelectedStrategy2(strategy)
                    }}
                  >
                    {strategies.map(strategy => (
                      <option key={strategy.name} value={strategy.name}>
                        {strategy.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedStrategy2.description}
                  </div>
                </div>
              </div>

              <Button onClick={runGame} className="w-full">
                Run Game
              </Button>
            </CardContent>
          </Card>

          {/* Game Results */}
          {gameResults.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Game Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <motion.div
                      className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="text-2xl font-bold font-mono">
                        {gameResults[gameResults.length - 1].cumulativeScore1}
                      </div>
                      <div className="text-sm">{selectedStrategy1.name}</div>
                    </motion.div>
                    <motion.div
                      className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="text-2xl font-bold font-mono">
                        {gameResults[gameResults.length - 1].cumulativeScore2}
                      </div>
                      <div className="text-sm">{selectedStrategy2.name}</div>
                    </motion.div>
                  </div>

                  <div className="text-center text-sm">
                    Cooperation Rate: <span className="font-mono">{(cooperationRate * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Score Evolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="player1Score" 
                          stroke="#3b82f6" 
                          name={selectedStrategy1.name}
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="player2Score" 
                          stroke="#ef4444" 
                          name={selectedStrategy2.name}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="tournament" className="space-y-4">
          {/* Tournament */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strategy Tournament</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Each strategy plays against every other strategy (including itself) 
                for {rounds[0]} rounds.
              </div>

              <Button 
                onClick={runFullTournament} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Running Tournament...' : 'Run Tournament'}
              </Button>

              {tournament && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="font-medium text-sm">Tournament Rankings:</div>
                  {tournament.rankings.map((ranking, index) => (
                    <motion.div
                      key={ranking.strategy}
                      className="flex justify-between items-center p-3 bg-muted rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold">#{index + 1}</div>
                        <div className="font-medium text-sm">{ranking.strategy}</div>
                      </div>
                      <div className="font-mono font-bold">
                        {ranking.averageScore.toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-4">
          {/* Folk Theorem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Folk Theorem Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium">
                  Discount Factor (δ): {discountFactor[0].toFixed(2)}
                </label>
                <Slider
                  value={discountFactor}
                  onValueChange={setDiscountFactor}
                  max={0.99}
                  min={0.1}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              <motion.div
                className="p-4 bg-muted rounded-lg"
                key={discountFactor[0]}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="space-y-2 text-sm">
                  <div className="font-medium">Nash Equilibrium Prediction:</div>
                  <div className="font-bold text-lg">{nashEquilibrium.strategy}</div>
                  <div className="text-xs text-muted-foreground">
                    {nashEquilibrium.description}
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Sustainable Payoffs:</div>
                  <div className="font-mono">
                    [{folkTheorem.minPayoff}, {folkTheorem.maxPayoff}]
                  </div>
                </div>
                <div>
                  <div className="font-medium">Cooperation Sustainable:</div>
                  <div className={folkTheorem.sustainable ? 'text-green-600' : 'text-red-600'}>
                    {folkTheorem.sustainable ? '✓ Yes' : '✗ No'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                <div className="font-medium mb-2">Folk Theorem:</div>
                <div>
                  In infinitely repeated games, any individually rational payoff 
                  can be sustained as a Nash equilibrium if players are patient enough 
                  (high discount factor).
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {/* Strategy Descriptions */}
          <div className="space-y-3">
            {strategies.map((strategy, index) => (
              <motion.Card
                key={strategy.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardHeader>
                  <CardTitle className="text-sm">{strategy.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {strategy.description}
                  </div>
                  
                  {tournament && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Tournament Score: </span>
                      <span className="font-mono">
                        {tournament.rankings.find(r => r.strategy === strategy.name)?.averageScore.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </motion.Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strategy Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Tit for Tat:</strong> Often performs well in tournaments due to 
                  its simplicity, niceness, and retaliatory nature.
                </div>
                <div>
                  <strong>Always Defect:</strong> Evolutionarily stable but leads to 
                  poor outcomes when playing against itself.
                </div>
                <div>
                  <strong>Generous Strategies:</strong> Can break cycles of retaliation 
                  but may be exploited by aggressive strategies.
                </div>
                <div>
                  <strong>Pavlov:</strong> Adapts based on success, can learn to cooperate 
                  or defect depending on opponent behavior.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}