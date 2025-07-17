"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"

interface TutorialProps {
  onComplete: () => void
}

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userChoice, setUserChoice] = useState<"cooperate" | "defect" | null>(null)
  const [opponentChoice] = useState<"cooperate" | "defect">("cooperate")
  const [showResult, setShowResult] = useState(false)

  const steps = [
    {
      title: "Welcome to the Evolution of Trust",
      content: "In this interactive guide, you'll learn about game theory, cooperation, and how trust evolves in society. We'll start with the famous Prisoner's Dilemma.",
      action: null
    },
    {
      title: "The Prisoner's Dilemma",
      content: "Imagine you and another person are arrested and held in separate cells. You can either cooperate with each other (stay silent) or defect (betray the other). Your payoff depends on both choices.",
      action: null
    },
    {
      title: "Understanding Payoffs",
      content: "Let's look at the payoff matrix. The numbers show what each player gets based on their combined choices:",
      action: "matrix"
    },
    {
      title: "Make Your Choice",
      content: "Now it's your turn! The other player has chosen to COOPERATE. What will you do?",
      action: "choice"
    },
    {
      title: "The Dilemma Explained",
      content: "This is the heart of the dilemma: individually, defecting seems better (you get more points), but if everyone defects, everyone gets less than if everyone cooperated.",
      action: null
    }
  ]

  const currentStepData = steps[currentStep]

  const handleChoice = (choice: "cooperate" | "defect") => {
    setUserChoice(choice)
    setShowResult(true)
  }

  const getPayoff = (player1: "cooperate" | "defect", player2: "cooperate" | "defect") => {
    return DEFAULT_PAYOFF_MATRIX[player1][player2]
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setUserChoice(null)
      setShowResult(false)
    } else {
      onComplete()
    }
  }

  const renderPayoffMatrix = () => (
    <div className="my-6">
      <h4 className="text-sm font-semibold mb-3 text-center">Payoff Matrix</h4>
      <div className="grid grid-cols-3 gap-2 text-xs max-w-md mx-auto">
        <div></div>
        <div className="text-center font-semibold bg-muted p-2 rounded">Other Cooperates</div>
        <div className="text-center font-semibold bg-muted p-2 rounded">Other Defects</div>
        
        <div className="font-semibold bg-muted p-2 rounded">You Cooperate</div>
        <div className="text-center bg-green-100 dark:bg-green-900 p-3 rounded font-medium">
          <div className="text-lg">+3</div>
          <div className="text-xs text-muted-foreground">Both win</div>
        </div>
        <div className="text-center bg-red-100 dark:bg-red-900 p-3 rounded font-medium">
          <div className="text-lg">+0</div>
          <div className="text-xs text-muted-foreground">You lose</div>
        </div>
        
        <div className="font-semibold bg-muted p-2 rounded">You Defect</div>
        <div className="text-center bg-yellow-100 dark:bg-yellow-900 p-3 rounded font-medium">
          <div className="text-lg">+5</div>
          <div className="text-xs text-muted-foreground">You win big</div>
        </div>
        <div className="text-center bg-gray-100 dark:bg-gray-800 p-3 rounded font-medium">
          <div className="text-lg">+1</div>
          <div className="text-xs text-muted-foreground">Both lose</div>
        </div>
      </div>
    </div>
  )

  const renderChoice = () => (
    <div className="my-6 space-y-4">
      <div className="text-center">
        <Badge variant="outline" className="mb-4">
          Other player chose: COOPERATE
        </Badge>
      </div>
      
      {!showResult ? (
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Button
            onClick={() => handleChoice("cooperate")}
            className="h-20 flex flex-col"
            variant="outline"
          >
            <div className="text-lg font-bold">COOPERATE</div>
            <div className="text-xs">Work together</div>
          </Button>
          <Button
            onClick={() => handleChoice("defect")}
            className="h-20 flex flex-col"
            variant="outline"
          >
            <div className="text-lg font-bold">DEFECT</div>
            <div className="text-xs">Betray them</div>
          </Button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">You</div>
                    <Badge variant={userChoice === "cooperate" ? "default" : "destructive"}>
                      {userChoice?.toUpperCase()}
                    </Badge>
                    <div className="text-2xl font-bold mt-1">
                      +{userChoice ? getPayoff(userChoice, opponentChoice)[0] : 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Other</div>
                    <Badge variant="default">COOPERATE</Badge>
                    <div className="text-2xl font-bold mt-1">
                      +{userChoice ? getPayoff(userChoice, opponentChoice)[1] : 0}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-4">
                  {userChoice === "cooperate" 
                    ? "You both cooperated! This is the best outcome for society."
                    : "You defected while they cooperated. You got more points, but is this sustainable?"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tutorial: {currentStepData.title}</CardTitle>
          <Badge variant="outline">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg leading-relaxed">{currentStepData.content}</p>
        </div>

        {currentStepData.action === "matrix" && renderPayoffMatrix()}
        {currentStepData.action === "choice" && renderChoice()}

        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStepData.action === "choice" && !showResult}
          >
            {currentStep === steps.length - 1 ? "Complete Tutorial" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}