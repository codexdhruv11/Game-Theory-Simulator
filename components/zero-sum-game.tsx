"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ZeroSumGame() {
  const [gameType, setGameType] = useState<"matching" | "rps">("matching")
  
  const games = {
    matching: {
      name: "Matching Pennies",
      matrix: [
        [1, -1],
        [-1, 1]
      ],
      strategies: ["Heads", "Tails"],
      description: "Player 1 wins when coins match"
    },
    rps: {
      name: "Rock Paper Scissors",
      matrix: [
        [0, -1, 1],
        [1, 0, -1],
        [-1, 1, 0]
      ],
      strategies: ["Rock", "Paper", "Scissors"],
      description: "Classic RPS game"
    }
  }

  const currentGame = games[gameType]

  const calculateMinimax = () => {
    if (gameType === "matching") {
      return {
        value: 0,
        strategy: "Mixed: 50% Heads, 50% Tails"
      }
    } else {
      return {
        value: 0,
        strategy: "Mixed: 33.3% each strategy"
      }
    }
  }

  const minimax = calculateMinimax()

  return (
    <div className="space-y-4">
      {/* Game Selection */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Game Type:</div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={gameType === "matching" ? "default" : "outline"}
            size="sm"
            onClick={() => setGameType("matching")}
          >
            Matching Pennies
          </Button>
          <Button
            variant={gameType === "rps" ? "default" : "outline"}
            size="sm"
            onClick={() => setGameType("rps")}
          >
            Rock Paper Scissors
          </Button>
        </div>
      </div>

      {/* Game Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{currentGame.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs mb-2 text-muted-foreground">
            {currentGame.description}
          </div>
          <div className={`grid gap-1 text-xs ${gameType === "rps" ? "grid-cols-4" : "grid-cols-3"}`}>
            <div></div>
            {currentGame.strategies.map((strategy, index) => (
              <div key={index} className="text-center font-semibold">{strategy}</div>
            ))}
            {currentGame.strategies.map((rowStrategy, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div className="font-semibold">{rowStrategy}</div>
                {currentGame.matrix[rowIndex].map((value, colIndex) => (
                  <div key={`cell-${rowIndex}-${colIndex}`} className={`text-center p-2 rounded ${
                    value > 0 ? "bg-green-100 dark:bg-green-900" :
                    value < 0 ? "bg-red-100 dark:bg-red-900" :
                    "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minimax Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Minimax Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Game Value:</strong> {minimax.value}
            </div>
            <div className="text-sm">
              <strong>Optimal Strategy:</strong>
            </div>
            <div className="bg-muted p-2 rounded text-xs">
              {minimax.strategy}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              In zero-sum games, one player&apos;s gain equals the other&apos;s loss
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}