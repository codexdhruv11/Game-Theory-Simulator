"use client"

import React, { useState, useEffect } from "react"
import { CourseLayout } from "@/components/layout/course-layout"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { StageStepper } from "@/components/ui/stage-stepper"
import { BookOpen, Target, Users, Zap, Settings, BarChart3, Lightbulb, GraduationCap, Trophy } from "lucide-react"

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

  return (
    <AnimatedBackground variant="default" intensity="medium" interactive={true}>
      <CourseLayout
        title="The Prisoner's Dilemma"
        description="A comprehensive journey through game theory's most famous paradox"
        stages={STAGES}
        currentStage={currentStage}
        completedStages={completedStages}
        userProgress={userProgress}
        onStageComplete={handleStageComplete}
        onStageChange={handleStageChange}
      />
    </AnimatedBackground>
  )
}