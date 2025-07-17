"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { TrendingUp, Award, Users, BarChart3, History, Info } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { cn } from "@/lib/utils"
import { createStaggeredDelays } from "@/lib/animation-utils"

export interface GameStat {
  label: string
  value: number
  previousValue?: number
  format?: "number" | "decimal" | "percentage" | "currency"
  icon?: React.ElementType
  tooltip?: string
  color?: string
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export interface GameHistoryItem {
  label: string
  value: number | string
  secondaryValue?: number | string
  highlight?: boolean
}

export interface GameStatsProps {
  title?: string
  stats: GameStat[]
  history?: GameHistoryItem[]
  maxValue?: number
  layout?: "grid" | "horizontal" | "compact" | "detailed"
  showTrend?: boolean
  className?: string
  cardClassName?: string
}

export function GameStatsPanel({
  title = "Statistics",
  stats,
  history,
  maxValue,
  layout = "grid",
  showTrend = true,
  className,
  cardClassName
}: GameStatsProps) {
  const staggerDelays = createStaggeredDelays(stats.length, 100, 50)
  
  // Calculate layout-specific classes
  const getLayoutClasses = () => {
    switch (layout) {
      case "horizontal":
        return {
          container: "flex flex-row flex-wrap justify-center gap-4",
          stat: "flex-1 min-w-[120px]",
          value: "text-2xl",
          icon: "w-5 h-5"
        }
      case "compact":
        return {
          container: "grid grid-cols-2 gap-2",
          stat: "",
          value: "text-xl",
          icon: "w-4 h-4"
        }
      case "detailed":
        return {
          container: "flex flex-col gap-4",
          stat: "w-full",
          value: "text-3xl",
          icon: "w-6 h-6"
        }
      default: // grid
        return {
          container: "grid grid-cols-2 md:grid-cols-4 gap-4",
          stat: "",
          value: "text-2xl",
          icon: "w-5 h-5"
        }
    }
  }
  
  const layoutClasses = getLayoutClasses()
  
  // Get icon component for a stat
  const getStatIcon = (stat: GameStat) => {
    if (stat.icon) {
      const Icon = stat.icon
      return <Icon className={cn(layoutClasses.icon, `text-${stat.color || "blue"}-500`)} />
    }
    
    // Default icons based on stat label
    if (stat.label.toLowerCase().includes("score")) {
      return <Award className={cn(layoutClasses.icon, "text-amber-500")} />
    }
    if (stat.label.toLowerCase().includes("cooperation")) {
      return <Users className={cn(layoutClasses.icon, "text-green-500")} />
    }
    if (stat.label.toLowerCase().includes("game")) {
      return <History className={cn(layoutClasses.icon, "text-purple-500")} />
    }
    
    return <BarChart3 className={cn(layoutClasses.icon, "text-blue-500")} />
  }
  
  // Calculate trend indicator for a stat
  const getTrendIndicator = (stat: GameStat) => {
    if (!showTrend || stat.previousValue === undefined) return null
    
    const diff = stat.value - stat.previousValue
    const isPositive = diff > 0
    const isNeutral = diff === 0
    
    return (
      <div className={cn(
        "text-xs flex items-center",
        isPositive ? "text-green-500" : isNeutral ? "text-gray-400" : "text-red-500"
      )}>
        {isPositive ? "+" : ""}{diff.toFixed(stat.decimalPlaces || 0)}
        <TrendingUp className={cn(
          "w-3 h-3 ml-1",
          isPositive ? "rotate-0" : isNeutral ? "rotate-90" : "rotate-180"
        )} />
      </div>
    )
  }
  
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Stats Grid */}
        <div className={cn("mb-4", layoutClasses.container)}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={cn("relative", layoutClasses.stat)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: staggerDelays[index] / 1000 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {getStatIcon(stat)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                  
                  {stat.tooltip && (
                    <Tooltip content={stat.tooltip}>
                      <Info className="w-3.5 h-3.5 text-gray-400" />
                    </Tooltip>
                  )}
                </div>
                
                {getTrendIndicator(stat)}
              </div>
              
              <div className={cn("font-bold", layoutClasses.value)}>
                <AnimatedCounter
                  value={stat.value}
                  format={stat.format || "number"}
                  decimalPlaces={stat.decimalPlaces || 0}
                  prefix={stat.prefix || ""}
                  suffix={stat.suffix || ""}
                  duration={0.8}
                  delay={staggerDelays[index] / 1000}
                />
              </div>
              
              {maxValue !== undefined && layout === "detailed" && (
                <div className="mt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stat.value / maxValue) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(stat.value / maxValue) * 100} 
                    className="h-1.5" 
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* History List */}
        {history && history.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Recent History</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "flex justify-between text-sm py-0.5 px-1 rounded",
                    item.highlight ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.secondaryValue !== undefined && (
                      <span className="text-gray-500 dark:text-gray-400">{item.secondaryValue}</span>
                    )}
                    <span className="font-medium">{item.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 