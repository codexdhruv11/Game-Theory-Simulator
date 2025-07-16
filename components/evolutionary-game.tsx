"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Population {
  cooperators: number
  defectors: number
}

export function EvolutionaryGame() {
  const [population, setPopulation] = useState<Population>({ cooperators: 50, defectors: 50 })
  const [generation, setGeneration] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [history, setHistory] = useState<Population[]>([])

  const payoffMatrix = useMemo(() => ({
    cooperator: { cooperator: 3, defector: 0 },
    defector: { cooperator: 5, defector: 1 }
  }), [])

  const evolvePopulation = useCallback(() => {
    const total = population.cooperators + population.defectors
    
    // Calculate average fitness for each strategy
    const cooperatorFitness = 
      (population.cooperators * payoffMatrix.cooperator.cooperator + 
       population.defectors * payoffMatrix.cooperator.defector) / total

    const defectorFitness = 
      (population.cooperators * payoffMatrix.defector.cooperator + 
       population.defectors * payoffMatrix.defector.defector) / total

    const totalFitness = cooperatorFitness + defectorFitness

    // Calculate new proportions based on fitness
    const newCooperatorProp = cooperatorFitness / totalFitness
    const newDefectorProp = defectorFitness / totalFitness

    const newPopulation = {
      cooperators: Math.round(newCooperatorProp * total),
      defectors: Math.round(newDefectorProp * total)
    }

    setPopulation(newPopulation)
    setHistory(prev => [...prev, newPopulation])
    setGeneration(prev => prev + 1)
  }, [population, payoffMatrix])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(evolvePopulation, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, evolvePopulation])

  const resetSimulation = () => {
    setPopulation({ cooperators: 50, defectors: 50 })
    setGeneration(0)
    setHistory([])
    setIsRunning(false)
  }

  const cooperatorPercentage = Math.round((population.cooperators / (population.cooperators + population.defectors)) * 100)

  return (
    <div className="space-y-4">
      {/* Current Population */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Generation {generation}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{population.cooperators}</div>
                <div className="text-xs">Cooperators</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{population.defectors}</div>
                <div className="text-xs">Defectors</div>
              </div>
            </div>
            
            {/* Visual representation */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${cooperatorPercentage}%` }}
              ></div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {cooperatorPercentage}% Cooperators, {100 - cooperatorPercentage}% Defectors
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payoff Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Payoff Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div></div>
            <div className="text-center font-semibold">Cooperator</div>
            <div className="text-center font-semibold">Defector</div>
            <div className="font-semibold">Cooperator</div>
            <div className="text-center bg-blue-100 dark:bg-blue-900 p-2 rounded">3</div>
            <div className="text-center bg-red-100 dark:bg-red-900 p-2 rounded">0</div>
            <div className="font-semibold">Defector</div>
            <div className="text-center bg-red-100 dark:bg-red-900 p-2 rounded">5</div>
            <div className="text-center bg-yellow-100 dark:bg-yellow-900 p-2 rounded">1</div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          size="sm"
          onClick={() => setIsRunning(!isRunning)}
          variant={isRunning ? "destructive" : "default"}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
        <Button size="sm" onClick={evolvePopulation} disabled={isRunning}>
          Step
        </Button>
        <Button size="sm" variant="outline" onClick={resetSimulation}>
          Reset
        </Button>
      </div>

      {/* Evolution History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Evolution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {history.slice(-10).map((pop, index) => {
                const gen = history.length - 10 + index + 1
                const coopPct = Math.round((pop.cooperators / (pop.cooperators + pop.defectors)) * 100)
                return (
                  <div key={index} className="flex justify-between text-xs">
                    <span>Gen {gen}</span>
                    <span>{coopPct}% Coop</span>
                    <span>{pop.cooperators}:{pop.defectors}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}