"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  calculateUtility,
  // calculateProspectValue,
  // simulateUltimatumGame,
  // simulateDictatorGame,
  // simulatePublicGoodsGame,
  // createBehavioralAgent,
  // generateRandomAgents,
  type BehavioralAgent,
  type Prospect,
  // type UltimatumGame
} from "@/lib/game-theory/behavioral-economics"

// Temporary placeholder functions until we implement the missing ones
const calculateProspectValue = (prospect: Prospect) => 0;
const simulateUltimatumGame = (proposer: BehavioralAgent, responder: BehavioralAgent, amount: number) => ({ offer: 0, accepted: false, proposer, responder });
const simulateDictatorGame = (dictator: BehavioralAgent, amount: number) => 0;
const simulatePublicGoodsGame = (agents: BehavioralAgent[], multiplier: number) => [0];
const createBehavioralAgent = (type: string, risk: number, fairness: number, reciprocity: number) => ({ type, risk, fairness, reciprocity });
const generateRandomAgents = (count: number) => Array(count).fill(null).map(() => createBehavioralAgent('random', 0.5, 0.5, 0.5));
type UltimatumGame = { offer: number; accepted: boolean; proposer: BehavioralAgent; responder: BehavioralAgent };

export function BehavioralEconomics() {
  const [selectedExperiment, setSelectedExperiment] = useState<'ultimatum' | 'dictator' | 'public-goods' | 'prospect'>('ultimatum')
  const [agents, setAgents] = useState<BehavioralAgent[]>([])
  const [ultimatumResult, setUltimatumResult] = useState<UltimatumGame | null>(null)
  const [dictatorResult, setDictatorResult] = useState<number>(0)
  const [publicGoodsResults, setPublicGoodsResults] = useState<number[]>([])
  const [prospect, setProspect] = useState<Prospect>({
    outcomes: [100, -50],
    probabilities: [0.5, 0.5]
  })

  useEffect(() => {
    initializeAgents()
  }, [])

  const initializeAgents = () => {
    const newAgents = generateRandomAgents(4)
    setAgents(newAgents)
  }

  const runUltimatumGame = () => {
    if (agents.length >= 2) {
      const result = simulateUltimatumGame(agents[0], agents[1], 100)
      setUltimatumResult(result)
    }
  }

  const runDictatorGame = () => {
    if (agents.length >= 1) {
      const result = simulateDictatorGame(agents[0], 100)
      setDictatorResult(result)
    }
  }

  const runPublicGoodsGame = () => {
    const results = simulatePublicGoodsGame(agents, 20, 2)
    setPublicGoodsResults(results)
  }

  const updateAgentParameter = (agentIndex: number, parameter: keyof BehavioralAgent, value: number) => {
    setAgents(prev => prev.map((agent, index) => 
      index === agentIndex ? { ...agent, [parameter]: value } : agent
    ))
  }

  const calculateProspectUtility = (agentIndex: number) => {
    if (agents[agentIndex]) {
      return calculateProspectValue(agents[agentIndex], prospect)
    }
    return 0
  }

  return (
    <div className="space-y-4">
      <Tabs value={selectedExperiment} onValueChange={(value) => setSelectedExperiment(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ultimatum">Ultimatum</TabsTrigger>
          <TabsTrigger value="dictator">Dictator</TabsTrigger>
          <TabsTrigger value="public-goods">Public Goods</TabsTrigger>
          <TabsTrigger value="prospect">Prospect Theory</TabsTrigger>
        </TabsList>

        <TabsContent value="ultimatum" className="space-y-4">
          {/* Ultimatum Game */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ultimatum Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Proposer offers a split of $100. Responder can accept or reject (both get $0).
              </div>

              {agents.length >= 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Proposer: {agents[0].name}</div>
                    <div className="text-xs space-y-1">
                      <div>Risk Aversion: {agents[0].riskAversion.toFixed(2)}</div>
                      <div>Fairness: {agents[0].fairnessPreference.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Responder: {agents[1].name}</div>
                    <div className="text-xs space-y-1">
                      <div>Loss Aversion: {agents[1].lossAversion.toFixed(2)}</div>
                      <div>Fairness: {agents[1].fairnessPreference.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={runUltimatumGame} className="w-full">
                Run Ultimatum Game
              </Button>

              {ultimatumResult && (
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-2">
                    <div className="font-medium">
                      Offer: ${ultimatumResult.offer} to responder, ${ultimatumResult.totalAmount - ultimatumResult.offer} to proposer
                    </div>
                    <div className={`text-lg font-bold ${ultimatumResult.accepted ? 'text-green-600' : 'text-red-600'}`}>
                      {ultimatumResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ultimatumResult.accepted 
                        ? 'Both players receive their shares'
                        : 'Both players receive $0'
                      }
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dictator" className="space-y-4">
          {/* Dictator Game */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dictator Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Dictator decides how to split $100. Recipient has no choice.
              </div>

              {agents.length >= 1 && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">Dictator: {agents[0].name}</div>
                  <div className="text-xs space-y-1">
                    <div>Fairness Preference: {agents[0].fairnessPreference.toFixed(2)}</div>
                    <Slider
                      value={[agents[0].fairnessPreference]}
                      onValueChange={(value) => updateAgentParameter(0, 'fairnessPreference', value[0])}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <Button onClick={runDictatorGame} className="w-full">
                Run Dictator Game
              </Button>

              {dictatorResult > 0 && (
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-2">
                    <div className="font-medium">
                      Dictator gives: ${dictatorResult}
                    </div>
                    <div className="font-medium">
                      Dictator keeps: ${100 - dictatorResult}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Allocation based on fairness preference: {agents[0]?.fairnessPreference.toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public-goods" className="space-y-4">
          {/* Public Goods Game */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Public Goods Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Each player has $20. Contributions are doubled and split equally among all players.
              </div>

              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <div key={agent.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{agent.name}</span>
                      <span className="text-xs">Fairness: {agent.fairnessPreference.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[agent.fairnessPreference]}
                      onValueChange={(value) => updateAgentParameter(index, 'fairnessPreference', value[0])}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={runPublicGoodsGame} className="w-full">
                Run Public Goods Game
              </Button>

              {publicGoodsResults.length > 0 && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {agents.map((agent, index) => (
                    <div key={agent.id} className="flex justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{agent.name}</span>
                      <span className="font-mono">${publicGoodsResults[index]?.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mt-2">
                    Total welfare: ${publicGoodsResults.reduce((sum, result) => sum + result, 0).toFixed(2)}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospect" className="space-y-4">
          {/* Prospect Theory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Prospect Theory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Evaluate how different agents perceive the same risky prospect.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Prospect Outcomes:</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-xs">Gain: ${prospect.outcomes[0]}</span>
                      <Slider
                        value={[prospect.outcomes[0]]}
                        onValueChange={(value) => setProspect(prev => ({
                          ...prev,
                          outcomes: [value[0], prev.outcomes[1]]
                        }))}
                        max={200}
                        min={0}
                        step={10}
                      />
                    </div>
                    <div>
                      <span className="text-xs">Loss: ${prospect.outcomes[1]}</span>
                      <Slider
                        value={[Math.abs(prospect.outcomes[1])]}
                        onValueChange={(value) => setProspect(prev => ({
                          ...prev,
                          outcomes: [prev.outcomes[0], -value[0]]
                        }))}
                        max={200}
                        min={0}
                        step={10}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Probability of Gain: {(prospect.probabilities[0] * 100).toFixed(0)}%</label>
                  <Slider
                    value={[prospect.probabilities[0]]}
                    onValueChange={(value) => setProspect(prev => ({
                      ...prev,
                      probabilities: [value[0], 1 - value[0]]
                    }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">Agent Valuations:</div>
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div>
                      <div className="text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Risk Aversion: {agent.riskAversion.toFixed(2)}, 
                        Loss Aversion: {agent.lossAversion.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {calculateProspectUtility(index).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Utility</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                <div className="font-medium mb-1">Prospect Theory Features:</div>
                <ul className="space-y-1">
                  <li>• Reference dependence: Outcomes evaluated relative to reference point</li>
                  <li>• Loss aversion: Losses loom larger than equivalent gains</li>
                  <li>• Probability weighting: Small probabilities overweighted</li>
                  <li>• Diminishing sensitivity: Concave for gains, convex for losses</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button size="sm" onClick={initializeAgents}>
              Randomize Agents
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAgents(generateRandomAgents(6))}>
              Add More Agents
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Agents have different behavioral parameters affecting their decisions in economic games.
            Adjust individual parameters in each experiment tab.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}