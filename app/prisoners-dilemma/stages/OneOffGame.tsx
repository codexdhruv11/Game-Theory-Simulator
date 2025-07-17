"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, CheckCircle, TrendingUp, ThumbsUp, ThumbsDown, History, Award, AlertTriangle, Info } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { useEntranceAnimation, createStaggeredDelays } from "@/lib/animation-utils"

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
  const [opponentStrategy, setOpponentStrategy] = useState<string | null>(null)
  const [headerRef, headerVisible] = useEntranceAnimation()
  const [gameRef, gameVisible] = useEntranceAnimation({ threshold: 0.1 })
  const [statsRef, statsVisible] = useEntranceAnimation({ threshold: 0.1 })
  
  // Animation delays
  const staggerDelays = createStaggeredDelays(5, 100, 200)

  const opponentStrategies = [
    { name: "Always Cooperate", move: "cooperate" as Move },
    { name: "Always Defect", move: "defect" as Move },
    { name: "Random", move: () => Math.random() < 0.5 ? "cooperate" as Move : "defect" as Move }
  ]

  const playGame = (selectedMove: Move) => {
    const opponent = opponentStrategies[Math.floor(Math.random() * opponentStrategies.length)]
    const opponentMove = typeof opponent.move === "function" ? opponent.move() : opponent.move
    
    const [playerScore, opponentScore] = PAYOFF_MATRIX[selectedMove][opponentMove] as [number, number]
    
    const result: GameResult = {
      playerMove: selectedMove,
      opponentMove,
      playerScore,
      opponentScore
    }
    
    setOpponentStrategy(opponent.name)
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
    setOpponentStrategy(null)
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
  
  // Get outcome description
  const getOutcomeDescription = (result: GameResult) => {
    if (result.playerMove === "cooperate" && result.opponentMove === "cooperate") {
      return "Mutual Cooperation";
    } else if (result.playerMove === "defect" && result.opponentMove === "defect") {
      return "Mutual Defection";
    } else if (result.playerMove === "cooperate" && result.opponentMove === "defect") {
      return "You were exploited";
    } else {
      return "You exploited them";
    }
  }
  
  // Get outcome color
  const getOutcomeColor = (result: GameResult) => {
    if (result.playerMove === "cooperate" && result.opponentMove === "cooperate") {
      return "bg-green-500";
    } else if (result.playerMove === "defect" && result.opponentMove === "defect") {
      return "bg-yellow-500";
    } else if (result.playerMove === "cooperate" && result.opponentMove === "defect") {
      return "bg-red-500";
    } else {
      return "bg-blue-500";
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Instructions */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              One-Off Prisoner's Dilemma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Play single rounds against different opponents. Each game is independent - 
              there's no memory or future consequences.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Remember:</strong> In a one-off game, the Nash equilibrium is for both players to defect, 
                  even though mutual cooperation would be better for both.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Game Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Play */}
        <motion.div
          ref={gameRef}
          initial={{ opacity: 0, x: -20 }}
          animate={gameVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-t-4 border-t-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Make Your Choice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!gameResult ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="game-choice"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <motion.p 
                      className="text-center text-lg text-gray-700 dark:text-gray-300 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: staggerDelays[0] / 1000 }}
                    >
                      What will you do?
                    </motion.p>
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: staggerDelays[1] / 1000 }}
                    >
                      <Button
                        variant={playerMove === "cooperate" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setPlayerMove("cooperate")}
                        className="h-28 flex flex-col gap-3 relative overflow-hidden group transition-all duration-300 hover:scale-105"
                      >
                        <div className={`absolute inset-0 bg-green-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ${playerMove === "cooperate" ? "scale-x-100" : ""}`}></div>
                        <ThumbsUp className="w-6 h-6" />
                        <div className="flex flex-col gap-1 relative z-10">
                          <span className="text-xl font-bold">Cooperate</span>
                          <span className="text-sm opacity-75">Stay Silent</span>
                        </div>
                      </Button>
                      <Button
                        variant={playerMove === "defect" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setPlayerMove("defect")}
                        className="h-28 flex flex-col gap-3 relative overflow-hidden group transition-all duration-300 hover:scale-105"
                      >
                        <div className={`absolute inset-0 bg-red-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ${playerMove === "defect" ? "scale-x-100" : ""}`}></div>
                        <ThumbsDown className="w-6 h-6" />
                        <div className="flex flex-col gap-1 relative z-10">
                          <span className="text-xl font-bold">Defect</span>
                          <span className="text-sm opacity-75">Betray</span>
                        </div>
                      </Button>
                    </motion.div>
                    {playerMove && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Button 
                          onClick={() => playGame(playerMove)} 
                          className="w-full bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                          size="lg"
                        >
                          Play Round
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="game-result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="text-center"
                    >
                      <h3 className="text-xl font-bold mb-2">Round Result</h3>
                      <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-4 ${getOutcomeColor(gameResult)}`}>
                        {getOutcomeDescription(gameResult)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <motion.div 
                          className="text-center p-4 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md"
                          initial={{ x: -20 }}
                          animate={{ x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                        >
                          <div className="text-lg font-semibold mb-2">You</div>
                          <Badge 
                            variant={gameResult.playerMove === "cooperate" ? "secondary" : "destructive"}
                            className="mb-3 px-3 py-1"
                          >
                            {gameResult.playerMove === "cooperate" ? "Cooperated" : "Defected"}
                          </Badge>
                          <div className="text-3xl font-bold">
                            <AnimatedCounter 
                              value={gameResult.playerScore} 
                              duration={1.2}
                            />
                            <span className="text-lg ml-1">points</span>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="text-center p-4 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md"
                          initial={{ x: 20 }}
                          animate={{ x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
                        >
                          <div className="text-lg font-semibold mb-2">Opponent</div>
                          <Badge 
                            variant={gameResult.opponentMove === "cooperate" ? "secondary" : "destructive"}
                            className="mb-3 px-3 py-1"
                          >
                            {gameResult.opponentMove === "cooperate" ? "Cooperated" : "Defected"}
                          </Badge>
                          <div className="text-3xl font-bold">
                            <AnimatedCounter 
                              value={gameResult.opponentScore} 
                              duration={1.2}
                            />
                            <span className="text-lg ml-1">points</span>
                          </div>
                        </motion.div>
                      </div>
                      
                      {opponentStrategy && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                        >
                          Opponent strategy: <span className="font-medium">{opponentStrategy}</span>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Button 
                        onClick={resetGame} 
                        variant="default" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Play Again
                      </Button>
                      <Button 
                        onClick={resetAll} 
                        variant="outline" 
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset All
                      </Button>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, x: 20 }}
          animate={statsVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-t-4 border-t-purple-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: staggerDelays[0] / 1000 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Games Played</div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={gamesPlayed} />
                    </div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: staggerDelays[1] / 1000 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Score</div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={totalScore} />
                    </div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: staggerDelays[2] / 1000 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={averageScore} format="decimal" decimalPlaces={1} />
                    </div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: staggerDelays[3] / 1000 }}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cooperation</div>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter 
                        value={cooperationRate * 100} 
                        format="percentage" 
                        decimalPlaces={0} 
                      />
                    </div>
                  </motion.div>
                </div>
                
                {gameHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: staggerDelays[4] / 1000 }}
                  >
                    <h4 className="font-semibold mb-2">Recent Games</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {gameHistory.slice(-5).reverse().map((game, index) => (
                        <motion.div 
                          key={index} 
                          className={`flex justify-between text-sm p-1 rounded ${index === 0 ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <span>
                            {game.playerMove === "cooperate" ? "C" : "D"} vs{" "}
                            {game.opponentMove === "cooperate" ? "C" : "D"}
                          </span>
                          <span className="font-semibold">
                            {game.playerScore} pts
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && gameResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 overflow-hidden shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  What Just Happened?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-gray-700 dark:text-gray-300">
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
                
                <div className="bg-white/70 dark:bg-gray-800/50 rounded-lg p-4 mt-2">
                  <h4 className="font-medium mb-2">Game Theory Insight:</h4>
                  <p className="text-sm">
                    In a one-off game, defection is the dominant strategy because it gives a better payoff regardless of what the other player does. 
                    This leads to the Nash equilibrium of mutual defection (1,1), despite the fact that mutual cooperation (3,3) would be better for both players.
                  </p>
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
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden shadow-lg">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-green-400/10 blur-2xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl" />
            </div>
            <CardContent className="p-8 relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                One-Off Games Mastered!
              </motion.h3>
              <motion.p 
                className="text-green-600 dark:text-green-300 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                You've experienced the Nash equilibrium in action. Ready to see how repetition changes everything?
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button 
                  onClick={handleComplete} 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  size="lg"
                >
                  Continue to Iterated Game
                </Button>
              </motion.div>
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