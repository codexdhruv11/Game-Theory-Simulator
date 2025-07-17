"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { PayoffMatrix } from "../charts/PayoffMatrix"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { PrisonersDilemmaGame } from "../engine/pdCore"
import { ALL_STRATEGIES } from "../engine/strategies"
import { GameResult } from "../types"

interface IteratedGameProps {
  onComplete: () => void
}

export function IteratedGame({ onComplete }: IteratedGameProps) {
  const [selectedOpponent, setSelectedOpponent] = useState(ALL_STRATEGIES[2]) // Tit for Tat
  const [game] = useState(new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX))
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [maxRounds, setMaxRounds] = useState(10)
  const [userChoice, setUserChoice] = useState<"cooperate" | "defect" | null>(null)
  const [isGameActive, setIsGameActive] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const startGame = () => {
    game.reset()
    setGameHistory([])
    setCurrentRound(0)
    setIsGameActive(true)
    setGameComplete(false)
    setShowResult(false)
    setUserChoice(null)
  }

  const playRound = (userMove: "cooperate" | "defect") => {
    if (!isGameActive || currentRound >= maxRounds) return

    // Get opponent's move based on history
    const opponentHistory = gameHistory.map(r => r.player1Move) // User's previous moves
    const opponentMove = selectedOpponent.getMove(gameHistory, opponentHistory)

    // Create game result
    const [userScore, opponentScore] = DEFAULT_PAYOFF_MATRIX[userMove][opponentMove]
    const result: GameResult = {
      player1Move: userMove,
      player2Move: opponentMove,
      player1Score: userScore,
      player2Score: opponentScore,
      round: currentRound + 1
    }

    setGameHistory(prev => [...prev, result])
    setCurrentRound(prev => prev + 1)
    setUserChoice(userMove)
    setShowResult(true)

    // Check if game is complete
    if (currentRound + 1 >= maxRounds) {
      setIsGameActive(false)
      setGameComplete(true)
    }
  }

  const nextRound = () => {
    setUserChoice(null)
    setShowResult(false)
  }

  const getTotalScores = () => {
    return gameHistory.reduce(
      (totals, result) => ({
        user: totals.user + result.player1Score,
        opponent: totals.opponent + result.player2Score
      }),
      { user: 0, opponent: 0 }
    )
  }

  const getCooperationRates = () => {
    if (gameHistory.length === 0) return { user: 0, opponent: 0 }
    
    const userCooperations = gameHistory.filter(r => r.player1Move === "cooperate").length
    const opponentCooperations = gameHistory.filter(r => r.player2Move === "cooperate").length
    
    return {
      user: userCooperations / gameHistory.length,
      opponent: opponentCooperations / gameHistory.length
    }
  }

  const getLastResult = () => {
    return gameHistory[gameHistory.length - 1]
  }

  const getStrategyAnalysis = () => {
    if (gameHistory.length < 3) return ""
    
    const recentHistory = gameHistory.slice(-3)
    const userMoves = recentHistory.map(r => r.player1Move)
    const opponentMoves = recentHistory.map(r => r.player2Move)
    
    if (selectedOpponent.id === "tit_for_tat") {
      if (opponentMoves.every(m => m === "cooperate")) {
        return "Tit for Tat is cooperating because you've been cooperative!"
      } else if (opponentMoves[opponentMoves.length - 1] === "defect") {
        return "Tit for Tat defected because you defected last round."
      }
    }
    
    return "Watch how your opponent's strategy responds to your choices!"
  }

  const progress = (currentRound / maxRounds) * 100
  const totals = getTotalScores()
  const cooperationRates = getCooperationRates()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Iterated Prisoner's Dilemma</CardTitle>
          <p className="text-sm text-muted-foreground">
            Play multiple rounds against the same opponent. Now memory and reputation matter!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Setup */}
          {!isGameActive && !gameComplete && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose your opponent:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_STRATEGIES.slice(0, 6).map((strategy) => (
                    <Button
                      key={strategy.id}
                      variant={selectedOpponent.id === strategy.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedOpponent(strategy)}
                      className="text-xs"
                    >
                      {strategy.name}
                    </Button>
                  ))}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedOpponent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOpponent.description}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedOpponent.isNice && <Badge variant="secondary" className="text-xs">Nice</Badge>}
                    {selectedOpponent.isProvokable && <Badge variant="secondary" className="text-xs">Provocable</Badge>}
                    {selectedOpponent.isForgiving && <Badge variant="secondary" className="text-xs">Forgiving</Badge>}
                    {selectedOpponent.isClear && <Badge variant="secondary" className="text-xs">Clear</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of rounds: {maxRounds}</label>
                <Slider
                  value={[maxRounds]}
                  onValueChange={(value) => setMaxRounds(value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                Start Iterated Game
              </Button>
            </div>
          )}

          {/* Game Progress */}
          {isGameActive && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Round {currentRound + 1} of {maxRounds}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Current Round */}
          {isGameActive && !showResult && (
            <div className="space-y-4">
              <PayoffMatrix 
                matrix={DEFAULT_PAYOFF_MATRIX}
                highlightCell={null}
                showLabels={true}
              />
              
              <div className="space-y-3">
                <p className="text-sm font-medium text-center">Round {currentRound + 1} - Make your choice:</p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => playRound("cooperate")}
                    className="flex-1"
                    size="lg"
                  >
                    COOPERATE
                  </Button>
                  <Button
                    onClick={() => playRound("defect")}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    DEFECT
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Round Result */}
          {showResult && isGameActive && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Round {currentRound} Result</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">You</p>
                      <Badge variant={userChoice === "cooperate" ? "default" : "destructive"}>
                        {userChoice?.toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold">{getLastResult()?.player1Score} points</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{selectedOpponent.name}</p>
                      <Badge variant={getLastResult()?.player2Move === "cooperate" ? "default" : "destructive"}>
                        {getLastResult()?.player2Move.toUpperCase()}
                      </Badge>
                      <p className="text-lg font-bold">{getLastResult()?.player2Score} points</p>
                    </div>
                  </div>
                  
                  {getStrategyAnalysis() && (
                    <p className="text-sm text-muted-foreground italic mt-2">
                      {getStrategyAnalysis()}
                    </p>
                  )}
                </div>
              </div>

              {currentRound < maxRounds && (
                <Button onClick={nextRound} className="w-full">
                  Next Round
                </Button>
              )}
            </div>
          )}

          {/* Game Statistics */}
          {gameHistory.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">You:</span>
                      <span className="font-bold">{totals.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{selectedOpponent.name}:</span>
                      <span className="font-bold">{totals.opponent}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Average per round:</span>
                      <span>{(totals.user / gameHistory.length).toFixed(1)} vs {(totals.opponent / gameHistory.length).toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cooperation Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">You:</span>
                      <span className="font-bold">{Math.round(cooperationRates.user * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{selectedOpponent.name}:</span>
                      <span className="font-bold">{Math.round(cooperationRates.opponent * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Game History */}
          {gameHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Game History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {gameHistory.map((result, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>Round {result.round}</span>
                      <span>
                        <Badge variant={result.player1Move === "cooperate" ? "secondary" : "destructive"} className="text-xs mr-1">
                          {result.player1Move === "cooperate" ? "C" : "D"}
                        </Badge>
                        vs
                        <Badge variant={result.player2Move === "cooperate" ? "secondary" : "destructive"} className="text-xs ml-1">
                          {result.player2Move === "cooperate" ? "C" : "D"}
                        </Badge>
                      </span>
                      <span>{result.player1Score} - {result.player2Score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Educational Insights */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Iterated Game Insights</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Reputation matters when you play repeatedly</li>
              <li>• Strategies can learn and adapt to your behavior</li>
              <li>• Cooperation becomes more viable with repeated interaction</li>
              <li>• "Nice" strategies often perform well in the long run</li>
            </ul>
          </div>

          {gameComplete && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-2">Game Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Final Score: You {totals.user} - {totals.opponent} {selectedOpponent.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {totals.user > totals.opponent ? "You won!" : 
                   totals.opponent > totals.user ? "Your opponent won!" : "It's a tie!"}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={startGame} variant="outline" className="flex-1">
                  Play Again
                </Button>
                <Button onClick={onComplete} className="flex-1">
                  Continue to Tournament
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}