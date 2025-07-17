"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  EvolutionEngine, 
  TournamentEngine, 
  PrisonersDilemmaGame, 
  ALL_STRATEGIES 
} from "../engine"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"
import { 
  Strategy, 
  PayoffMatrix, 
  EvolutionGeneration, 
  EvolutionConfig,
  Tournament 
} from "../types"
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
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts"

interface SandboxProps {
  onComplete: () => void
}

export function Sandbox({ onComplete }: SandboxProps) {
  // Default configurations
  const defaultPayoffMatrix: PayoffMatrix = {
    cooperate: {
      cooperate: [3, 3],
      defect: [0, 5]
    },
    defect: {
      cooperate: [5, 0],
      defect: [1, 1]
    }
  }

  const defaultEvolutionConfig: EvolutionConfig = {
    populationSize: 100,
    mutationRate: 0.01,
    selectionPressure: 1.5,
    roundsPerGeneration: 10,
    maxGenerations: 20
  }

  // State
  const [activeTab, setActiveTab] = useState("parameters")
  const [payoffMatrix, setPayoffMatrix] = useState<PayoffMatrix>(defaultPayoffMatrix)
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>(defaultEvolutionConfig)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [enableNoise, setEnableNoise] = useState(false)
  const [roundsPerMatch, setRoundsPerMatch] = useState(200)
  const [availableStrategies, setAvailableStrategies] = useState<Strategy[]>(ALL_STRATEGIES)
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(
    ALL_STRATEGIES.slice(0, 6) // Start with 6 strategies
  )
  
  // Simulation results
  const [evolutionResults, setEvolutionResults] = useState<EvolutionGeneration[]>([])
  const [tournamentResults, setTournamentResults] = useState<Tournament | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [simulationType, setSimulationType] = useState<"evolution" | "tournament">("evolution")
  const [presetName, setPresetName] = useState("")
  const [presets, setPresets] = useState<{
    name: string
    payoffMatrix: PayoffMatrix
    evolutionConfig: EvolutionConfig
    noiseLevel: number
    enableNoise: boolean
    roundsPerMatch: number
    selectedStrategies: string[]
  }[]>([
    {
      name: "Standard Prisoner's Dilemma",
      payoffMatrix: defaultPayoffMatrix,
      evolutionConfig: defaultEvolutionConfig,
      noiseLevel: 0,
      enableNoise: false,
      roundsPerMatch: 200,
      selectedStrategies: ALL_STRATEGIES.slice(0, 6).map(s => s.id)
    },
    {
      name: "High Noise Environment",
      payoffMatrix: defaultPayoffMatrix,
      evolutionConfig: defaultEvolutionConfig,
      noiseLevel: 0.2,
      enableNoise: true,
      roundsPerMatch: 200,
      selectedStrategies: ALL_STRATEGIES.filter(s => 
        s.id === "generous_tit_for_tat" || 
        s.id === "tit_for_tat" || 
        s.id === "pavlov" || 
        s.id === "grudger"
      ).map(s => s.id)
    },
    {
      name: "High Cooperation Rewards",
      payoffMatrix: {
        cooperate: {
          cooperate: [5, 5],
          defect: [0, 6]
        },
        defect: {
          cooperate: [6, 0],
          defect: [1, 1]
        }
      },
      evolutionConfig: defaultEvolutionConfig,
      noiseLevel: 0,
      enableNoise: false,
      roundsPerMatch: 200,
      selectedStrategies: ALL_STRATEGIES.slice(0, 6).map(s => s.id)
    }
  ])

  // Run evolution simulation
  const runEvolution = () => {
    setIsRunning(true)
    setSimulationType("evolution")
    
    setTimeout(() => {
      const evolutionEngine = new EvolutionEngine(
        selectedStrategies,
        evolutionConfig,
        payoffMatrix
      )
      
      const results = evolutionEngine.runEvolution()
      setEvolutionResults(results)
      setIsRunning(false)
      setActiveTab("results")
    }, 100)
  }

  // Run tournament
  const runTournament = () => {
    setIsRunning(true)
    setSimulationType("tournament")
    
    setTimeout(() => {
      const tournamentEngine = new TournamentEngine(
        payoffMatrix,
        roundsPerMatch,
        enableNoise ? noiseLevel : 0
      )
      
      const tournament = tournamentEngine.runTournament(selectedStrategies)
      setTournamentResults(tournament)
      setIsRunning(false)
      setActiveTab("results")
    }, 100)
  }

  // Save current configuration as preset
  const savePreset = () => {
    if (!presetName) return
    
    const newPreset = {
      name: presetName,
      payoffMatrix,
      evolutionConfig,
      noiseLevel,
      enableNoise,
      roundsPerMatch,
      selectedStrategies: selectedStrategies.map(s => s.id)
    }
    
    setPresets([...presets, newPreset])
    setPresetName("")
  }

  // Load preset
  const loadPreset = (preset: typeof presets[0]) => {
    setPayoffMatrix(preset.payoffMatrix)
    setEvolutionConfig(preset.evolutionConfig)
    setNoiseLevel(preset.noiseLevel)
    setEnableNoise(preset.enableNoise)
    setRoundsPerMatch(preset.roundsPerMatch)
    setSelectedStrategies(
      ALL_STRATEGIES.filter(s => preset.selectedStrategies.includes(s.id))
    )
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setPayoffMatrix(defaultPayoffMatrix)
    setEvolutionConfig(defaultEvolutionConfig)
    setNoiseLevel(0)
    setEnableNoise(false)
    setRoundsPerMatch(200)
    setSelectedStrategies(ALL_STRATEGIES.slice(0, 6))
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

  // Toggle strategy selection
  const toggleStrategy = (strategy: Strategy) => {
    if (selectedStrategies.some(s => s.id === strategy.id)) {
      setSelectedStrategies(selectedStrategies.filter(s => s.id !== strategy.id))
    } else {
      setSelectedStrategies([...selectedStrategies, strategy])
    }
  }

  // Update payoff value
  const updatePayoff = (
    player1Move: "cooperate" | "defect",
    player2Move: "cooperate" | "defect",
    playerIndex: 0 | 1,
    value: number
  ) => {
    const newMatrix = { ...payoffMatrix }
    newMatrix[player1Move][player2Move][playerIndex] = value
    setPayoffMatrix(newMatrix)
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sandbox: Experiment Freely</CardTitle>
        <p className="text-muted-foreground">
          Customize all game parameters and run your own experiments
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payoff Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div></div>
                  <div className="text-center font-semibold">Other Cooperates</div>
                  <div className="text-center font-semibold">Other Defects</div>
                  
                  <div className="font-semibold">You Cooperate</div>
                  <div className="grid grid-cols-2 gap-2 border p-2 rounded">
                    <div>
                      <Label>You get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.cooperate.cooperate[0]} 
                        onChange={(e) => updatePayoff("cooperate", "cooperate", 0, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>They get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.cooperate.cooperate[1]} 
                        onChange={(e) => updatePayoff("cooperate", "cooperate", 1, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border p-2 rounded">
                    <div>
                      <Label>You get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.cooperate.defect[0]} 
                        onChange={(e) => updatePayoff("cooperate", "defect", 0, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>They get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.cooperate.defect[1]} 
                        onChange={(e) => updatePayoff("cooperate", "defect", 1, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="font-semibold">You Defect</div>
                  <div className="grid grid-cols-2 gap-2 border p-2 rounded">
                    <div>
                      <Label>You get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.defect.cooperate[0]} 
                        onChange={(e) => updatePayoff("defect", "cooperate", 0, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>They get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.defect.cooperate[1]} 
                        onChange={(e) => updatePayoff("defect", "cooperate", 1, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border p-2 rounded">
                    <div>
                      <Label>You get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.defect.defect[0]} 
                        onChange={(e) => updatePayoff("defect", "defect", 0, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>They get:</Label>
                      <Input 
                        type="number" 
                        value={payoffMatrix.defect.defect[1]} 
                        onChange={(e) => updatePayoff("defect", "defect", 1, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolution Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Population Size: {evolutionConfig.populationSize}</span>
                  </div>
                  <Slider 
                    value={[evolutionConfig.populationSize]} 
                    min={20} 
                    max={200} 
                    step={10}
                    onValueChange={(value) => setEvolutionConfig({...evolutionConfig, populationSize: value[0]})}
                    className="my-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Mutation Rate: {evolutionConfig.mutationRate}</span>
                  </div>
                  <Slider 
                    value={[evolutionConfig.mutationRate * 100]} 
                    min={0} 
                    max={5} 
                    step={0.1}
                    onValueChange={(value) => setEvolutionConfig({...evolutionConfig, mutationRate: value[0] / 100})}
                    className="my-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Selection Pressure: {evolutionConfig.selectionPressure}</span>
                  </div>
                  <Slider 
                    value={[evolutionConfig.selectionPressure * 10]} 
                    min={10} 
                    max={30} 
                    step={1}
                    onValueChange={(value) => setEvolutionConfig({...evolutionConfig, selectionPressure: value[0] / 10})}
                    className="my-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Generations: {evolutionConfig.maxGenerations}</span>
                  </div>
                  <Slider 
                    value={[evolutionConfig.maxGenerations]} 
                    min={10} 
                    max={50} 
                    step={5}
                    onValueChange={(value) => setEvolutionConfig({...evolutionConfig, maxGenerations: value[0]})}
                    className="my-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Rounds Per Match: {roundsPerMatch}</span>
                  </div>
                  <Slider 
                    value={[roundsPerMatch]} 
                    min={10} 
                    max={500} 
                    step={10}
                    onValueChange={(value) => setRoundsPerMatch(value[0])}
                    className="my-2"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enable-noise" 
                    checked={enableNoise}
                    onCheckedChange={setEnableNoise}
                  />
                  <Label htmlFor="enable-noise">Enable Noise</Label>
                </div>
                
                {enableNoise && (
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
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableStrategies.map((strategy) => (
                    <Button
                      key={strategy.id}
                      variant={selectedStrategies.some(s => s.id === strategy.id) ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col items-center justify-center"
                      style={{ 
                        borderColor: strategy.color,
                        backgroundColor: selectedStrategies.some(s => s.id === strategy.id) ? strategy.color : undefined,
                        color: selectedStrategies.some(s => s.id === strategy.id) ? "white" : undefined
                      }}
                      onClick={() => toggleStrategy(strategy)}
                    >
                      <span className="font-bold">{strategy.name}</span>
                      <span className="text-xs mt-1">{strategy.description}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  Selected: {selectedStrategies.length} strategies
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <div className="space-x-2">
                <Button onClick={runTournament} disabled={isRunning || selectedStrategies.length < 2}>
                  Run Tournament
                </Button>
                <Button onClick={runEvolution} disabled={isRunning || selectedStrategies.length < 2}>
                  Run Evolution
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((preset, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{preset.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-2">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {preset.selectedStrategies.length} Strategies
                        </Badge>
                        <Badge variant="outline">
                          {preset.enableNoise ? `${Math.round(preset.noiseLevel * 100)}% Noise` : "No Noise"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {preset.roundsPerMatch} rounds per match, 
                        {preset.evolutionConfig.populationSize} population size
                      </p>
                    </div>
                  </CardContent>
                  <div className="bg-muted p-2 flex justify-end">
                    <Button size="sm" onClick={() => loadPreset(preset)}>
                      Load Preset
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Save Current Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Preset name" 
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <Button onClick={savePreset} disabled={!presetName}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            {isRunning ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Running simulation...</p>
              </div>
            ) : simulationType === "evolution" && evolutionResults.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Evolution Results</h3>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={formatPopulationData(evolutionResults)}
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
                
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Analysis</h3>
                      <p>
                        After {evolutionResults.length} generations, 
                        {evolutionResults[evolutionResults.length - 1]?.cooperationRate > 0.5 
                          ? " cooperation emerged as the dominant strategy." 
                          : " defection dominated the population."}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        The final cooperation rate was {Math.round(evolutionResults[evolutionResults.length - 1]?.cooperationRate * 100)}%.
                        {evolutionResults[evolutionResults.length - 1]?.cooperationRate > 0.7
                          ? " This high cooperation rate suggests your parameters created an environment where trust could flourish."
                          : evolutionResults[evolutionResults.length - 1]?.cooperationRate < 0.3
                            ? " This low cooperation rate suggests your parameters created an environment where trust broke down."
                            : " This mixed cooperation rate suggests a complex dynamic between cooperative and defecting strategies."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : simulationType === "tournament" && tournamentResults ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Tournament Results</h3>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tournamentResults.rounds[0].standings.map(stat => ({
                        name: selectedStrategies.find(s => s.id === stat.strategyId)?.name || stat.strategyId,
                        score: stat.totalScore,
                        color: selectedStrategies.find(s => s.id === stat.strategyId)?.color
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" name="Total Score">
                        {tournamentResults.rounds[0].standings.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={tournamentResults.rounds[0].standings[index].strategyId === tournamentResults.winner?.id
                              ? selectedStrategies.find(s => s.id === tournamentResults.winner?.id)?.color || "#000"
                              : selectedStrategies.find(s => s.id === tournamentResults.rounds[0].standings[index].strategyId)?.color || "#000"
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {tournamentResults.winner && (
                  <Card className="border-2" style={{ borderColor: selectedStrategies.find(s => s.id === tournamentResults.winner?.id)?.color }}>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">Tournament Winner</h3>
                        <div className="text-3xl font-bold" style={{ color: selectedStrategies.find(s => s.id === tournamentResults.winner?.id)?.color }}>
                          {tournamentResults.winner.name}
                        </div>
                        <p className="text-muted-foreground">{tournamentResults.winner.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p>No simulation results yet. Run a simulation to see results here.</p>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("parameters")}>
                Back to Parameters
              </Button>
              <Button onClick={onComplete}>Continue to Conclusion</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 