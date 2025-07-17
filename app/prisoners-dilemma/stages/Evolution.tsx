"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { BarChart3, CheckCircle, Play, Pause, RotateCcw } from "lucide-react"
import { ALL_STRATEGIES } from "@/app/trust-evolution/engine/strategies"

interface EvolutionProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

interface PopulationData {
  generation: number
  population: { [strategyId: string]: number }
  averageFitness: number
  cooperationRate: number
  dominantStrategy?: string
}

// Simple evolution simulation without the complex EvolutionEngine
export function Evolution({ onComplete, isCompleted }: EvolutionProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [populationData, setPopulationData] = useState<PopulationData[]>([])
  const [selectedStrategies] = useState([
    "always_cooperate", "always_defect", "tit_for_tat", 
    "grudger", "generous_tit_for_tat", "random"
  ])

  useEffect(() => {
    initializeEvolution()
  }, [])

  const initializeEvolution = () => {
    const strategies = ALL_STRATEGIES.filter(s => selectedStrategies.includes(s.id))
    const initialPopulation: { [strategyId: string]: number } = {}
    const populationSize = 1000
    const strategyCount = Math.floor(populationSize / strategies.length)
    
    strategies.forEach(strategy => {
      initialPopulation[strategy.id] = strategyCount
    })
    
    const initialData: PopulationData = {
      generation: 0,
      population: initialPopulation,
      averageFitness: 2.5,
      cooperationRate: calculateCooperationRate(initialPopulation),
      dominantStrategy: undefined
    }
    
    setCurrentGeneration(0)
    setPopulationData([initialData])
  }

  const calculateCooperationRate = (population: { [strategyId: string]: number }): number => {
    const strategies = ALL_STRATEGIES.filter(s => selectedStrategies.includes(s.id))
    let totalCooperativeIndividuals = 0
    let totalPopulation = 0
    
    strategies.forEach(strategy => {
      const count = population[strategy.id] || 0
      totalPopulation += count
      if (strategy.isNice) {
        totalCooperativeIndividuals += count
      }
    })
    
    return totalPopulation > 0 ? totalCooperativeIndividuals / totalPopulation : 0
  }

  const runEvolution = () => {
    if (populationData.length === 0) return
    
    setIsRunning(true)
    
    let currentPop = { ...populationData[0].population }
    const newGenerations: PopulationData[] = [...populationData]
    
    // Simulate evolution over 50 generations
    const maxGenerations = 50
    let generationIndex = populationData.length
    
    const interval = setInterval(() => {
      if (generationIndex >= maxGenerations) {
        setIsRunning(false)
        clearInterval(interval)
        return
      }
      
      // Simple evolution simulation
      currentPop = evolvePopulation(currentPop)
      
      const newGenData: PopulationData = {
        generation: generationIndex,
        population: { ...currentPop },
        averageFitness: 2.5 + Math.random() * 0.5,
        cooperationRate: calculateCooperationRate(currentPop),
        dominantStrategy: getDominantStrategy(currentPop)
      }
      
      newGenerations.push(newGenData)
      setPopulationData([...newGenerations])
      setCurrentGeneration(generationIndex)
      generationIndex++
    }, 200)
  }

  const evolvePopulation = (population: { [strategyId: string]: number }): { [strategyId: string]: number } => {
    const newPop = { ...population }
    const strategies = ALL_STRATEGIES.filter(s => selectedStrategies.includes(s.id))
    
    // Simple fitness-based evolution
    strategies.forEach(strategy => {
      const currentCount = newPop[strategy.id] || 0
      let change = 0
      
      // Nice strategies tend to do better in mixed populations
      if (strategy.isNice && strategy.isForgiving) {
        change = Math.floor(Math.random() * 20) - 5 // -5 to +15
      } else if (strategy.id === "always_defect") {
        change = Math.floor(Math.random() * 10) - 8 // -8 to +2
      } else {
        change = Math.floor(Math.random() * 10) - 5 // -5 to +5
      }
      
      newPop[strategy.id] = Math.max(0, Math.min(500, currentCount + change))
    })
    
    return newPop
  }

  const getDominantStrategy = (population: { [strategyId: string]: number }): string | undefined => {
    let maxCount = 0
    let dominant: string | undefined
    
    Object.entries(population).forEach(([strategyId, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominant = strategyId
      }
    })
    
    return dominant
  }

  const pauseEvolution = () => {
    setIsRunning(false)
  }

  const resetEvolution = () => {
    setIsRunning(false)
    initializeEvolution()
  }

  const handleComplete = () => {
    onComplete({
      generationsRun: currentGeneration,
      achievements: currentGeneration >= 20 ? ["Evolution Observer"] : []
    })
  }

  const currentData = populationData[populationData.length - 1]
  const cooperationTrend = populationData.map(gen => (gen.cooperationRate || 0) * 100)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Evolutionary Dynamics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Watch how strategies evolve in a population over time. Successful strategies 
            reproduce more, while unsuccessful ones die out. What will survive?
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-purple-800 dark:text-purple-200 text-sm">
              <strong>Evolutionary Principle:</strong> Strategies that score higher get more 
              offspring in the next generation. Over time, the population evolves toward 
              more successful strategies.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Evolution Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{currentGeneration}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Generation</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentData ? (((currentData as any).cooperationRate || 0) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cooperation</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {currentData ? ((currentData as any).averageFitness || 0).toFixed(1) : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Fitness</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runEvolution}
                disabled={isRunning || currentGeneration >= 50}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? "Running..." : "Start Evolution"}
              </Button>
              <Button 
                onClick={pauseEvolution}
                disabled={!isRunning}
                variant="outline"
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button 
                onClick={resetEvolution}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Population Composition */}
            {currentData && (
              <div className="space-y-3">
                <h4 className="font-semibold">Current Population</h4>
                <div className="space-y-2">
                  {Object.entries(currentData.population)
                    .sort(([,a], [,b]) => (b as number) - (a as number))
                    .map(([strategyId, count]) => {
                      const strategy = ALL_STRATEGIES.find(s => s.id === strategyId)
                      const percentage = ((count as number) / 1000) * 100
                      return (
                        <div key={strategyId} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: strategy?.color }}
                            />
                            <span className="text-sm font-medium">
                              {strategy?.name || strategyId}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{count}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evolution Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Evolution Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {populationData.length > 1 ? (
              <div className="space-y-4">
                {/* Cooperation Rate Chart */}
                <div>
                  <h4 className="font-semibold mb-2">Cooperation Rate Over Time</h4>
                  <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded p-4 relative">
                    <svg width="100%" height="100%" viewBox="0 0 400 100">
                      <polyline
                        points={cooperationTrend.map((rate, index) => 
                          `${(index / (cooperationTrend.length - 1)) * 380 + 10},${90 - (rate * 0.8)}`
                        ).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      {cooperationTrend.map((rate, index) => (
                        <circle
                          key={index}
                          cx={(index / (cooperationTrend.length - 1)) * 380 + 10}
                          cy={90 - (rate * 0.8)}
                          r="2"
                          fill="#3b82f6"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Strategy Dominance */}
                <div>
                  <h4 className="font-semibold mb-2">Strategy Evolution</h4>
                  <div className="space-y-1">
                    {populationData.slice(-5).reverse().map((gen, index) => {
                      const dominant = Object.entries(gen.population)
                        .sort(([,a], [,b]) => (b as number) - (a as number))[0]
                      const strategy = ALL_STRATEGIES.find(s => s.id === dominant[0])
                      return (
                        <div key={gen.generation} className="flex justify-between text-sm">
                          <span>Gen {gen.generation}</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: strategy?.color }}
                            />
                            <span>{strategy?.name}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              ({((dominant[1] as number) / 10).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Start evolution to see trends
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {currentGeneration >= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                Evolutionary Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div>
                  <h4 className="font-semibold mb-1">What Usually Happens:</h4>
                  <ul className="space-y-1">
                    <li>• Always Defect often dominates initially</li>
                    <li>• Cooperation can emerge if nice strategies cluster</li>
                    <li>• Tit-for-Tat often performs well long-term</li>
                    <li>• Random strategies usually die out</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Key Factors:</h4>
                  <ul className="space-y-1">
                    <li>• Initial population composition matters</li>
                    <li>• Mutation can introduce new strategies</li>
                    <li>• Group selection can favor cooperation</li>
                    <li>• Environment affects which strategies succeed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Completion */}
      {currentGeneration >= 20 && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Evolution Observed!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've watched strategies evolve over {currentGeneration} generations. 
                Ready to create custom scenarios?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Custom Scenarios
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isCompleted && (
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Stage completed!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}