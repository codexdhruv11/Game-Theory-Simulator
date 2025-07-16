"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type GameType = "coordination" | "chicken";

interface GameDefinition {
  name: string;
  matrix: number[][][];
  strategies: string[];
  equilibria: string[];
}

export function NashEquilibrium() {
  const [selectedGame, setSelectedGame] = useState<GameType>("coordination")
  
  const games: Record<GameType, GameDefinition> = {
    coordination: {
      name: "Coordination Game",
      matrix: [
        [[2, 2], [0, 0]],
        [[0, 0], [1, 1]]
      ],
      strategies: ["Strategy A", "Strategy B"],
      equilibria: ["(A, A)", "(B, B)"]
    },
    chicken: {
      name: "Chicken Game",
      matrix: [
        [[0, 0], [1, -1]],
        [[-1, 1], [-10, -10]]
      ],
      strategies: ["Swerve", "Straight"],
      equilibria: ["(Swerve, Straight)", "(Straight, Swerve)"]
    }
  }

  const currentGame = games[selectedGame]

  const findNashEquilibria = (): string[] => {
    // For demonstration, we'll show the pre-calculated equilibria
    return currentGame.equilibria
  }

  return (
    <div className="space-y-4" data-testid="nash-equilibrium-component">
      {/* Game Selection */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">Select Game:</div>
        <div className="grid grid-cols-1 gap-2" data-testid="game-selection">
          <Button
            variant={selectedGame === "coordination" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGame("coordination")}
            data-testid="coordination-button"
          >
            Coordination
          </Button>
          <Button
            variant={selectedGame === "chicken" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGame("chicken")}
            data-testid="chicken-button"
          >
            Chicken
          </Button>
        </div>
      </div>

      {/* Game Matrix */}
      <Card data-testid="game-matrix">
        <CardHeader>
          <CardTitle className="text-sm">{currentGame.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div></div>
            <div className="text-center font-semibold">{currentGame.strategies[0]}</div>
            <div className="text-center font-semibold">{currentGame.strategies[1]}</div>
            <div className="font-semibold">{currentGame.strategies[0]}</div>
            <div className={`text-center bg-muted p-2 rounded ${selectedGame === "coordination" ? "bg-green-100 dark:bg-green-900" : ""}`}>
              {currentGame.matrix[0][0][0]}, {currentGame.matrix[0][0][1]}
            </div>
            <div className="text-center bg-muted p-2 rounded">
              {currentGame.matrix[0][1][0]}, {currentGame.matrix[0][1][1]}
            </div>
            <div className="font-semibold">{currentGame.strategies[1]}</div>
            <div className="text-center bg-muted p-2 rounded">
              {currentGame.matrix[1][0][0]}, {currentGame.matrix[1][0][1]}
            </div>
            <div className={`text-center bg-muted p-2 rounded ${selectedGame === "coordination" ? "bg-green-100 dark:bg-green-900" : ""}`}>
              {currentGame.matrix[1][1][0]}, {currentGame.matrix[1][1][1]}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nash Equilibria */}
      <Card data-testid="nash-equilibria">
        <CardHeader>
          <CardTitle className="text-sm">Nash Equilibria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {findNashEquilibria().map((equilibrium: string, index: number) => (
              <div key={index} className="bg-green-100 dark:bg-green-900 p-2 rounded text-sm" data-testid="equilibrium-item">
                {equilibrium}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Nash equilibrium: No player can improve by unilaterally changing strategy
          </div>
        </CardContent>
      </Card>
    </div>
  )
}