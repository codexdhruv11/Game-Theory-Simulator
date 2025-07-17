"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { ALWAYS_COOPERATE, ALWAYS_DEFECT, RANDOM } from "../engine/strategies"

interface OneOffGameProps {
  onComplete: () => void
}

type OpponentType = "cooperator" | "defector" | "random"

export function OneOffGame({ onComplete }: OneOffGameProps) {
  const [currentOpponent, setCurrentOpponent] = useState<OpponentType>("cooperator")
  const [userChoice, setUserChoice] = useState<"cooperate" | "defect" | null>(null)
  const [opponentChoice, setOpponentChoice] = useState<"cooperate" | "defect" | null>(null)
  const [gameHistory, setGameHistory] = useState<Array<{
    opponent: OpponentType
    userChoice: "cooperate" | "defect"
    opponentChoice: "cooperate" | "defect"
    userScore: number
    opponentScore: number
  }>>([])
  const [showResult, setShowResult] = useState(false)
  const [gamesCompleted, setGamesCompleted] = useState(0)

  const opponents = [
    { id: "cooperator" as OpponentType, name: "Cooperator", description: "Always cooperates", strategy: ALWAYS_COOPERATE },
    { id: "defector" as OpponentType, name: "Defector", description: "Always defects", strategy: ALWAYS_DEFECT },
    { id: "random" as OpponentType, name: "Random", description: "Randomly chooses", strategy: RANDOM }
  ]

  const totalGames = opponents.length
  const progress = (gamesCompleted / totalGames) * 100

  const getOpponentChoice = (opponentType: OpponentType): "cooperate" | "defect" => {
    switch (opponentType) {
      case "cooperator":
        return "cooperate"
      case "defector":
        return "defect"
      case "random":
        return Math.random() < 0.5 ? "cooperate" : "defect"
      default:
        return "cooperate"
    }
  }

  const handleChoice = (choice: "cooperate" | "defect") => {
    const oppChoice = getOpponentChoice(currentOpponent)
    const [userScore, oppScore] = DEFAULT_PAYOFF_MATRIX[choice][oppChoice]

    setUserChoice(choice)
    setOpponentChoice(oppChoice)
    setShowResult(true)

    const gameResult = {
      opponent: currentOpponent,
      userChoice: choice,
      opponentChoice: oppChoice,
      userScore,
      opponentScore: oppScore
    }

    setGameHistory(prev => [...prev, gameResult])
  }

  const nextGame = () => {
    const currentIndex = opponents.findIndex(opp => opp.id === currentOpponent)
    const nextIndex = currentIndex + 1

    setGamesCompleted(prev => prev + 1)

    if (nextIndex < opponents.length) {
      setCurrentOpponent(opponents[nextIndex].id)
      setUserChoice(null)
      setOpponentChoice(null)
      setShowResult(false)
    } else {
      // All games completed
      onComplete()
    }
  }

  const resetGame = () => {
    setCurrentOpponent("cooperator")
    setUserChoice(null)
    setOpponentChoice(null)
    setShowResult(false)
    setGameHistory([])
    setGamesCompleted(0)
  }

  const currentOpponentData = opponents.find(opp => opp.id === currentOpponent)!
  const totalUserScore = gameHistory.reduce((sum, game) => sum + game.userScore, 0)
  const userCooperationRate = gameHistory.length > 0 
    ? gameHistory.filter(game => game.userChoice === "cooperate").length / gameHistory.length 
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>One-Off Games</span>
            <Badge variant="outline">
              Game {gamesCompleted + 1} of {totalGames}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Play single rounds against different types of opponents to understand basic strategy dynamics.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Current Game */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              vs {currentOpponentData.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentOpponentData.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showResult ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose your move for this one-time interaction:
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleChoice("cooperate")}
                    className="h-24 flex flex-col"
                    variant="outline"
                  >
                    <div className="text-lg font-bold">COOPERATE</div>
                    <div className="text-xs text-muted-foreground">Trust them</div>
                  </Button>
                  <Button
                    onClick={() => handleChoice("defect")}
                    className="h-24 flex flex-col"
                    variant="outline"
                  >
                    <div className="text-lg font-bold">DEFECT</div>
                    <div className="text-xs text-muted-foreground">Protect yourself</div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-4">Round Result</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-sm text-muted-foreground">You</div>
                    <Badge variant={userChoice === "cooperate" ? "default" : "destructive"} className="mb-2">
                      {userChoice?.toUpperCase()}
                    </Badge>
                    <div className="text-2xl font-bold">
                      +{userChoice && opponentChoice ? DEFAULT_PAYOFF_MATRIX[userChoice][opponentChoice][0] : 0}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-sm text-muted-foreground">{currentOpponentData.name}</div>
                    <Badge variant={opponentChoice === "cooperate" ? "default" : "destructive"} className="mb-2">
                      {opponentChoice?.toUpperCase()}
                    </Badge>
                    <div className="text-2xl font-bold">
                      +{userChoice && opponentChoice ? DEFAULT_PAYOFF_MATRIX[userChoice][opponentChoice][1] : 0}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={nextGame} className="w-full">
                    {gamesCompleted + 1 < totalGames ? "Next Opponent" : "Complete Stage"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{totalUserScore}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{Math.round(userCooperationRate * 100)}%</div>
                <div className="text-xs text-muted-foreground">Cooperation Rate</div>
              </div>
            </div>

            {gameHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Game History</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {gameHistory.map((game, index) => (
                    <div key={index} className="flex justify-between text-xs p-2 bg-muted rounded">
                      <span>vs {opponents.find(o => o.id === game.opponent)?.name}</span>
                      <span>{game.userChoice[0].toUpperCase()} vs {game.opponentChoice[0].toUpperCase()}</span>
                      <span>+{game.userScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button variant="outline" onClick={resetGame} className="w-full">
                Reset Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Against Always Cooperate:</strong> Defecting gives you the maximum payoff (5 vs 3), 
              but this exploits their trust.
            </p>
            <p>
              <strong>Against Always Defect:</strong> Cooperating gives you the minimum payoff (0 vs 1), 
              so defecting is the rational choice.
            </p>
            <p>
              <strong>Against Random:</strong> The outcome is unpredictable, showing how uncertainty 
              affects decision-making.
            </p>
            <p className="text-muted-foreground italic">
              In one-off games, defection often seems rational, but what happens when you meet 
              the same people repeatedly?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}