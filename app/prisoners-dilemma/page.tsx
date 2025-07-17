"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Trophy, BookOpen, Target, Users, Zap, Settings, BarChart3, Lightbulb, GraduationCap } from "lucide-react"

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
    color: "bg-blue-500"
  },
  {
    id: "one-off-game",
    title: "One-Off Game",
    description: "Play single rounds and understand Nash equilibrium",
    icon: Target,
    component: OneOffGame,
    color: "bg-green-500"
  },
  {
    id: "iterated-game",
    title: "Iterated Game",
    description: "Discover how repetition changes everything",
    icon: Users,
    component: IteratedGame,
    color: "bg-purple-500"
  },
  {
    id: "strategy-learning",
    title: "Strategy Learning",
    description: "Master different strategies and their properties",
    icon: Lightbulb,
    component: StrategyLearning,
    color: "bg-yellow-500"
  },
  {
    id: "tournament",
    title: "Tournament",
    description: "Run tournaments between different strategies",
    icon: Trophy,
    component: Tournament,
    color: "bg-red-500"
  },
  {
    id: "noise-and-errors",
    title: "Noise & Errors",
    description: "See how mistakes affect cooperation",
    icon: Zap,
    component: NoiseAndErrors,
    color: "bg-orange-500"
  },
  {
    id: "evolution",
    title: "Evolution",
    description: "Watch strategies evolve in populations",
    icon: BarChart3,
    component: Evolution,
    color: "bg-indigo-500"
  },
  {
    id: "custom-scenarios",
    title: "Custom Scenarios",
    description: "Create your own game variations",
    icon: Settings,
    component: CustomScenarios,
    color: "bg-teal-500"
  },
  {
    id: "conclusion",
    title: "Conclusion",
    description: "Reflect on what you've learned",
    icon: GraduationCap,
    component: Conclusion,
    color: "bg-gray-500"
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
    setCompletedStages(prev => new Set([...prev, stageIndex]))
    
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

  const nextStage = () => {
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(currentStage + 1)
    }
  }

  const prevStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const goToStage = (index: number) => {
    setCurrentStage(index)
  }

  const CurrentStageComponent = STAGES[currentStage].component
  const progress = ((completedStages.size) / STAGES.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The Prisoner's Dilemma
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            A comprehensive journey through game theory's most famous paradox
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedStages.size}/{STAGES.length} stages</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* User Stats */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              Games: {userProgress.totalGames}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Score: {userProgress.totalScore}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Cooperation: {(userProgress.cooperationRate * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Stage Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon
              const isCompleted = completedStages.has(index)
              const isCurrent = index === currentStage
              const isAccessible = index === 0 || completedStages.has(index - 1)

              return (
                <Button
                  key={stage.id}
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  size="sm"
                  className={`relative ${!isAccessible ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => isAccessible && goToStage(index)}
                  disabled={!isAccessible}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {index + 1}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </Button>
              )
            })}
          </div>

          {/* Current Stage Info */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${STAGES[currentStage].color} text-white mb-4`}>
                {React.createElement(STAGES[currentStage].icon, { className: "w-6 h-6" })}
              </div>
              <CardTitle className="text-2xl">{STAGES[currentStage].title}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                {STAGES[currentStage].description}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Stage Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <CurrentStageComponent
              onComplete={(data) => handleStageComplete(currentStage, data)}
              isCompleted={completedStages.has(currentStage)}
              userProgress={userProgress}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStage}
            disabled={currentStage === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Stage {currentStage + 1} of {STAGES.length}
          </span>

          <Button
            onClick={nextStage}
            disabled={currentStage === STAGES.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}