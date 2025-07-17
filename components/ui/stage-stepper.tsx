"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createStaggeredDelays } from "@/lib/animation-utils"

export interface StageInfo {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
}

export interface StageStepperProps {
  stages: StageInfo[]
  currentStage: number
  completedStages: Set<number>
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  onStageSelect: (stageIndex: number) => void
  className?: string
}

export function StageStepper({
  stages,
  currentStage,
  completedStages,
  orientation = "horizontal",
  size = "md",
  onStageSelect,
  className
}: StageStepperProps) {
  const isVertical = orientation === "vertical"
  const staggerDelays = createStaggeredDelays(stages.length, 50, 100)
  
  // Size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "gap-2",
          stage: "h-8 w-8",
          icon: "w-3 h-3",
          line: isVertical ? "w-0.5 h-4" : "h-0.5 w-4",
          completionDot: "w-2 h-2",
          title: "text-xs",
          pill: "text-xs py-0.5 px-1.5"
        }
      case "lg":
        return {
          container: "gap-4",
          stage: "h-14 w-14",
          icon: "w-6 h-6",
          line: isVertical ? "w-1 h-8" : "h-1 w-8",
          completionDot: "w-3.5 h-3.5",
          title: "text-base",
          pill: "text-sm py-1 px-3"
        }
      default: // md
        return {
          container: "gap-3",
          stage: "h-10 w-10",
          icon: "w-5 h-5",
          line: isVertical ? "w-0.5 h-6" : "h-0.5 w-6",
          completionDot: "w-3 h-3",
          title: "text-sm",
          pill: "text-xs py-0.5 px-2"
        }
    }
  }
  
  const sizeClasses = getSizeClasses()
  
  return (
    <div 
      className={cn(
        "flex",
        isVertical ? "flex-col" : "flex-row flex-wrap justify-center",
        sizeClasses.container,
        className
      )}
    >
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isCompleted = completedStages.has(index)
        const isCurrent = index === currentStage
        const isAccessible = index === 0 || completedStages.has(index - 1)
        const isLast = index === stages.length - 1
        
        return (
          <React.Fragment key={stage.id}>
            <div className="flex items-center">
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: staggerDelays[index] / 1000 }}
              >
                {/* Stage Button */}
                <Button
                  size="icon"
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  className={cn(
                    "rounded-full relative",
                    sizeClasses.stage,
                    !isAccessible && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => isAccessible && onStageSelect(index)}
                  disabled={!isAccessible}
                >
                  <Icon className={sizeClasses.icon} />
                  
                  {/* Completion indicator */}
                  {isCompleted && (
                    <motion.div 
                      className={cn(
                        "absolute -top-1 -right-1 bg-green-500 rounded-full",
                        sizeClasses.completionDot
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    />
                  )}
                </Button>
                
                {/* Title tooltip on hover */}
                <div className={cn(
                  "absolute z-10 whitespace-nowrap bg-white dark:bg-gray-800 shadow-lg rounded px-2 py-1 transition-all duration-200",
                  "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                  isVertical ? "left-full ml-2 top-1/2 -translate-y-1/2" : "top-full mt-2 left-1/2 -translate-x-1/2"
                )}>
                  <div className={cn("font-medium", sizeClasses.title)}>{stage.title}</div>
                </div>
                
                {/* Current stage indicator */}
                {isCurrent && (
                  <motion.div
                    className={cn(
                      "absolute -inset-1 rounded-full border-2",
                      `border-${stage.color.split('-')[1]}-500`
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {/* Stage label for larger sizes */}
                {size === "lg" && (
                  <div className={cn(
                    "absolute mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap",
                    isVertical ? "relative left-0 translate-x-0 ml-12" : "top-full"
                  )}>
                    <Badge 
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                      className={sizeClasses.pill}
                    >
                      {stage.title}
                    </Badge>
                  </div>
                )}
              </motion.div>
              
              {/* Connector line */}
              {!isLast && (
                <motion.div 
                  className={cn(
                    "mx-1 my-1 flex-shrink-0",
                    isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700",
                    sizeClasses.line
                  )}
                  initial={{ scale: isVertical ? 0 : 0, opacity: 0, scaleY: isVertical ? 0 : 1, scaleX: isVertical ? 1 : 0 }}
                  animate={{ scale: 1, opacity: 1, scaleY: 1, scaleX: 1 }}
                  transition={{ duration: 0.4, delay: (staggerDelays[index] + 100) / 1000 }}
                />
              )}
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
} 