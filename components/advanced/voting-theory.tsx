"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// Commented out due to missing exports
/*
import {
  pluralityVoting,
  condorcetVoting,
  bordaCountVoting,
  instantRunoffVoting,
  generateVoterPreferences,
  createSampleElection,
  type Candidate,
  type Voter,
  type VotingResult
} from "@/lib/game-theory/voting-theory"
*/

// Mock types for development
type Candidate = any;
type Voter = any;
type VotingResult = any;

export function VotingTheory() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [results, setResults] = useState<Record<string, VotingResult>>({})
  const [selectedMethod, setSelectedMethod] = useState<string>('plurality')

  const initializeElection = useCallback(() => {
    const newCandidates = createSampleElection().candidates
    const newVoters = createSampleElection().voters
    setCandidates(newCandidates)
    setVoters(newVoters)
    runAllVotingMethods(newVoters, newCandidates)
  }, [])

  useEffect(() => {
    initializeElection()
  }, [initializeElection])

  const runAllVotingMethods = (votersToUse: Voter[], candidatesToUse: Candidate[]) => {
    const newResults: Record<string, VotingResult> = {}
    
    newResults.plurality = pluralityVoting(votersToUse, candidatesToUse)
    newResults.condorcet = condorcetVoting(votersToUse, candidatesToUse)
    newResults.borda = bordaCountVoting(votersToUse, candidatesToUse)
    newResults.irv = instantRunoffVoting(votersToUse, candidatesToUse)
    
    setResults(newResults)
  }

  const randomizeVoterPreferences = () => {
    // Randomize voter ideal points
    const randomizedVoters = voters.map(voter => ({
      ...voter,
      idealPoint: Math.random() * 10
    }))
    
    const votersWithPrefs = generateVoterPreferences(randomizedVoters, candidates)
    setVoters(votersWithPrefs)
    runAllVotingMethods(votersWithPrefs, candidates)
  }

  const getCandidateName = (candidateId: string): string => {
    return candidates.find(c => c.id === candidateId)?.name || candidateId
  }

  const getWinnerName = (result: VotingResult): string => {
    return getCandidateName(result.winner)
  }

  const chartData = Object.entries(results).map(([method, result]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1),
    winner: getCandidateName(result.winner),
    ...Object.fromEntries(
      candidates.map(candidate => [
        candidate.name,
        result.votes[candidate.id] || 0
      ])
    )
  }))

  const selectedResult = results[selectedMethod]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">Voting Results</TabsTrigger>
          <TabsTrigger value="preferences">Voter Preferences</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {/* Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Voting Methods Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  size="sm"
                  variant={selectedMethod === 'plurality' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('plurality')}
                >
                  Plurality
                </Button>
                <Button
                  size="sm"
                  variant={selectedMethod === 'condorcet' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('condorcet')}
                >
                  Condorcet
                </Button>
                <Button
                  size="sm"
                  variant={selectedMethod === 'borda' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('borda')}
                >
                  Borda Count
                </Button>
                <Button
                  size="sm"
                  variant={selectedMethod === 'irv' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('irv')}
                >
                  Instant Runoff
                </Button>
              </div>

              {selectedResult && (
                <motion.div
                  className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={selectedMethod}
                >
                  <div className="text-2xl font-bold">
                    🏆 {getWinnerName(selectedResult)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Winner by {selectedResult.method}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* All Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Winners by Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(results).map(([method, result], index) => (
                  <motion.div
                    key={method}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm">
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </div>
                    <div className="font-bold">
                      {getWinnerName(result)}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                Different voting methods can produce different winners from the same preferences!
              </div>
            </CardContent>
          </Card>

          {/* Vote Distribution Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vote Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      {candidates.map((candidate, index) => (
                        <Bar
                          key={candidate.id}
                          dataKey={candidate.name}
                          fill={`hsl(${index * 120}, 70%, 50%)`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={randomizeVoterPreferences} className="w-full">
            Randomize Voter Preferences
          </Button>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {/* Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-sm">{candidate.name}</div>
                    <div className="text-xs">
                      Position: {candidate.position}/10
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Voters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Voter Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {voters.map((voter, index) => (
                  <motion.div
                    key={voter.id}
                    className="p-3 bg-muted rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{voter.name}</span>
                      <span className="text-xs">Ideal Point: {voter.idealPoint.toFixed(1)}</span>
                    </div>
                    <div className="flex space-x-2">
                      {voter.preferences.map((prefId, rank) => {
                        const candidate = candidates.find(c => c.id === prefId)
                        return (
                          <div
                            key={prefId}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
                          >
                            {rank + 1}. {candidate?.name}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Voting Method Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Voting Method Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="font-medium text-sm mb-2">Plurality Voting:</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Simple: Vote for one candidate</li>
                    <li>• Can elect candidate opposed by majority</li>
                    <li>• Susceptible to vote splitting</li>
                    <li>• Strategic voting common</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-sm mb-2">Condorcet Method:</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Elects candidate who beats all others pairwise</li>
                    <li>• May not always have a winner (Condorcet paradox)</li>
                    <li>• Satisfies majority criterion</li>
                    <li>• Complex to compute</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-sm mb-2">Borda Count:</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Points based on ranking position</li>
                    <li>• Considers all preferences</li>
                    <li>• Can elect compromise candidates</li>
                    <li>• Vulnerable to irrelevant alternatives</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium text-sm mb-2">Instant Runoff:</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Eliminates candidates with fewest votes</li>
                    <li>• Ensures majority winner</li>
                    <li>• Reduces strategic voting</li>
                    <li>• Can violate monotonicity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arrow&apos;s Impossibility Theorem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Arrow&apos;s Impossibility Theorem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="font-medium">
                  No voting system can simultaneously satisfy all of these criteria:
                </div>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Unanimity:</strong> If everyone prefers A to B, A should win</li>
                  <li>• <strong>Independence:</strong> Outcome should not depend on irrelevant alternatives</li>
                  <li>• <strong>Non-dictatorship:</strong> No single voter determines all outcomes</li>
                  <li>• <strong>Transitivity:</strong> If A beats B and B beats C, then A beats C</li>
                </ul>
                
                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="font-medium mb-2">Implications:</div>
                  <div>
                    Every voting system has flaws. The choice depends on which 
                    properties are most important for the specific context.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Considerations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Strategic Voting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Tactical Voting:</strong> Voters may not vote for their true preferences 
                  to achieve better outcomes.
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="font-medium">Plurality:</div>
                    <div>Vote for &quot;lesser evil&quot; to prevent worst outcome</div>
                  </div>
                  <div>
                    <div className="font-medium">Borda Count:</div>
                    <div>Rank opponents low to help preferred candidate</div>
                  </div>
                </div>
                
                <div className="mt-3 text-muted-foreground">
                  Strategic voting can lead to outcomes that don&apos;t reflect true preferences.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}