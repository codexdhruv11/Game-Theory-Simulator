"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, X, Repeat, Zap, Info, BarChart3, Award, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StrategyCharacteristic {
  name: string
  value: number // 0-100 scale
  icon?: React.ElementType
}

export interface StrategyMetric {
  label: string
  value: number
  maxValue?: number
  icon?: React.ElementType
  format?: "number" | "percentage" | "decimal"
}

export interface StrategyCardProps {
  name: string
  description?: string
  characteristics?: StrategyCharacteristic[]
  metrics?: StrategyMetric[]
  icon?: React.ElementType
  color?: string
  selected?: boolean
  interactive?: boolean
  size?: "sm" | "md" | "lg"
  onSelect?: () => void
  onInfo?: () => void
  className?: string
  badges?: string[]
  rank?: number
}

export function StrategyCard({
  name,
  description,
  characteristics = [],
  metrics = [],
  icon: StrategyIcon,
  color = "blue",
  selected = false,
  interactive = true,
  size = "md",
  onSelect,
  onInfo,
  className,
  badges = [],
  rank
}: StrategyCardProps) {
  // Get size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          card: "p-3",
          icon: "w-6 h-6",
          title: "text-base",
          description: "text-xs",
          badge: "text-xs px-1.5 py-0.5",
          characteristic: "h-1",
          metric: "text-xs"
        }
      case "lg":
        return {
          card: "p-5",
          icon: "w-10 h-10",
          title: "text-xl",
          description: "text-sm",
          badge: "text-sm",
          characteristic: "h-2",
          metric: "text-sm"
        }
      default: // md
        return {
          card: "p-4",
          icon: "w-8 h-8",
          title: "text-lg",
          description: "text-xs",
          badge: "text-xs",
          characteristic: "h-1.5",
          metric: "text-xs"
        }
    }
  }
  
  const sizeClasses = getSizeClasses()
  
  // Get characteristic icon
  const getCharacteristicIcon = (characteristic: StrategyCharacteristic) => {
    if (characteristic.icon) {
      const Icon = characteristic.icon
      return <Icon className="w-4 h-4" />
    }
    
    // Default icons based on name
    switch (characteristic.name.toLowerCase()) {
      case "nice":
      case "forgiving":
      case "cooperative":
        return <Check className="w-4 h-4 text-green-500" />
      case "retaliating":
      case "vengeful":
      case "punishing":
        return <X className="w-4 h-4 text-red-500" />
      case "adaptive":
      case "learning":
        return <Zap className="w-4 h-4 text-amber-500" />
      case "memory":
      case "remembering":
        return <Repeat className="w-4 h-4 text-purple-500" />
      default:
        return null
    }
  }
  
  // Get metric icon
  const getMetricIcon = (metric: StrategyMetric) => {
    if (metric.icon) {
      const Icon = metric.icon
      return <Icon className="w-4 h-4" />
    }
    
    // Default icons based on label
    if (metric.label.toLowerCase().includes("score")) {
      return <Award className="w-4 h-4 text-amber-500" />
    }
    if (metric.label.toLowerCase().includes("win")) {
      return <Star className="w-4 h-4 text-yellow-500" />
    }
    
    return <BarChart3 className="w-4 h-4 text-blue-500" />
  }
  
  // Format metric value
  const formatMetricValue = (metric: StrategyMetric) => {
    switch (metric.format) {
      case "percentage":
        return `${Math.round(metric.value)}%`
      case "decimal":
        return metric.value.toFixed(1)
      default:
        return Math.round(metric.value).toString()
    }
  }
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        selected && "border-2 border-primary shadow-md",
        interactive && !selected && "hover:border-primary/50 hover:shadow-sm cursor-pointer",
        className
      )}
      onClick={interactive ? onSelect : undefined}
    >
      <CardHeader className={cn("pb-2", sizeClasses.card)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {StrategyIcon && (
              <div className={cn(
                "rounded-full flex items-center justify-center",
                `bg-${color}-100 dark:bg-${color}-900/30`,
                sizeClasses.icon
              )}>
                <StrategyIcon className={cn(
                  `text-${color}-500 dark:text-${color}-400`,
                  size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
                )} />
              </div>
            )}
            
            <div>
              <CardTitle className={cn(sizeClasses.title, "flex items-center gap-2")}>
                {name}
                {rank && (
                  <Badge variant="secondary" className="ml-1">
                    #{rank}
                  </Badge>
                )}
              </CardTitle>
              
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {badges.map((badge, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className={sizeClasses.badge}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {onInfo && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation()
                onInfo()
              }}
            >
              <Info className="h-4 w-4" />
              <span className="sr-only">More information</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", sizeClasses.card)}>
        {description && (
          <p className={cn("text-gray-600 dark:text-gray-400 mb-3", sizeClasses.description)}>
            {description}
          </p>
        )}
        
        {/* Characteristics */}
        {characteristics.length > 0 && (
          <div className="space-y-2 mb-4">
            {characteristics.map((characteristic) => (
              <div key={characteristic.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getCharacteristicIcon(characteristic)}
                    <span className={cn("text-gray-700 dark:text-gray-300", sizeClasses.metric)}>
                      {characteristic.name}
                    </span>
                  </div>
                  <span className={cn("text-gray-600 dark:text-gray-400", sizeClasses.metric)}>
                    {characteristic.value}%
                  </span>
                </div>
                
                <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizeClasses.characteristic)}>
                  <motion.div
                    className={`h-full bg-${color}-500 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${characteristic.value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.map((metric) => (
              <div 
                key={metric.label}
                className="flex flex-col items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                  {getMetricIcon(metric)}
                  <span className={sizeClasses.metric}>{metric.label}</span>
                </div>
                <span className="font-bold">
                  {formatMetricValue(metric)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {onSelect && interactive && size !== "sm" && (
        <CardFooter className={cn("pt-0", sizeClasses.card)}>
          <Button 
            variant={selected ? "default" : "outline"} 
            className="w-full"
            onClick={onSelect}
            size={size === "lg" ? "default" : "sm"}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 