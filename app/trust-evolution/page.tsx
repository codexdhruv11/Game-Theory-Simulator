"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

// Import game stage components
import { Tutorial } from "./components/Tutorial"
import { OneOffGame } from "./components/OneOffGame"
import { IteratedGame } from "./components/IteratedGame"
import { Tournament } from "./components/Tournament"
import { Evolution } from "./components/Evolution"
import { Noise } from "./components/Noise"
import { Sandbox } from "./components/Sandbox"
import { Conclusion } from "./components/Conclusion"

type GameStage = 
  | "tutorial" 
  | "oneoff" 
  | "iterated" 
  | "tournament" 
  | "evolution" 
  | "noise" 
  | "sandbox" 
  | "conclusion"

const stages: { id: GameStage; title: string; description: string }[] = [
  { id: "tutorial", title: "Tutorial", description: "Learn the basics of trust and cooperation" },
  { id: "oneoff", title: "One-off Game", description: "Single round prisoner's dilemma" },
  { id: "iterated", title: "Iterated Game", description: "Multiple rounds with memory" },
  { id: "tournament", title: "Tournament", description: "Strategies compete against each other" },
  { id: "evolution", title: "Evolution", description: "Watch strategies evolve over generations" },
  { id: "noise", title: "Noise", description: "Add mistakes and miscommunication" },
  { id: "sandbox", title: "Sandbox", description: "Experiment with custom parameters" },
  { id: "conclusion", title: "Conclusion", description: "Reflect on lessons learned" }
]

export default function TrustEvolutionPage() {
  const [currentStage, setCurrentStage] = useState<GameStage>("tutorial")
  const [completedStages, setCompletedStages] = useState<Set<GameStage>>(new Set())

  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage)
  const progress = ((currentStageIndex + 1) / stages.length) * 100

  const handleStageComplete = (stage: GameStage) => {
    setCompletedStages(prev => new Set([...prev, stage]))
    
    // Auto-advance to next stage if not at the end
    const nextIndex = currentStageIndex + 1
    if (nextIndex < stages.length) {
      setCurrentStage(stages[nextIndex].id)
    }
  }

  const handleStageSelect = (stage: GameStage) => {
    setCurrentStage(stage)
  }

  const renderCurrentStage = () => {
    switch (currentStage) {
      case "tutorial":
        return <Tutorial onComplete={() => handleStageComplete("tutorial")} />
      case "oneoff":
        return <OneOffGame onComplete={() => handleStageComplete("oneoff")} />
      case "iterated":
        return <IteratedGame onComplete={() => handleStageComplete("iterated")} />
      case "tournament":
        return <Tournament onComplete={() => handleStageComplete("tournament")} />
      case "evolution":
        return <Evolution onComplete={() => handleStageComplete("evolution")} />
      case "noise":
        return <Noise onComplete={() => handleStageComplete("noise")} />
      case "sandbox":
        return <Sandbox onComplete={() => handleStageComplete("sandbox")} />
      case "conclusion":
        return <Conclusion onComplete={() => handleStageComplete("conclusion")} />
      default:
        return <Tutorial onComplete={() => handleStageComplete("tutorial")} />
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                The Evolution of Trust
              </CardTitle>
              <p className="text-center text-muted-foreground">
                An interactive guide to game theory, cooperation, and trust
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Stage Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stages.map((stage) => (
                  <Button
                    key={stage.id}
                    variant={currentStage === stage.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStageSelect(stage.id)}
                    className={`relative ${
                      completedStages.has(stage.id) ? "border-green-500" : ""
                    }`}
                  >
                    {completedStages.has(stage.id) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                    {stage.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Stage Content */}
          <div className="min-h-[600px]">
            {renderCurrentStage()}
          </div>

          {/* Stage Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold">{stages[currentStageIndex].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {stages[currentStageIndex].description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}