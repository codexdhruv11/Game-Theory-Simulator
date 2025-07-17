"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { PrisonersDilemmaGame, ALL_STRATEGIES } from "../engine"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { Strategy, GameResult } from "../types"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts"

interface NoiseProps {
  onComplete: () => void
}

export function Noise({ onComplete }: NoiseProps) {
  // State
  const [noiseLevel, setNoiseLevel] = useState(0.1) // 10% noise by default
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>([
    ALL_STRATEGIES.find(s => s.id === "tit_for_tat")!,
    ALL_STRATEGIES.find(s => s.id === "grudger")!,
    ALL_STRATEGIES.find(s => s.id === "generous_tit_for_tat")!,
    ALL_STRATEGIES.find(s => s.id === "pavlov")!
  ])
  const [rounds, setRounds] = useState(50)
  const [results, setResults] = useState<{
    strategy: Strategy
    withoutNoise: GameResult[]
    withNoise: GameResult[]
  }[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showExplanation, setShowExplanation] = useState(true)

  // Run simulations
  const runSimulations = () => {
    setIsRunning(true)
    setShowExplanation(false)
    
    // Create two game instances - one with noise, one without
    const gameWithoutNoise = new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX)
    const gameWithNoise = new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX)
    
    // Run simulations for each strategy against Tit for Tat
    const titForTat = ALL_STRATEGIES.find(s => s.id === "tit_for_tat")!
    const newResults = selectedStrategies.map(strategy => {
      // Run without noise
      const withoutNoise = gameWithoutNoise.playMatch(
        strategy,
        titForTat,
        rounds,
        0 // No noise
      )
      
      // Run with noise
      const withNoise = gameWithNoise.playMatch(
        strategy,
        titForTat,
        rounds,
        noiseLevel // Apply noise
      )
      
      return { strategy, withoutNoise, withNoise }
    })
    
    setResults(newResults)
    setIsRunning(false)
  }

  // Calculate average scores
  const calculateAverageScore = (results: GameResult[]): number => {
    if (results.length === 0) return 0
    const totalScore = results.reduce((sum, result) => sum + result.player1Score, 0)
    return totalScore / results.length
  }

  // Calculate cooperation rate
  const calculateCooperationRate = (results: GameResult[]): number => {
    if (results.length === 0) return 0
    const cooperations = results.filter(r => r.player1Move === "cooperate").length
    return cooperations / results.length
  }

  // Format data for charts
  const formatComparisonData = () => {
    return results.map(result => ({
      name: result.strategy.name,
      withoutNoise: calculateAverageScore(result.withoutNoise),
      withNoise: calculateAverageScore(result.withNoise),
      cooperationWithoutNoise: calculateCooperationRate(result.withoutNoise) * 100,
      cooperationWithNoise: calculateCooperationRate(result.withNoise) * 100,
      color: result.strategy.color
    }))
  }

  // Format round-by-round data for a specific strategy
  const formatRoundData = (strategyIndex: number) => {
    if (!results[strategyIndex]) return []
    
    const { withoutNoise, withNoise } = results[strategyIndex]
    
    return Array(rounds).fill(0).map((_, i) => ({
      round: i + 1,
      withoutNoise: withoutNoise[i]?.player1Move === "cooperate" ? 1 : 0,
      withNoise: withNoise[i]?.player1Move === "cooperate" ? 1 : 0,
      noiseError: withoutNoise[i]?.player1Move !== withNoise[i]?.player1Move ? 1 : 0
    }))
  }

  // Get the most noise-resistant strategy
  const getMostNoiseResistant = () => {
    if (results.length === 0) return null
    
    let bestIndex = 0
    let smallestDrop = -Infinity
    
    results.forEach((result, index) => {
      const scoreWithoutNoise = calculateAverageScore(result.withoutNoise)
      const scoreWithNoise = calculateAverageScore(result.withNoise)
      const scoreDrop = scoreWithNoise - scoreWithoutNoise
      
      if (scoreDrop > smallestDrop) {
        smallestDrop = scoreDrop
        bestIndex = index
      }
    })
    
    return results[bestIndex].strategy
  }

  const noiseResistantStrategy = getMostNoiseResistant()

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Noise: When Communication Fails</CardTitle>
        <p className="text-muted-foreground">
          Explore how strategies perform when mistakes happen in communication
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {showExplanation && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Understanding Noise</h3>
                <p>
                  In real-world interactions, mistakes happen. You might intend to cooperate, but your action is perceived as defection.
                </p>
                <p>
                  This is called "noise" in game theory - when your intended move isn't what actually happens.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Noise can break reciprocal strategies like Tit for Tat</li>
                  <li>Forgiving strategies tend to perform better under noise</li>
                  <li>Too much noise can make cooperation impossible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {!isRunning && results.length === 0 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Noise Simulation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Noise Level: {Math.round(noiseLevel * 100)}%</span>
                </div>
                <Slider 
                  value={[noiseLevel * 100]} 
                  min={0} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => setNoiseLevel(value[0] / 100)}
                  className="my-2"
                />
                <p className="text-xs text-muted-foreground">
                  This is the probability that a move will be flipped from cooperate to defect or vice versa.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Number of Rounds: {rounds}</span>
                </div>
                <Slider 
                  value={[rounds]} 
                  min={10} 
                  max={100} 
                  step={10}
                  onValueChange={(value) => setRounds(value[0])}
                  className="my-2"
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button onClick={runSimulations} size="lg">
                Run Noise Simulation
              </Button>
            </div>
          </div>
        ) : isRunning ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Running simulations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Simulation Results with {Math.round(noiseLevel * 100)}% Noise
              </h3>
              <Badge variant="outline">
                {rounds} rounds per match
              </Badge>
            </div>
            
            {/* Score Comparison Chart */}
            <div>
              <h4 className="text-md font-medium mb-2">Average Score Comparison</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatComparisonData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="withoutNoise" name="Without Noise" fill="#8884d8" />
                    <Bar dataKey="withNoise" name="With Noise" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Cooperation Rate Comparison */}
            <div>
              <h4 className="text-md font-medium mb-2">Cooperation Rate Comparison</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatComparisonData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cooperationWithoutNoise" name="Cooperation % Without Noise" fill="#8884d8" />
                    <Bar dataKey="cooperationWithNoise" name="Cooperation % With Noise" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Round-by-round view for a selected strategy */}
            {results.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">
                  Round-by-Round View: {results[0].strategy.name}
                </h4>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatRoundData(0)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" />
                      <YAxis ticks={[0, 1]} domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="stepAfter" 
                        dataKey="withoutNoise" 
                        stroke="#8884d8" 
                        name="Without Noise (1=Cooperate)" 
                        dot={false}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="withNoise" 
                        stroke="#82ca9d" 
                        name="With Noise (1=Cooperate)" 
                        dot={false}
                      />
                      <Line 
                        type="step" 
                        dataKey="noiseError" 
                        stroke="#ff0000" 
                        name="Noise Error" 
                        dot={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Mathematical insight based on MathsTrustEvolution.txt */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Game Theory Insight: Noise and Forgiveness</h3>
                  <p className="text-sm">
                    As shown in Wu & Axelrod's research, noise has a profound effect on strategy performance.
                    Unforgiving strategies like Grudger can spiral into endless defection after a single error,
                    while forgiving strategies like Generous Tit for Tat can recover from mistakes.
                  </p>
                  <p className="text-sm mt-2">
                    The optimal level of forgiveness is proportional to the noise level.
                    With {Math.round(noiseLevel * 100)}% noise, strategies should forgive approximately
                    {Math.round(noiseLevel * 100)}% of defections to maintain cooperation.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Most noise-resistant strategy */}
            {noiseResistantStrategy && (
              <Card className="border-2" style={{ borderColor: noiseResistantStrategy.color }}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">Most Noise-Resistant Strategy</h3>
                    <div className="text-3xl font-bold" style={{ color: noiseResistantStrategy.color }}>
                      {noiseResistantStrategy.name}
                    </div>
                    <p className="text-muted-foreground">{noiseResistantStrategy.description}</p>
                    
                    <div className="mt-4">
                      <p>
                        This strategy performed best under noise conditions, showing the smallest
                        performance drop when noise was introduced.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {noiseResistantStrategy.isForgiving 
                          ? "Its forgiving nature helps it recover from communication errors."
                          : "Despite not being explicitly forgiving, this strategy handles noise well."
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => {
                setResults([])
                setShowExplanation(true)
              }}>
                New Simulation
              </Button>
              <Button onClick={onComplete}>Continue to Sandbox</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 