"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Repeat, CheckCircle, TrendingUp, Users } from "lucide-react"

interface IteratedGameProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

type Move = "cooperate" | "defect"

interface GameResult {
  round: number
  playerMove: Move
  opponentMove: Move
  playerScore: number
  opponentScore: number
}

const PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
}

// Simple AI strategies
const AI_STRATEGIES = {
  "tit-for-tat": {
    name: "Tit for Tat",
    description: "Cooperates first, then copies your last move",
    getMove: (history: GameResult[]) => {
      if (history.length === 0) return "cooperate"
      return history[history.length - 1].playerMove
    }
  },
  "always-cooperate": {
    name: "Always Cooperate",
    description: "Always cooperates",
    getMove: () => "cooperate" as Move
  },
  "always-defect": {
    name: "Always Defect", 
    description: "Always defects",
    getMove: () => "defect" as Move
  },
  "grudger": {
    name: "Grudger",
    description: "Cooperates until you defect once, then always defects",
    getMove: (history: GameResult[]) => {
      return history.some(game => game.playerMove === "defect") ? "defect" : "cooperate"
    }
  },
  "random": {
    name: "Random",
    description: "Randomly cooperates or defects",
    getMove: () => Math.random() < 0.5 ? "cooperate" as Move : "defect" as Move
  }
}

export function IteratedGame({ onComplete, isCompleted }: IteratedGameProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<keyof typeof AI_STRATEGIES>("tit-for-tat")
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [playerMove, setPlayerMove] = useState<Move | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [totalRounds] = useState(10)

  const playRound = (selectedMove: Move) => {
    const strategy = AI_STRATEGIES[selectedStrategy]
    const opponentMove = strategy.getMove(gameHistory)
    
    const [playerScore, opponentScore] = PAYOFF_MATRIX[selectedMove][opponentMove]
    
    const result: GameResult = {
      round: currentRound,
      playerMove: selectedMove,
      opponentMove,
      playerScore,
      opponentScore
    }
    
    const newHistory = [...gameHistory, result]
    setGameHistory(newHistory)
    setPlayerMove(null)
    
    if (currentRound >= totalRounds) {
      setGameComplete(true)
    } else {
      setCurrentRound(prev => prev + 1)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameHistory([])
    setCurrentRound(1)
    setGameComplete(false)
    setPlayerMove(null)
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameHistory([])
    setCurrentRound(1)
    setGameComplete(false)
    setPlayerMove(null)
  }

  const handleComplete = () => {
    const totalScore = gameHistory.reduce((sum, game) => sum + game.playerScore, 0)
    const cooperationRate = gameHistory.filter(game => game.playerMove === "cooperate").length / gameHistory.length
    
    onComplete({
      gamesPlayed: gameHistory.length,
      scoreEarned: totalScore,
      cooperationRate,
      achievements: cooperationRate > 0.7 ? ["Cooperator"] : cooperationRate < 0.3 ? ["Defector"] : []
    })
  }

  const playerTotal = gameHistory.reduce((sum, game) => sum + game.playerScore, 0)
  const opponentTotal = gameHistory.reduce((sum, game) => sum + game.opponentScore, 0)
  const cooperationRate = gameHistory.length > 0 ? 
    gameHistory.filter(game => game.playerMove === "cooperate").length / gameHistory.length : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-6 h-6" />
            Iterated Prisoner's Dilemma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Now you'll play multiple rounds against the same opponent. Your history matters - 
            both you and your opponent can remember and react to past moves.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Key Insight:</strong> When games repeat, cooperation can emerge through reciprocity 
              and the threat of future retaliation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      {!gameStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Opponent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStrategy} onValueChange={(value: keyof typeof AI_STRATEGIES) => setSelectedStrategy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_STRATEGIES).map(([key, strategy]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-semibold">{strategy.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{strategy.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={startGame} size="lg" className="w-full">
              Start {totalRounds}-Round Game vs {AI_STRATEGIES[selectedStrategy].name}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Game Interface */}
      {gameStarted && !gameComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Round {currentRound} of {totalRounds}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Playing against: {AI_STRATEGIES[selectedStrategy].name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={playerMove === "cooperate" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setPlayerMove("cooperate")}
                  className="h-20 flex flex-col gap-2"
                >
                  <span className="text-lg font-semibold">Cooperate</span>
                </Button>
                <Button
                  variant={playerMove === "defect" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setPlayerMove("defect")}
                  className="h-20 flex flex-col gap-2"
                >
                  <span className="text-lg font-semibold">Defect</span>
                </Button>
              </div>
              
              {playerMove && (
                <Button 
                  onClick={() => playRound(playerMove)} 
                  className="w-full"
                  size="lg"
                >
                  Play Round {currentRound}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Current Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{playerTotal}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{opponentTotal}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Opponent Score</div>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-lg font-semibold">{(cooperationRate * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your Cooperation Rate</div>
              </div>

              {gameHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Game History</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {gameHistory.slice(-5).reverse().map((game) => (
                      <div key={game.round} className="flex justify-between text-sm">
                        <span>Round {game.round}</span>
                        <span>
                          {game.playerMove === "cooperate" ? "C" : "D"} vs{" "}
                          {game.opponentMove === "cooperate" ? "C" : "D"}
                        </span>
                        <span className="font-semibold">
                          {game.playerScore}-{game.opponentScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Game Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{playerTotal}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{opponentTotal}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Opponent Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(cooperationRate * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your Cooperation</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Complete Game History</h4>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {gameHistory.map((game) => (
                    <div key={game.round} className="text-center p-2 bg-white dark:bg-gray-700 rounded">
                      <div className="font-semibold">R{game.round}</div>
                      <div>
                        {game.playerMove === "cooperate" ? "C" : "D"} vs{" "}
                        {game.opponentMove === "cooperate" ? "C" : "D"}
                      </div>
                      <div className="text-xs">{game.playerScore}-{game.opponentScore}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetGame} variant="outline" className="flex-1">
                  Play Again
                </Button>
                <Button onClick={startGame} variant="outline" className="flex-1">
                  New Opponent
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completion */}
      {gameComplete && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Iterated Games Mastered!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've seen how repetition enables cooperation. Ready to learn about different strategies?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Strategy Learning
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