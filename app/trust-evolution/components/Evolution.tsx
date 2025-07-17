"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { EvolutionEngine, ALL_STRATEGIES } from "../engine"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { Strategy, EvolutionGeneration, EvolutionConfig } from "../types"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

interface EvolutionProps {
  onComplete: () => void
}

export function Evolution({ onComplete }: EvolutionProps) {
  // Default evolution configuration
  const defaultConfig: EvolutionConfig = {
    populationSize: 100,
    mutationRate: 0.01,
    selectionPressure: 1.5,
    roundsPerGeneration: 10,
    maxGenerations: 20
  }

  // State
  const [config, setConfig] = useState<EvolutionConfig>(defaultConfig)
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(
    ALL_STRATEGIES.slice(0, 6) // Start with 6 strategies
  )
  const [generations, setGenerations] = useState<EvolutionGeneration[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [showExplanation, setShowExplanation] = useState(true)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(500) // ms per generation

  // References
  const evolutionEngineRef = useRef<EvolutionEngine | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize evolution engine
  useEffect(() => {
    evolutionEngineRef.current = new EvolutionEngine(
      selectedStrategies,
      config,
      DEFAULT_PAYOFF_MATRIX
    )
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedStrategies, config])

  // Run evolution simulation
  const runEvolution = () => {
    if (!evolutionEngineRef.current) return
    
    setIsRunning(true)
    setIsPaused(false)
    setShowExplanation(false)
    
    const results = evolutionEngineRef.current.runEvolution()
    setGenerations(results)
    
    // Start at generation 0
    setCurrentGeneration(0)
    startAnimation()
  }

  // Animation control
  const startAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    let lastTime = 0
    const animate = (time: number) => {
      if (!isPaused && time - lastTime > autoPlaySpeed) {
        lastTime = time
        setCurrentGeneration(prev => {
          if (prev < generations.length - 1) {
            return prev + 1
          } else {
            return prev
          }
        })
      }
      
      if (currentGeneration < generations.length - 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  // Pause/resume animation
  const togglePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      startAnimation()
    }
  }

  // Reset simulation
  const resetSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsRunning(false)
    setIsPaused(false)
    setGenerations([])
    setCurrentGeneration(0)
    setShowExplanation(true)
  }

  // Format population data for charts
  const formatPopulationData = (generations: EvolutionGeneration[]) => {
    return generations.map(gen => {
      const data: any = { generation: gen.generation }
      
      // Add population for each strategy
      Object.entries(gen.population).forEach(([strategyId, count]) => {
        const strategy = selectedStrategies.find(s => s.id === strategyId)
        if (strategy) {
          data[strategy.name] = count
        }
      })
      
      return data
    })
  }

  // Current generation data
  const currentGen = generations[currentGeneration]
  
  // Get dominant strategy
  const getDominantStrategy = () => {
    if (!currentGen) return null
    
    let maxCount = 0
    let dominantId = ""
    
    Object.entries(currentGen.population).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantId = id
      }
    })
    
    return selectedStrategies.find(s => s.id === dominantId) || null
  }
  
  const dominantStrategy = getDominantStrategy()

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Evolution: Survival of the Fittest</CardTitle>
        <p className="text-muted-foreground">
          Watch how strategies evolve over generations through natural selection
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {showExplanation && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How Evolution Works</h3>
                <p>
                  In this simulation, strategies compete in a population where:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Strategies that score higher have more "offspring" in the next generation</li>
                  <li>Strategies that score poorly may go extinct</li>
                  <li>Occasional mutations introduce variety</li>
                  <li>Over time, the most successful strategies will dominate the population</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  This models how behaviors might evolve in real populations through natural selection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isRunning ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Evolution Settings</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Population Size: {config.populationSize}</span>
                </div>
                <Slider 
                  value={[config.populationSize]} 
                  min={20} 
                  max={200} 
                  step={10}
                  onValueChange={(value) => setConfig({...config, populationSize: value[0]})}
                  className="my-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Mutation Rate: {config.mutationRate}</span>
                </div>
                <Slider 
                  value={[config.mutationRate * 100]} 
                  min={0} 
                  max={5} 
                  step={0.1}
                  onValueChange={(value) => setConfig({...config, mutationRate: value[0] / 100})}
                  className="my-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Selection Pressure: {config.selectionPressure}</span>
                </div>
                <Slider 
                  value={[config.selectionPressure * 10]} 
                  min={10} 
                  max={30} 
                  step={1}
                  onValueChange={(value) => setConfig({...config, selectionPressure: value[0] / 10})}
                  className="my-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Generations: {config.maxGenerations}</span>
                </div>
                <Slider 
                  value={[config.maxGenerations]} 
                  min={10} 
                  max={50} 
                  step={5}
                  onValueChange={(value) => setConfig({...config, maxGenerations: value[0]})}
                  className="my-2"
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button onClick={runEvolution} size="lg">
                Start Evolution
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Generation {currentGen?.generation} of {generations.length - 1}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cooperation Rate: {currentGen ? Math.round(currentGen.cooperationRate * 100) : 0}%
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentGeneration(Math.max(0, currentGeneration - 1))}
                  disabled={currentGeneration === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant={isPaused ? "default" : "outline"} 
                  size="sm"
                  onClick={togglePause}
                >
                  {isPaused ? "Play" : "Pause"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentGeneration(Math.min(generations.length - 1, currentGeneration + 1))}
                  disabled={currentGeneration === generations.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
            
            {/* Population Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formatPopulationData(generations.slice(0, currentGeneration + 1))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="generation" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedStrategies.map((strategy) => (
                    <Area
                      key={strategy.id}
                      type="monotone"
                      dataKey={strategy.name}
                      stackId="1"
                      stroke={strategy.color}
                      fill={strategy.color}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Dominant Strategy */}
            {dominantStrategy && (
              <Card className="border-2" style={{ borderColor: dominantStrategy.color }}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Dominant Strategy</h3>
                    <div className="text-3xl font-bold" style={{ color: dominantStrategy.color }}>
                      {dominantStrategy.name}
                    </div>
                    <p className="text-muted-foreground">{dominantStrategy.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Population</div>
                        <div className="text-2xl font-bold">
                          {currentGen?.population[dominantStrategy.id] || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Percentage</div>
                        <div className="text-2xl font-bold">
                          {Math.round((currentGen?.population[dominantStrategy.id] || 0) / config.populationSize * 100)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Nice</div>
                        <div className="text-2xl font-bold">
                          {dominantStrategy.isNice ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Forgiving</div>
                        <div className="text-2xl font-bold">
                          {dominantStrategy.isForgiving ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Mathematical insight based on MathsTrustEvolution.txt */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Evolutionary Game Theory Insight</h3>
                  <p className="text-sm">
                    This simulation demonstrates the replicator dynamics equation where strategy frequencies change based on fitness:
                  </p>
                  <div className="bg-background p-3 rounded text-center my-2">
                    <code>ẋᵢ = xᵢ(fᵢ(x) - f̄(x))</code>
                  </div>
                  <p className="text-sm">
                    Strategies that perform better than average (fᵢ &gt; f̄) increase in frequency, while those performing worse decrease.
                    {currentGen?.cooperationRate > 0.5 ? 
                      " The high cooperation rate suggests reciprocal strategies are creating stable cooperation." : 
                      " The low cooperation rate suggests defection-based strategies are currently dominant."}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={resetSimulation}>
                Reset Simulation
              </Button>
              <Button onClick={onComplete}>Continue to Noise</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 