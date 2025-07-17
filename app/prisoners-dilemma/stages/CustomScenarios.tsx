"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Settings, CheckCircle, Play, Save } from "lucide-react"
import { ALL_STRATEGIES } from "@/app/trust-evolution/engine/strategies"
import { PrisonersDilemmaGame } from "@/app/trust-evolution/engine/pdCore"

interface CustomScenariosProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

export function CustomScenarios({ onComplete, isCompleted }: CustomScenariosProps) {
  const [payoffMatrix, setPayoffMatrix] = useState({
    CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1]
  })
  const [rounds, setRounds] = useState([50])
  const [noiseLevel, setNoiseLevel] = useState([0])
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    "tit_for_tat", "always_cooperate", "always_defect"
  ])
  const [scenarioResults, setScenarioResults] = useState<any>(null)
  const [savedScenarios, setSavedScenarios] = useState<any[]>([])
  const [scenarioName, setScenarioName] = useState("")

  const presetScenarios = [
    {
      name: "Classic Prisoner's Dilemma",
      payoffs: { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] },
      description: "The original formulation"
    },
    {
      name: "Chicken Game",
      payoffs: { CC: [3, 3], CD: [1, 4], DC: [4, 1], DD: [0, 0] },
      description: "Mutual defection is worst for both"
    },
    {
      name: "Stag Hunt",
      payoffs: { CC: [4, 4], CD: [0, 3], DC: [3, 0], DD: [2, 2] },
      description: "Cooperation is best but risky"
    },
    {
      name: "Harmony Game",
      payoffs: { CC: [4, 4], CD: [1, 3], DC: [3, 1], DD: [2, 2] },
      description: "Cooperation dominates defection"
    }
  ]

  const loadPreset = (preset: any) => {
    setPayoffMatrix(preset.payoffs)
  }

  const runCustomScenario = async () => {
    const strategies = ALL_STRATEGIES.filter(s => selectedStrategies.includes(s.id))
    const customPayoffMatrix = {
      cooperate: { 
        cooperate: payoffMatrix.CC, 
        defect: payoffMatrix.CD 
      },
      defect: { 
        cooperate: payoffMatrix.DC, 
        defect: payoffMatrix.DD 
      }
    }

    const results = []
    
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const game = new PrisonersDilemmaGame(customPayoffMatrix)
        const gameResults = game.playMatch(strategies[i], strategies[j], rounds[0], noiseLevel[0])
        const [score1, score2] = game.getTotalScores()
        const [coop1, coop2] = game.getCooperationRates()
        
        results.push({
          strategy1: strategies[i].name,
          strategy2: strategies[j].name,
          score1,
          score2,
          cooperation1: coop1,
          cooperation2: coop2,
          rounds: rounds[0]
        })
        
        game.reset()
      }
    }

    setScenarioResults({
      payoffs: payoffMatrix,
      rounds: rounds[0],
      noise: noiseLevel[0],
      results,
      timestamp: new Date()
    })
  }

  const saveScenario = () => {
    if (!scenarioName.trim()) return
    
    const scenario = {
      name: scenarioName,
      payoffs: payoffMatrix,
      rounds: rounds[0],
      noise: noiseLevel[0],
      strategies: selectedStrategies,
      results: scenarioResults,
      saved: new Date()
    }
    
    setSavedScenarios(prev => [...prev, scenario])
    setScenarioName("")
  }

  const handleComplete = () => {
    onComplete({
      scenariosCreated: savedScenarios.length,
      achievements: savedScenarios.length >= 2 ? ["Scenario Designer"] : ["Custom Explorer"]
    })
  }

  const updatePayoff = (outcome: string, player: number, value: string) => {
    const numValue = parseInt(value) || 0
    setPayoffMatrix(prev => ({
      ...prev,
      [outcome]: player === 0 
        ? [numValue, prev[outcome as keyof typeof prev][1]]
        : [prev[outcome as keyof typeof prev][0], numValue]
    }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Custom Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your own game variations by adjusting payoffs, noise levels, and other parameters. 
            Explore how small changes can dramatically alter strategic outcomes.
          </p>
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <p className="text-teal-800 dark:text-teal-200 text-sm">
              <strong>Design Principle:</strong> The structure of incentives determines behavior. 
              By changing payoffs, you can create entirely different strategic situations.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Designer */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Designer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Scenarios */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Start Presets</Label>
              <div className="grid grid-cols-1 gap-2">
                {presetScenarios.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadPreset(preset)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Payoff Matrix */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Custom Payoff Matrix</Label>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      <th className="p-2 text-sm">Opponent Cooperates</th>
                      <th className="p-2 text-sm">Opponent Defects</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 text-sm font-medium">You Cooperate</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={payoffMatrix.CC[0]}
                            onChange={(e) => updatePayoff('CC', 0, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                          <Input
                            type="number"
                            value={payoffMatrix.CC[1]}
                            onChange={(e) => updatePayoff('CC', 1, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={payoffMatrix.CD[0]}
                            onChange={(e) => updatePayoff('CD', 0, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                          <Input
                            type="number"
                            value={payoffMatrix.CD[1]}
                            onChange={(e) => updatePayoff('CD', 1, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 text-sm font-medium">You Defect</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={payoffMatrix.DC[0]}
                            onChange={(e) => updatePayoff('DC', 0, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                          <Input
                            type="number"
                            value={payoffMatrix.DC[1]}
                            onChange={(e) => updatePayoff('DC', 1, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            value={payoffMatrix.DD[0]}
                            onChange={(e) => updatePayoff('DD', 0, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                          <Input
                            type="number"
                            value={payoffMatrix.DD[1]}
                            onChange={(e) => updatePayoff('DD', 1, e.target.value)}
                            className="w-12 h-8 text-xs text-center"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Format: [Your Score, Opponent Score]
                </p>
              </div>
            </div>

            {/* Game Parameters */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Rounds per Match: {rounds[0]}
                </Label>
                <Slider
                  value={rounds}
                  onValueChange={setRounds}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Noise Level: {(noiseLevel[0] * 100).toFixed(1)}%
                </Label>
                <Slider
                  value={noiseLevel}
                  onValueChange={setNoiseLevel}
                  min={0}
                  max={0.2}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Strategies to Test</Label>
                <Select value={selectedStrategies[0]} onValueChange={(value) => {
                  if (!selectedStrategies.includes(value)) {
                    setSelectedStrategies(prev => [...prev, value])
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STRATEGIES.map(strategy => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedStrategies.map(strategyId => {
                    const strategy = ALL_STRATEGIES.find(s => s.id === strategyId)
                    return (
                      <Button
                        key={strategyId}
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedStrategies(prev => prev.filter(id => id !== strategyId))}
                        className="h-6 text-xs"
                      >
                        {strategy?.name} ×
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Button 
              onClick={runCustomScenario}
              disabled={selectedStrategies.length < 2}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Custom Scenario
            </Button>
          </CardContent>
        </Card>

        {/* Results & Saved Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Results & Saved Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Results */}
            {scenarioResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="font-semibold mb-2">Latest Results</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <span>Rounds: {scenarioResults.rounds}</span>
                      <span>Noise: {(scenarioResults.noise * 100).toFixed(1)}%</span>
                    </div>
                    <div className="space-y-1">
                      {scenarioResults.results.map((result: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{result.strategy1} vs {result.strategy2}</span>
                          <span>{result.score1}-{result.score2}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Scenario name"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={saveScenario} disabled={!scenarioName.trim()}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Saved Scenarios */}
            {savedScenarios.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Saved Scenarios ({savedScenarios.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedScenarios.map((scenario, index) => (
                    <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{scenario.name}</h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {scenario.rounds} rounds, {(scenario.noise * 100).toFixed(1)}% noise
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPayoffMatrix(scenario.payoffs)
                              setRounds([scenario.rounds])
                              setNoiseLevel([scenario.noise])
                              setSelectedStrategies(scenario.strategies)
                            }}
                          >
                            Load
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!scenarioResults && savedScenarios.length === 0 && (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Create and run scenarios to see results here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Completion */}
      {(scenarioResults || savedScenarios.length > 0) && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Custom Scenarios Created!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've explored custom game variations. Ready for the final reflection?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Conclusion
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