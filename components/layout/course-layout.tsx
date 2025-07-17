"use client"

import React, { ReactNode, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronUp, Menu, X } from "lucide-react"
import { useEntranceAnimation, createBounceAnimation } from "@/lib/animation-utils"
import { cn } from "@/lib/utils"

export interface Stage {
  id: string
  title: string
  description: string
  icon: React.ElementType
  component: React.ComponentType<any>
  color: string
}

export interface CourseLayoutProps {
  title: string
  description: string
  stages: Stage[]
  currentStage: number
  completedStages: Set<number>
  userProgress: {
    totalGames: number
    totalScore: number
    cooperationRate: number
    achievements: string[]
    [key: string]: any
  }
  onStageComplete: (stageIndex: number, data?: any) => void
  onStageChange: (stageIndex: number) => void
  children?: ReactNode
}

export function CourseLayout({
  title,
  description,
  stages,
  currentStage,
  completedStages,
  userProgress,
  onStageComplete,
  onStageChange,
  children
}: CourseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerRef, headerVisible] = useEntranceAnimation()
  const [statsRef, statsVisible] = useEntranceAnimation({ threshold: 0.2 })
  const [contentRef, contentVisible] = useEntranceAnimation({ threshold: 0.1 })
  
  const progress = ((completedStages.size) / stages.length) * 100
  const CurrentStageComponent = stages[currentStage].component
  
  // Close sidebar on mobile when stage changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [currentStage])

  const nextStage = () => {
    if (currentStage < stages.length - 1) {
      onStageChange(currentStage + 1)
    }
  }

  const prevStage = () => {
    if (currentStage > 0) {
      onStageChange(currentStage - 1)
    }
  }

  const goToStage = (index: number) => {
    onStageChange(index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-400/5 dark:bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-purple-400/5 dark:bg-purple-400/10 blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-80 h-80 rounded-full bg-green-400/5 dark:bg-green-400/10 blur-3xl" />
      </div>

      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar navigation for stages - mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <h2 className="font-bold text-xl">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course Navigation</p>
              </div>
              <div className="space-y-1">
                {stages.map((stage, index) => {
                  const Icon = stage.icon
                  const isCompleted = completedStages.has(index)
                  const isCurrent = index === currentStage
                  const isAccessible = index === 0 || completedStages.has(index - 1)

                  return (
                    <Button
                      key={stage.id}
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        !isAccessible && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => isAccessible && goToStage(index)}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 lg:pl-16 xl:pl-20">
        {/* Desktop sidebar - fixed position */}
        <div className="fixed left-0 top-0 bottom-0 w-12 xl:w-16 hidden lg:flex flex-col items-center pt-8 pb-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center space-y-6">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              const isCompleted = completedStages.has(index)
              const isCurrent = index === currentStage
              const isAccessible = index === 0 || completedStages.has(index - 1)

              return (
                <div key={stage.id} className="relative group">
                  <Button
                    size="icon"
                    variant={isCurrent ? "default" : isCompleted ? "secondary" : "ghost"}
                    className={cn(
                      "w-10 h-10 rounded-full relative",
                      !isAccessible && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => isAccessible && goToStage(index)}
                    disabled={!isAccessible}
                  >
                    <Icon className="w-5 h-5" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                  </Button>
                  <div className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                    {stage.title}
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`h-6 w-0.5 mx-auto mt-1 mb-1 ${isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Header */}
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={headerVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            {description}
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedStages.size}/{stages.length} stages</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </motion.div>

        {/* User Stats */}
        <motion.div 
          ref={statsRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
          transition={createBounceAnimation(0.2, 1)}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-100 dark:border-blue-900/30 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Games</div>
                <div className="text-2xl font-bold">{userProgress.totalGames}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-green-100 dark:border-green-900/30 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                <ChevronUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                <div className="text-2xl font-bold">{userProgress.totalScore}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-100 dark:border-purple-900/30 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-full flex items-center justify-center">
                <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Cooperation</div>
                <div className="text-2xl font-bold">{(userProgress.cooperationRate * 100).toFixed(1)}%</div>
              </div>
            </CardContent>
          </Card>
          
          <Badge variant="outline" className="px-3 py-1.5 text-xs bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            {userProgress.achievements.length} Achievements
          </Badge>
        </motion.div>

        {/* Current Stage Info */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
                onComplete={(data: any) => onStageComplete(currentStage, data)}
                isCompleted={completedStages.has(currentStage)}
                userProgress={userProgress}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center max-w-2xl mx-auto mt-12">
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
              Stage {currentStage + 1} of {stages.length}
            </span>

            <Button
              onClick={nextStage}
              disabled={currentStage === stages.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 