"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, CheckCircle, TrendingUp } from "lucide-react"

interface OneOffGameProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

type Move = "cooperate" | "defect"

interface GameResult {
  playerMove: Move
  opponentMove: Move
  playerScore: number
  opponentScore: number
}

const PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
}

export function OneOffGame({ onComplete, isCompleted }: OneOffGameProps) {
  const [playerMove, setPlayerMove] = useState<Move | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [gamesPlayed, setGamesPlayed] = useState(0)

  const opponentStrategies = [
    { name: "Always Cooperate", move: "cooperate" as Move },
    { name: "Always Defect", move: "defect" as Move },
    { name: "Random", move: () => Math.random() < 0.5 ? "cooperate" as Move : "defect" as Move }
  ]

  const playGame = (selectedMove: Move) => {
    const opponent = opponentStrategies[Math.floor(Math.random() * opponentStrategies.length)]
    const opponentMove = typeof opponent.move === "function" ? opponent.move() : opponent.move
    
    const [playerScore, opponentScore] = PAYOFF_MATRIX[selectedMove][opponentMove]
    
    const result: GameResult = {
      playerMove: selectedMove,
      opponentMove,
      playerScore,
      opponentScore
    }
    
    setGameResult(result)
    setGameHistory(prev => [...prev, result])
    setGamesPlayed(prev => prev + 1)
    setPlayerMove(null)
    setShowExplanation(true)
  }

  const resetGame = () => {
    setPlayerMove(null)
    setGameResult(null)
    setShowExplanation(false)
  }

  const resetAll = () => {
    setGameHistory([])
    setGamesPlayed(0)
    resetGame()
  }

  const handleComplete = () => {
    const totalScore = gameHistory.reduce((sum, game) => sum + game.playerScore, 0)
    const cooperationRate = gameHistory.filter(game => game.playerMove === "cooperate").length / gameHistory.length
    
    onComplete({
      gamesPlayed,
      scoreEarned: totalScore,
      cooperationRate,
      achievements: gamesPlayed >= 5 ? ["Game Explorer"] : []
    })
  }

  const totalScore = gameHistory.reduce((sum, game) => sum + game.playerScore, 0)
  const averageScore = gameHistory.length > 0 ? totalScore / gameHistory.length : 0
  const cooperationRate = gameHistory.length > 0 ? 
    gameHistory.filter(game => game.playerMove === "cooperate").length / gameHistory.length : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-6 h-6" />
            One-Off Prisoner's Dilemma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Play single rounds against different opponents. Each game is independent - 
            there's no memory or future consequences.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Remember:</strong> In a one-off game, the Nash equilibrium is for both players to defect, 
              even though mutual cooperation would be better for both.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Play */}
        <Card>
          <CardHeader>
            <CardTitle>Make Your Choice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!gameResult ? (
              <>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                  What will you do?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={playerMove === "cooperate" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setPlayerMove("cooperate")}
                    className="h-20 flex flex-col gap-2"
                  >
                    <span className="text-lg font-semibold">Cooperate</span>
                    <span className="text-sm opacity-75">Stay Silent</span>
                  </Button>
                  <Button
                    variant={playerMove === "defect" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setPlayerMove("defect")}
                    className="h-20 flex flex-col gap-2"
                  >
                    <span className="text-lg font-semibold">Defect</span>
                    <span className="text-sm opacity-75">Betray</span>
                  </Button>
                </div>
                {playerMove && (
                  <Button 
                    onClick={() => playGame(playerMove)} 
                    className="w-full"
                    size="lg"
                  >
                    Play Round
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Round Result</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">You</div>
                      <Badge variant={gameResult.playerMove === "cooperate" ? "secondary" : "destructive"}>
                        {gameResult.playerMove === "cooperate" ? "Cooperated" : "Defected"}
                      </Badge>
                      <div className="text-2xl font-bold mt-2">
                        {gameResult.playerScore} points
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Opponent</div>
                      <Badge variant={gameResult.opponentMove === "cooperate" ? "secondary" : "destructive"}>
                        {gameResult.opponentMove === "cooperate" ? "Cooperated" : "Defected"}
                      </Badge>
                      <div className="text-2xl font-bold mt-2">
                        {gameResult.opponentScore} points
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={resetGame} variant="outline" className="flex-1">
                    Play Again
                  </Button>
                  <Button onClick={resetAll} variant="outline">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{gamesPlayed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(cooperationRate * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cooperation Rate</div>
                </div>
              </div>
              
              {gameHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Games</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {gameHistory.slice(-5).reverse().map((game, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {game.playerMove === "cooperate" ? "C" : "D"} vs{" "}
                          {game.opponentMove === "cooperate" ? "C" : "D"}
                        </span>
                        <span className="font-semibold">
                          {game.playerScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && gameResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  What Just Happened?
                </h3>
                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  {gameResult.playerMove === "cooperate" && gameResult.opponentMove === "cooperate" && (
                    <p>Both of you cooperated! This is the best collective outcome (3+3=6 total points).</p>
                  )}
                  {gameResult.playerMove === "defect" && gameResult.opponentMove === "defect" && (
                    <p>Both of you defected. This is the Nash equilibrium but worst collective outcome (1+1=2 total points).</p>
                  )}
                  {gameResult.playerMove === "cooperate" && gameResult.opponentMove === "defect" && (
                    <p>You cooperated but were betrayed. You got the "sucker's payoff" while they got the maximum.</p>
                  )}
                  {gameResult.playerMove === "defect" && gameResult.opponentMove === "cooperate" && (
                    <p>You defected while they cooperated. You got the maximum payoff while they got the minimum.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion */}
      {gamesPlayed >= 5 && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                One-Off Games Mastered!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've experienced the Nash equilibrium in action. Ready to see how repetition changes everything?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Iterated Game
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