"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Strategy = "cooperate" | "defect" | null

interface GameResult {
  player1Score: number
  player2Score: number
  player1Strategy: Strategy
  player2Strategy: Strategy
}

export function PrisonersDilemma() {
  const [player1Strategy, setPlayer1Strategy] = useState<Strategy>(null)
  const [player2Strategy, setPlayer2Strategy] = useState<Strategy>(null)
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [currentRound, setCurrentRound] = useState(1)

  const payoffMatrix = {
    cooperate: { cooperate: [3, 3], defect: [0, 5] },
    defect: { cooperate: [5, 0], defect: [1, 1] }
  }

  const playRound = () => {
    if (!player1Strategy || !player2Strategy) return

    const [p1Score, p2Score] = payoffMatrix[player1Strategy][player2Strategy]
    
    const result: GameResult = {
      player1Score: p1Score,
      player2Score: p2Score,
      player1Strategy,
      player2Strategy
    }

    setGameHistory(prev => [...prev, result])
    setCurrentRound(prev => prev + 1)
    setPlayer1Strategy(null)
    setPlayer2Strategy(null)
  }

  const resetGame = () => {
    setGameHistory([])
    setCurrentRound(1)
    setPlayer1Strategy(null)
    setPlayer2Strategy(null)
  }

  const totalScores = gameHistory.reduce(
    (acc, game) => ({
      player1: acc.player1 + game.player1Score,
      player2: acc.player2 + game.player2Score
    }),
    { player1: 0, player2: 0 }
  )

  return (
    <div className="space-y-4">
      {/* Payoff Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payoff Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div></div>
            <div className="text-center font-semibold">Cooperate</div>
            <div className="text-center font-semibold">Defect</div>
            <div className="font-semibold">Cooperate</div>
            <div className="text-center bg-green-100 dark:bg-green-900 p-2 rounded">3, 3</div>
            <div className="text-center bg-red-100 dark:bg-red-900 p-2 rounded">0, 5</div>
            <div className="font-semibold">Defect</div>
            <div className="text-center bg-red-100 dark:bg-red-900 p-2 rounded">5, 0</div>
            <div className="text-center bg-yellow-100 dark:bg-yellow-900 p-2 rounded">1, 1</div>
          </div>
        </CardContent>
      </Card>

      {/* Current Round */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Player 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={player1Strategy === "cooperate" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlayer1Strategy("cooperate")}
              className="w-full"
            >
              Cooperate
            </Button>
            <Button
              variant={player1Strategy === "defect" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlayer1Strategy("defect")}
              className="w-full"
            >
              Defect
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Player 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={player2Strategy === "cooperate" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlayer2Strategy("cooperate")}
              className="w-full"
            >
              Cooperate
            </Button>
            <Button
              variant={player2Strategy === "defect" ? "default" : "outline"}
              size="sm"
              onClick={() => setPlayer2Strategy("defect")}
              className="w-full"
            >
              Defect
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        <Button
          onClick={playRound}
          disabled={!player1Strategy || !player2Strategy}
          className="flex-1"
        >
          Play Round {currentRound}
        </Button>
        <Button variant="outline" onClick={resetGame}>
          Reset
        </Button>
      </div>

      {/* Scores */}
      {gameHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalScores.player1}</div>
                <div className="text-xs text-muted-foreground">Player 1</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalScores.player2}</div>
                <div className="text-xs text-muted-foreground">Player 2</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game History */}
      {gameHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Game History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {gameHistory.map((game, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>Round {index + 1}</span>
                  <span>
                    {game.player1Strategy} vs {game.player2Strategy}
                  </span>
                  <span>
                    {game.player1Score} - {game.player2Score}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}