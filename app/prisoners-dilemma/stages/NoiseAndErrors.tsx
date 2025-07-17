"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { Zap, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { ALL_STRATEGIES } from "@/app/trust-evolution/engine/strategies"
import { PrisonersDilemmaGame } from "@/app/trust-evolution/engine/pdCore"

interface NoiseAndErrorsProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

const DEFAULT_PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
}

export function NoiseAndErrors({ onComplete, isCompleted }: NoiseAndErrorsProps) {
  const [noiseLevel, setNoiseLevel] = useState([0])
  const [selectedStrategies, setSelectedStrategies] = useState([
    "tit_for_tat", "generous_tit_for_tat", "grudger", "always_cooperate"
  ])
  const [results, setResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runNoiseExperiment = async () => {
    setIsRunning(true)
    
    const strategies = ALL_STRATEGIES.filter(s => selectedStrategies.includes(s.id))
    const noiseLevels = [0, 0.01, 0.05, 0.1, 0.2]
    const experimentResults = []
    
    for (const noise of noiseLevels) {
      const noiseResults = []
      
      for (const strategy of strategies) {
        const game = new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX)
        const opponent = ALL_STRATEGIES.find(s => s.id === "tit_for_tat")!
        
        const gameResults = game.playMatch(strategy, opponent, 100, noise)
        const [playerScore, opponentScore] = game.getTotalScores()
        const [cooperationRate] = game.getCooperationRates()
        
        noiseResults.push({
          strategy: strategy.name,
          strategyId: strategy.id,
          score: playerScore,
          cooperationRate,
          noise
        })
        
        game.reset()
      }
      
      experimentResults.push({
        noise,
        results: noiseResults
      })
      
      // Add delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setResults(experimentResults)
    setIsRunning(false)
  }

  const handleComplete = () => {
    onComplete({
      experimentsRun: results ? 1 : 0,
      achievements: results ? ["Noise Explorer"] : []
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Noise and Errors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            In real life, communication isn't perfect. Sometimes a cooperative intention 
            gets misunderstood as defection, or vice versa. Let's see how noise affects cooperation.
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-orange-800 dark:text-orange-200 text-sm">
              <strong>Key Insight:</strong> Even small amounts of noise can destroy cooperation 
              between unforgiving strategies, while generous strategies can maintain cooperation.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Noise Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Noise Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Noise Level: {(noiseLevel[0] * 100).toFixed(1)}%
              </label>
              <Slider
                value={noiseLevel}
                onValueChange={setNoiseLevel}
                max={0.3}
                step={0.01}
                className="w-full"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Probability that a move gets flipped by mistake
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">What happens with {(noiseLevel[0] * 100).toFixed(1)}% noise:</h4>
              
              {noiseLevel[0] === 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    Perfect communication - strategies work as intended
                  </p>
                </div>
              )}
              
              {noiseLevel[0] > 0 && noiseLevel[0] <= 0.05 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Low noise - generous strategies start to show their advantage
                  </p>
                </div>
              )}
              
              {noiseLevel[0] > 0.05 && noiseLevel[0] <= 0.15 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    Medium noise - unforgiving strategies struggle, cooperation drops
                  </p>
                </div>
              )}
              
              {noiseLevel[0] > 0.15 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    High noise - most strategies fail, only very generous ones survive
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <h4 className="font-semibold mb-2">Strategy Resilience to Noise:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Always Cooperate</span>
                  <span className="text-green-600 dark:text-green-400">Very High</span>
                </div>
                <div className="flex justify-between">
                  <span>Generous Tit-for-Tat</span>
                  <span className="text-green-600 dark:text-green-400">High</span>
                </div>
                <div className="flex justify-between">
                  <span>Tit-for-Tat</span>
                  <span className="text-yellow-600 dark:text-yellow-400">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span>Grudger</span>
                  <span className="text-red-600 dark:text-red-400">Low</span>
                </div>
                <div className="flex justify-between">
                  <span>Always Defect</span>
                  <span className="text-red-600 dark:text-red-400">Very Low</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Noise Experiment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Noise Experiment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Run an experiment to see how different noise levels affect strategy performance
            </p>
            
            <Button 
              onClick={runNoiseExperiment}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? "Running Experiment..." : "Run Noise Experiment"}
            </Button>

            {isRunning && (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Testing strategies at different noise levels...</p>
              </div>
            )}

            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h4 className="font-semibold">Experiment Results</h4>
                
                {results.map((noiseResult: any, index: number) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-4">
                      <h5 className="font-semibold mb-2">
                        Noise Level: {(noiseResult.noise * 100).toFixed(1)}%
                      </h5>
                      <div className="space-y-1">
                        {noiseResult.results
                          .sort((a: any, b: any) => b.cooperationRate - a.cooperationRate)
                          .map((result: any, resultIndex: number) => (
                            <div key={resultIndex} className="flex justify-between text-sm">
                              <span>{result.strategy}</span>
                              <div className="text-right">
                                <span className="font-semibold">{result.score}</span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                  ({(result.cooperationRate * 100).toFixed(0)}% coop)
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Key Observations:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Generous strategies maintain higher cooperation rates</li>
                      <li>• Unforgiving strategies suffer more from noise</li>
                      <li>• Even small noise levels can significantly impact outcomes</li>
                      <li>• Forgiveness becomes crucial in noisy environments</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-world Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Real-World Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <h4 className="font-semibold mb-2">International Relations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Miscommunication between nations can escalate conflicts. 
                Diplomatic protocols often include "generous" interpretations.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <h4 className="font-semibold mb-2">Business Partnerships</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contract disputes often arise from misunderstandings. 
                Successful partnerships build in forgiveness mechanisms.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
              <h4 className="font-semibold mb-2">Computer Networks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Network protocols must handle packet loss and errors. 
                Robust systems include retry and error correction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion */}
      {results && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Noise Experiments Complete!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've seen how noise affects cooperation. Ready to explore evolution?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Evolution
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