"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  createJobMarketSignalingModel,
  findSeparatingEquilibria,
  findPoolingEquilibria,
  calculateWelfare,
  type SignalingGame,
  type SignalingEquilibrium,
  type PlayerType
} from "@/lib/game-theory/signaling-games"

// Temporary placeholder functions for missing methods
const calculateSeparatingEquilibrium = () => ({
  highTypeSignal: 2,
  lowTypeSignal: 0,
  beliefs: { high: 1, low: 0 },
  payoffs: { high: 8, low: 6 },
  highEducation: 2.5,
  lowEducation: 0
});

const calculatePoolingEquilibrium = () => ({
  signal: 1,
  beliefs: { high: 0.5, low: 0.5 },
  payoffs: { high: 7, low: 7 },
  education: 1.2
});

const educationCost = (signal: number, type: string) => {
  return type === 'high' ? signal * 0.5 : signal * 1.0;
};

const simulateReputationGame = (rounds: number) => {
  return Array.from({ length: rounds }, (_, i) => ({
    round: i + 1,
    quality: Math.random() > 0.5 ? 'high' as const : 'low' as const,
    price: 50 + Math.random() * 50,
    reputation: Math.max(0, Math.min(1, 0.5 + (Math.random() - 0.5) * 0.4))
  }));
};

export function SignalingGame() {
  const [selectedGame, setSelectedGame] = useState<'job-market' | 'reputation' | 'custom'>('job-market')
  const [jobMarket, setJobMarket] = useState<SignalingGame | null>(null)
  const [reputationHistory, setReputationHistory] = useState<Array<{
    round: number
    quality: 'high' | 'low'
    price: number
    reputation: number
  }>>([])
  const [probHighType, setProbHighType] = useState([0.5])
  const [signalLevel, setSignalLevel] = useState([2])
  const [equilibriumType, setEquilibriumType] = useState<'separating' | 'pooling'>('separating')

  const initializeJobMarket = useCallback(() => {
    const market = createJobMarketSignalingModel(20, probHighType[0])
    setJobMarket(market)
  }, [probHighType])

  useEffect(() => {
    initializeJobMarket()
  }, [initializeJobMarket])

  const runReputationGame = () => {
    const history = simulateReputationGame(10)
    setReputationHistory(history)
  }

  const separatingEq = calculateSeparatingEquilibrium()
  const poolingEq = calculatePoolingEquilibrium()

  const signalCostHigh = educationCost(signalLevel[0] || 0, 'high')
  const signalCostLow = educationCost(signalLevel[0] || 0, 'low')

  const chartData = reputationHistory.map(round => ({
    round: round.round,
    reputation: round.reputation * 100,
    price: round.price,
    quality: round.quality === 'high' ? 100 : 50
  }))

  return (
    <div className="space-y-4">
      <Tabs value={selectedGame} onValueChange={(value) => setSelectedGame(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="job-market">Job Market</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
          <TabsTrigger value="custom">Custom Signal</TabsTrigger>
        </TabsList>

        <TabsContent value="job-market" className="space-y-4">
          {/* Job Market Signaling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job Market Signaling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Workers signal their productivity through education. High-productivity workers 
                have lower education costs.
              </div>

              <div>
                <label className="text-xs font-medium">
                  Probability of High-Productivity Worker: {(probHighType[0] * 100).toFixed(0)}%
                </label>
                <Slider
                  value={probHighType}
                  onValueChange={setProbHighType}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="sm"
                  variant={equilibriumType === 'separating' ? 'default' : 'outline'}
                  onClick={() => setEquilibriumType('separating')}
                >
                  Separating Equilibrium
                </Button>
                <Button
                  size="sm"
                  variant={equilibriumType === 'pooling' ? 'default' : 'outline'}
                  onClick={() => setEquilibriumType('pooling')}
                >
                  Pooling Equilibrium
                </Button>
              </div>

              {equilibriumType === 'separating' && (
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">Separating Equilibrium:</div>
                    <div>High-productivity education: {separatingEq.highEducation.toFixed(2)} years</div>
                    <div>Low-productivity education: {separatingEq.lowEducation} years</div>
                    <div>High-productivity wage: $100</div>
                    <div>Low-productivity wage: $50</div>
                  </div>
                </motion.div>
              )}

              {equilibriumType === 'pooling' && (
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">Pooling Equilibrium:</div>
                    <div>Education level: {poolingEq.education} years</div>
                    <div>Wage for all: ${poolingEq.wage}</div>
                    <div className="text-xs text-muted-foreground">
                      Both types get same education and wage based on average productivity
                    </div>
                  </div>
                </motion.div>
              )}

              {jobMarket && (
                <div className="space-y-3">
                  <div className="font-medium text-sm">Market Simulation:</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium">High-Productivity Workers:</div>
                      <div>{jobMarket.workers?.filter(w => w.productivity === 'high').length || 0}</div>
                    </div>
                    <div>
                      <div className="font-medium">Low-Productivity Workers:</div>
                      <div>{jobMarket.workers?.filter(w => w.productivity === 'low').length || 0}</div>
                    </div>
                    <div>
                      <div className="font-medium">Average Education (High):</div>
                      <div>
                        {jobMarket.workers?.length > 0 ? (
                          jobMarket.workers
                            .filter(w => w.productivity === 'high')
                            .reduce((sum, w) => sum + (w.education || 0), 0) / 
                            (jobMarket.workers.filter(w => w.productivity === 'high').length || 1)
                        ).toFixed(1) : '0.0'} years
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Average Education (Low):</div>
                      <div>
                        {jobMarket.workers?.length > 0 ? (
                          jobMarket.workers
                            .filter(w => w.productivity === 'low')
                            .reduce((sum, w) => sum + (w.education || 0), 0) / 
                            (jobMarket.workers.filter(w => w.productivity === 'low').length || 1)
                        ).toFixed(1) : '0.0'} years
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reputation" className="space-y-4">
          {/* Reputation Game */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reputation Building</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                A firm builds reputation over time. High quality is costly but builds reputation, 
                leading to higher prices.
              </div>

              <Button onClick={runReputationGame} className="w-full">
                Simulate 10 Rounds
              </Button>

              {reputationHistory.length > 0 && (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="reputation" 
                          stroke="#3b82f6" 
                          name="Reputation %" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#ef4444" 
                          name="Price $" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    <div className="font-medium text-sm">Game History:</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {reputationHistory.map((round, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center p-2 bg-muted rounded text-xs"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span>Round {round.round}</span>
                          <span className={round.quality === 'high' ? 'text-green-600' : 'text-red-600'}>
                            {round.quality === 'high' ? 'High Quality' : 'Low Quality'}
                          </span>
                          <span>${round.price}</span>
                          <span>{(round.reputation * 100).toFixed(0)}% rep</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {/* Custom Signaling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custom Signaling Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Analyze signaling costs and payoffs for different signal levels and types.
              </div>

              <div>
                <label className="text-xs font-medium">Signal Level: {signalLevel[0]}</label>
                <Slider
                  value={signalLevel}
                  onValueChange={setSignalLevel}
                  max={10}
                  min={0}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="font-medium text-sm text-blue-700 dark:text-blue-300">
                    High Type
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    ${signalCostHigh.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Signaling Cost</div>
                </motion.div>

                <motion.div
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="font-medium text-sm text-red-700 dark:text-red-300">
                    Low Type
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    ${signalCostLow.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Signaling Cost</div>
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">Cost Difference Analysis:</div>
                <div className="p-3 bg-muted rounded text-sm">
                  <div>Cost ratio (Low/High): {(signalCostLow / signalCostHigh).toFixed(2)}</div>
                  <div>Absolute difference: ${(signalCostLow - signalCostHigh).toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    High types have lower signaling costs, making separation possible when 
                    the cost difference is sufficient to overcome the wage premium.
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                <div className="font-medium mb-2">Signaling Game Insights:</div>
                <ul className="space-y-1">
                  <li>• Signals are costly but can reveal private information</li>
                  <li>• Separating equilibrium: Different types choose different signals</li>
                  <li>• Pooling equilibrium: All types choose the same signal</li>
                  <li>• Signaling can be wasteful if purely for redistribution</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}