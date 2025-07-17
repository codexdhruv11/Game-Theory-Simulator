"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Brain, CheckCircle, Play, BarChart3 } from "lucide-react"
import { ALL_STRATEGIES } from "@/app/trust-evolution/engine/strategies"
import { PrisonersDilemmaGame } from "@/app/trust-evolution/engine/pdCore"

interface StrategyLearningProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

const DEFAULT_PAYOFF_MATRIX = {
  cooperate: { cooperate: [3, 3], defect: [0, 5] },
  defect: { cooperate: [5, 0], defect: [1, 1] }
}

export function StrategyLearning({ onComplete, isCompleted }: StrategyLearningProps) {
  const [selectedStrategy, setSelectedStrategy] = useState(ALL_STRATEGIES[0])
  const [testedStrategies, setTestedStrategies] = useState<Set<string>>(new Set())
  const [testResults, setTestResults] = useState<any[]>([])
  const [currentTest, setCurrentTest] = useState<any>(null)

  const testStrategy = async (strategy: any) => {
    const game = new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX)
    
    // Test against different opponents
    const opponents = [
      ALL_STRATEGIES.find(s => s.id === "always_cooperate")!,
      ALL_STRATEGIES.find(s => s.id === "always_defect")!,
      ALL_STRATEGIES.find(s => s.id === "tit_for_tat")!,
      ALL_STRATEGIES.find(s => s.id === "random")!
    ]
    
    const results = []
    
    for (const opponent of opponents) {
      const gameResults = game.playMatch(strategy, opponent, 10)
      const [playerScore, opponentScore] = game.getTotalScores()
      const [cooperationRate] = game.getCooperationRates()
      
      results.push({
        opponent: opponent.name,
        playerScore,
        opponentScore,
        cooperationRate,
        rounds: gameResults.length
      })
      
      game.reset()
    }
    
    const testResult = {
      strategy: strategy.name,
      strategyId: strategy.id,
      results,
      averageScore: results.reduce((sum, r) => sum + r.playerScore, 0) / results.length,
      averageCooperation: results.reduce((sum, r) => sum + r.cooperationRate, 0) / results.length
    }
    
    setCurrentTest(testResult)
    setTestResults(prev => [...prev, testResult])
    setTestedStrategies(prev => new Set([...prev, strategy.id]))
  }

  const handleComplete = () => {
    onComplete({
      strategiesLearned: testedStrategies.size,
      achievements: testedStrategies.size >= 8 ? ["Strategy Master"] : ["Strategy Explorer"]
    })
  }

  const strategyCategories = [
    {
      name: "Nice Strategies",
      strategies: ALL_STRATEGIES.filter(s => s.isNice),
      description: "Never defect first"
    },
    {
      name: "Mean Strategies", 
      strategies: ALL_STRATEGIES.filter(s => !s.isNice),
      description: "May defect first"
    },
    {
      name: "Forgiving Strategies",
      strategies: ALL_STRATEGIES.filter(s => s.isForgiving),
      description: "Return to cooperation after retaliation"
    },
    {
      name: "Unforgiving Strategies",
      strategies: ALL_STRATEGIES.filter(s => !s.isForgiving),
      description: "Hold grudges"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Strategy Learning Laboratory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore different strategies and understand their properties. Test each strategy 
            against various opponents to see how they perform.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{ALL_STRATEGIES.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Strategies</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{testedStrategies.size}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tested</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ALL_STRATEGIES.filter(s => s.isNice).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nice</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ALL_STRATEGIES.filter(s => s.isForgiving).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Forgiving</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore">Explore Strategies</TabsTrigger>
          <TabsTrigger value="test">Test Strategy</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          {strategyCategories.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.strategies.map((strategy) => (
                    <Card 
                      key={strategy.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStrategy.id === strategy.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{strategy.name}</h4>
                          {testedStrategies.has(strategy.id) && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {strategy.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {strategy.isNice && <Badge variant="secondary" className="text-xs">Nice</Badge>}
                          {strategy.isProvokable && <Badge variant="secondary" className="text-xs">Provocable</Badge>}
                          {strategy.isForgiving && <Badge variant="secondary" className="text-xs">Forgiving</Badge>}
                          {strategy.isClear && <Badge variant="secondary" className="text-xs">Clear</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Strategy: {selectedStrategy.name}</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">{selectedStrategy.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedStrategy.isNice && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Nice</Badge>}
                {selectedStrategy.isProvokable && <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Provocable</Badge>}
                {selectedStrategy.isForgiving && <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Forgiving</Badge>}
                {selectedStrategy.isClear && <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Clear</Badge>}
              </div>
              
              <Button 
                onClick={() => testStrategy(selectedStrategy)}
                disabled={testedStrategies.has(selectedStrategy.id)}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                {testedStrategies.has(selectedStrategy.id) ? "Already Tested" : "Test This Strategy"}
              </Button>

              {currentTest && currentTest.strategyId === selectedStrategy.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{currentTest.averageScore.toFixed(1)}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(currentTest.averageCooperation * 100).toFixed(0)}%</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Cooperation Rate</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Performance vs Different Opponents:</h4>
                        {currentTest.results.map((result: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                            <span className="font-medium">{result.opponent}</span>
                            <div className="text-right">
                              <div className="font-semibold">{result.playerScore} pts</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {(result.cooperationRate * 100).toFixed(0)}% cooperation
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                All Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  No strategies tested yet. Go to the Test tab to start testing!
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testResults
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .map((result, index) => (
                        <Card key={result.strategyId} className="relative">
                          <CardContent className="p-4">
                            {index === 0 && (
                              <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                                Best
                              </Badge>
                            )}
                            <h4 className="font-semibold mb-2">{result.strategy}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="font-bold">{result.averageScore.toFixed(1)}</div>
                                <div className="text-gray-600 dark:text-gray-400">Avg Score</div>
                              </div>
                              <div>
                                <div className="font-bold">{(result.averageCooperation * 100).toFixed(0)}%</div>
                                <div className="text-gray-600 dark:text-gray-400">Cooperation</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion */}
      {testedStrategies.size >= 5 && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Strategy Learning Complete!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You've tested {testedStrategies.size} strategies. Ready for tournaments?
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to Tournament
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