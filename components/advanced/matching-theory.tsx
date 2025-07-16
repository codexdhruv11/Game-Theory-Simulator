"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Commented out due to missing exports
/*
import {
  galeShapleyAlgorithm,
  isStableMatching,
  calculateMatchingWelfare,
  generateRandomPreferences,
  createSampleMatchingMarket,
  type Agent,
  type Match,
  type MatchingMarket
} from "@/lib/game-theory/matching-theory"
*/

// Mock types for development
type Agent = any;
type Match = any;
type MatchingMarket = any;

export function MatchingTheory() {
  const [market, setMarket] = useState<MatchingMarket | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [matchingStep, setMatchingStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    initializeMarket()
  }, [])

  const initializeMarket = () => {
    const newMarket = createSampleMatchingMarket()
    setMarket(newMarket)
    setMatchingStep(0)
  }

  const generateRandomMarket = () => {
    if (!market) return
    
    const randomMen = generateRandomPreferences(market.men, market.women)
    const randomWomen = generateRandomPreferences(market.women, market.men)
    
    const newMatches = galeShapleyAlgorithm(randomMen, randomWomen)
    
    setMarket({
      men: randomMen,
      women: randomWomen,
      matches: newMatches
    })
    setMatchingStep(0)
  }

  const runGaleShapley = async () => {
    if (!market) return
    
    setIsAnimating(true)
    const newMatches = galeShapleyAlgorithm(market.men, market.women)
    
    // Animate the matching process
    for (let i = 0; i <= newMatches.length; i++) {
      setMatchingStep(i)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    setMarket(prev => prev ? { ...prev, matches: newMatches } : null)
    setIsAnimating(false)
  }

  const welfare = market ? calculateMatchingWelfare(market.men, market.women, market.matches) : 0
  const isStable = market ? isStableMatching(market.men, market.women, market.matches) : false

  const getAgentMatch = (agentId: string) => {
    if (!market) return null
    const match = market.matches.find(m => m.agent1 === agentId || m.agent2 === agentId)
    if (!match) return null
    
    const partnerId = match.agent1 === agentId ? match.agent2 : match.agent1
    const partner = [...market.men, ...market.women].find(a => a.id === partnerId)
    return partner
  }

  const getPreferenceRank = (agent: Agent, partnerId: string) => {
    const rank = agent.preferences.indexOf(partnerId)
    return rank === -1 ? 'Not ranked' : `#${rank + 1}`
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="matching" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-4">
          {/* Current Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {market && (
                <div className="space-y-3">
                  {market.matches.slice(0, matchingStep).map((match, index) => {
                    const man = market.men.find(m => m.id === match.agent1)
                    const woman = market.women.find(w => w.id === match.agent2)
                    
                    if (!man || !woman) return null
                    
                    return (
                      <motion.div
                        key={`${match.agent1}-${match.agent2}`}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {man.name.charAt(0)}
                            </div>
                            <div className="text-xs mt-1">{man.name}</div>
                          </div>
                          
                          <motion.div
                            className="text-xl"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 + 0.3 }}
                          >
                            💕
                          </motion.div>
                          
                          <div className="text-center">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {woman.name.charAt(0)}
                            </div>
                            <div className="text-xs mt-1">{woman.name}</div>
                          </div>
                        </div>
                        
                        <div className="text-right text-xs">
                          <div>His rank: {getPreferenceRank(man, woman.id)}</div>
                          <div>Her rank: {getPreferenceRank(woman, man.id)}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                  
                  {market.matches.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No matches yet. Run the Gale-Shapley algorithm to find stable matches.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Matching Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={runGaleShapley} 
                  disabled={isAnimating}
                  className="w-full"
                >
                  {isAnimating ? 'Running...' : 'Run Gale-Shapley'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateRandomMarket}
                  disabled={isAnimating}
                >
                  Random Preferences
                </Button>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Stability:</span>
                  <span className={`ml-2 ${isStable ? 'text-green-600' : 'text-red-600'}`}>
                    {isStable ? '✓ Stable' : '✗ Unstable'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Welfare:</span>
                  <span className="ml-2 font-mono">{welfare}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {/* Men's Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Men&apos;s Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {market && (
                <div className="space-y-3">
                  {market.men.map((man, index) => (
                    <motion.div
                      key={man.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAgent === man.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-transparent bg-muted'
                      }`}
                      onClick={() => setSelectedAgent(selectedAgent === man.id ? null : man.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{man.name}</div>
                        <div className="text-xs">
                          Matched: {getAgentMatch(man.id)?.name || 'None'}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Preferences: {man.preferences.map(pref => {
                          const woman = market.women.find(w => w.id === pref)
                          return woman?.name
                        }).join(' > ')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Women's Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Women&apos;s Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {market && (
                <div className="space-y-3">
                  {market.women.map((woman, index) => (
                    <motion.div
                      key={woman.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAgent === woman.id 
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' 
                          : 'border-transparent bg-muted'
                      }`}
                      onClick={() => setSelectedAgent(selectedAgent === woman.id ? null : woman.id)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{woman.name}</div>
                        <div className="text-xs">
                          Matched: {getAgentMatch(woman.id)?.name || 'None'}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Preferences: {woman.preferences.map(pref => {
                          const man = market.men.find(m => m.id === pref)
                          return man?.name
                        }).join(' > ')}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Stability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Stability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <span className="font-medium">Matching is stable:</span>
                  <span className={`font-bold ${isStable ? 'text-green-600' : 'text-red-600'}`}>
                    {isStable ? 'YES' : 'NO'}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    <strong>Stable matching:</strong> No pair of agents would prefer to be matched 
                    with each other rather than their current partners.
                  </p>
                  <p>
                    <strong>Gale-Shapley algorithm:</strong> Always produces a stable matching that 
                    is optimal for the proposing side (men in this implementation).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Welfare Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Welfare Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-2xl font-bold font-mono">{welfare}</div>
                    <div className="text-xs text-muted-foreground">Total Welfare</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-2xl font-bold font-mono">
                      {market ? (welfare / (market.men.length + market.women.length)).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-muted-foreground">Average Welfare</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    Welfare is calculated based on preference rankings. Higher-ranked matches 
                    contribute more to total welfare.
                  </p>
                  <p>
                    The Gale-Shapley algorithm produces a matching that is optimal for the 
                    proposing side but may not maximize total welfare.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Algorithm Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-green-600">✓ Guarantees</div>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• Always terminates</li>
                      <li>• Produces stable matching</li>
                      <li>• Optimal for proposers</li>
                      <li>• Strategy-proof for proposers</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-orange-600">⚠ Limitations</div>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>• May not maximize welfare</li>
                      <li>• Pessimal for receivers</li>
                      <li>• Not strategy-proof for receivers</li>
                      <li>• Assumes complete preferences</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="font-medium mb-1">Applications:</div>
                  <div className="text-muted-foreground">
                    Medical residency matching, school choice, kidney exchange, 
                    college admissions, and many other two-sided markets.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}