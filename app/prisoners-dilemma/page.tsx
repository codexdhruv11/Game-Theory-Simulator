"use client"

import React, { useState, useEffect } from "react"
import { BookOpen, Target, Users, Zap, Settings, BarChart3, Lightbulb, GraduationCap, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

// Import stage components
import { BasicConcepts } from "./stages/BasicConcepts"
import { OneOffGame } from "./stages/OneOffGame"
import { IteratedGame } from "./stages/IteratedGame"
import { StrategyLearning } from "./stages/StrategyLearning"
import { Tournament } from "./stages/Tournament"
import { NoiseAndErrors } from "./stages/NoiseAndErrors"
import { Evolution } from "./stages/Evolution"
import { CustomScenarios } from "./stages/CustomScenarios"
import { Conclusion } from "./stages/Conclusion"

// Stage configuration
const STAGES = [
  {
    id: "basic-concepts",
    title: "Basic Concepts",
    description: "Learn the fundamentals of the Prisoner's Dilemma",
    icon: BookOpen,
    component: BasicConcepts,
  },
  {
    id: "one-off-game",
    title: "One-Off Game",
    description: "Play single rounds and understand Nash equilibrium",
    icon: Target,
    component: OneOffGame,
  },
  {
    id: "iterated-game",
    title: "Iterated Game",
    description: "Discover how repetition changes everything",
    icon: Users,
    component: IteratedGame,
  },
  {
    id: "strategy-learning",
    title: "Strategy Learning",
    description: "Master different strategies and their properties",
    icon: Lightbulb,
    component: StrategyLearning,
  },
  {
    id: "tournament",
    title: "Tournament",
    description: "Run tournaments between different strategies",
    icon: Trophy,
    component: Tournament,
  },
  {
    id: "noise-and-errors",
    title: "Noise & Errors",
    description: "See how mistakes affect cooperation",
    icon: Zap,
    component: NoiseAndErrors,
  },
  {
    id: "evolution",
    title: "Evolution",
    description: "Watch strategies evolve in populations",
    icon: BarChart3,
    component: Evolution,
  },
  {
    id: "custom-scenarios",
    title: "Custom Scenarios",
    description: "Create your own game variations",
    icon: Settings,
    component: CustomScenarios,
  },
  {
    id: "conclusion",
    title: "Conclusion",
    description: "Reflect on what you've learned",
    icon: GraduationCap,
    component: Conclusion,
  }
]

export default function PrisonersDilemmaPage() {
  const [currentStage, setCurrentStage] = useState(0)
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())
  const [userProgress, setUserProgress] = useState({
    totalGames: 0,
    totalScore: 0,
    cooperationRate: 0,
    achievements: [] as string[]
  })

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("pd-progress")
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setCurrentStage(progress.currentStage || 0)
      setCompletedStages(new Set(progress.completedStages || []))
      setUserProgress(progress.userProgress || userProgress)
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    const progress = {
      currentStage,
      completedStages: Array.from(completedStages),
      userProgress
    }
    localStorage.setItem("pd-progress", JSON.stringify(progress))
  }, [currentStage, completedStages, userProgress])

  const handleStageComplete = (stageIndex: number, data?: any) => {
    setCompletedStages(prev => {
      const newSet = new Set(prev)
      newSet.add(stageIndex)
      return newSet
    })
    
    // Update user progress if data provided
    if (data) {
      setUserProgress(prev => ({
        totalGames: prev.totalGames + (data.gamesPlayed || 0),
        totalScore: prev.totalScore + (data.scoreEarned || 0),
        cooperationRate: data.cooperationRate !== undefined ? 
          (prev.cooperationRate + data.cooperationRate) / 2 : prev.cooperationRate,
        achievements: [...prev.achievements, ...(data.achievements || [])]
      }))
    }
  }

  const handleStageChange = (stageIndex: number) => {
    setCurrentStage(stageIndex)
  }

  const progress = ((completedStages.size) / STAGES.length) * 100
  const CurrentStageComponent = STAGES[currentStage].component

  return (
    <AuthenticatedLayout requireAuth={false}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                The Prisoner&apos;s Dilemma
              </CardTitle>
              <p className="text-center text-muted-foreground">
                A comprehensive journey through game theory&apos;s most famous paradox
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{completedStages.size}/{STAGES.length} stages</span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STAGES.map((stage, index) => {
                  const Icon = stage.icon
                  const isCompleted = completedStages.has(index)
                  const isCurrent = index === currentStage
                  const isAccessible = index === 0 || completedStages.has(index - 1)
                  
                  return (
                    <Button
                      key={stage.id}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => isAccessible && handleStageChange(index)}
                      disabled={!isAccessible}
                      className={`relative ${isCompleted ? "border-green-500" : ""}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {isCompleted && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                      {stage.title}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Stage Content */}
          <div className="min-h-[600px]">
            <CurrentStageComponent 
              onComplete={(data) => handleStageComplete(currentStage, data)} 
              isCompleted={completedStages.has(currentStage)}
              userProgress={userProgress}
            />
          </div>

          {/* Stage Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold">{STAGES[currentStage].title}</h3>
                <p className="text-sm text-muted-foreground">
                  {STAGES[currentStage].description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}