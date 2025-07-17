"use client"

import React, { useState, useEffect } from "react"
import { BookOpen, Target, Users, Zap, Settings, BarChart3, Lightbulb, GraduationCap, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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

  const progress = ((completedStages.size) / STAGES.length) * 100
  const CurrentStageComponent = STAGES[currentStage].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-ibm-plex-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            The Prisoner&apos;s Dilemma
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            A comprehensive journey through game theory&apos;s most famous paradox
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedStages.size}/{STAGES.length} stages</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-1 py-2">
                  {STAGES.map((stage, index) => {
                    const Icon = stage.icon
                    const isCompleted = completedStages.has(index)
                    const isCurrent = index === currentStage
                    const isAccessible = index === 0 || completedStages.has(index - 1)
                    
                    return (
                      <Button
                        key={stage.id}
                        variant={isCurrent ? "default" : isCompleted ? "secondary" : "ghost"}
                        className="w-full justify-start mb-2"
                        onClick={() => isAccessible && handleStageChange(index)}
                        disabled={!isAccessible}
                      >
                        <div className="flex items-center w-full">
                          <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center mr-3`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-grow text-left">
                            <div className="font-medium">{stage.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {stage.description}
                            </div>
                          </div>
                          {isCompleted && (
                            <div className="ml-2 w-3 h-3 bg-green-500 rounded-full" />
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Content Area */}
          <Card className="lg:col-span-9 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{STAGES[currentStage].title}</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => currentStage > 0 && handleStageChange(currentStage - 1)}
                    disabled={currentStage === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => currentStage < STAGES.length - 1 && handleStageChange(currentStage + 1)}
                    disabled={currentStage === STAGES.length - 1 || !completedStages.has(currentStage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
              
              <Separator className="mb-6" />
              
              <div className="min-h-[60vh]">
                <CurrentStageComponent 
                  onComplete={(data) => handleStageComplete(currentStage, data)} 
                  isCompleted={completedStages.has(currentStage)}
                  userProgress={userProgress}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* User Stats */}
        <Card className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-100 dark:border-blue-900/30 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Games Played</div>
                <div className="text-2xl font-bold">{userProgress.totalGames}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Score</div>
                <div className="text-2xl font-bold">{userProgress.totalScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Cooperation Rate</div>
                <div className="text-2xl font-bold">{Math.round(userProgress.cooperationRate * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Achievements</div>
                <div className="text-2xl font-bold">{userProgress.achievements.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}