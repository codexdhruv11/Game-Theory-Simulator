"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Strategy, Move, GameResult } from "../types"
import { PrisonersDilemmaGame, ALL_STRATEGIES } from "../engine"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"

interface CustomStrategyBuilderProps {
  onSave: (strategy: Strategy) => void
  onCancel: () => void
}

type ConditionType = "always" | "last_opponent_move" | "opponent_cooperation_rate" | "round_number" | "score_difference"
type ActionType = "cooperate" | "defect" | "random" | "copy_opponent" | "opposite_opponent"

interface StrategyRule {
  id: string
  conditionType: ConditionType
  conditionValue?: string | number
  conditionComparison?: "equal" | "not_equal" | "greater" | "less" | "greater_equal" | "less_equal"
  actionType: ActionType
  actionValue?: number
}

export function CustomStrategyBuilder({ onSave, onCancel }: CustomStrategyBuilderProps) {
  // Strategy metadata
  const [name, setName] = useState("My Custom Strategy")
  const [description, setDescription] = useState("A custom strategy")
  const [color, setColor] = useState("#3b82f6")
  const [isNice, setIsNice] = useState(true)
  const [isForgiving, setIsForgiving] = useState(true)
  
  // Strategy rules
  const [rules, setRules] = useState<StrategyRule[]>([
    {
      id: "rule_1",
      conditionType: "always",
      actionType: "cooperate"
    }
  ])
  
  // Test results
  const [testResults, setTestResults] = useState<{
    opponent: Strategy
    score: number
    cooperationRate: number
    rounds: number
  }[]>([])
  
  // Add a new rule
  const addRule = () => {
    setRules([
      ...rules,
      {
        id: `rule_${rules.length + 1}`,
        conditionType: "always",
        actionType: "cooperate"
      }
    ])
  }
  
  // Remove a rule
  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }
  
  // Update a rule
  const updateRule = (id: string, updates: Partial<StrategyRule>) => {
    setRules(
      rules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    )
  }
  
  // Move rule up in priority
  const moveRuleUp = (index: number) => {
    if (index <= 0) return
    
    const newRules = [...rules]
    const temp = newRules[index]
    newRules[index] = newRules[index - 1]
    newRules[index - 1] = temp
    
    setRules(newRules)
  }
  
  // Move rule down in priority
  const moveRuleDown = (index: number) => {
    if (index >= rules.length - 1) return
    
    const newRules = [...rules]
    const temp = newRules[index]
    newRules[index] = newRules[index + 1]
    newRules[index + 1] = temp
    
    setRules(newRules)
  }
  
  // Create strategy implementation based on rules
  const createStrategyImplementation = () => {
    // Create a function that evaluates the rules in order
    const getMove = (history: GameResult[], opponentHistory: Move[]): Move => {
      // Default to cooperate if no rules match
      let defaultAction: Move = "cooperate"
      
      // Process each rule in order
      for (const rule of rules) {
        // Check if the condition is met
        let conditionMet = false
        
        switch (rule.conditionType) {
          case "always":
            conditionMet = true
            break
            
          case "last_opponent_move":
            if (opponentHistory.length > 0) {
              const lastMove = opponentHistory[opponentHistory.length - 1]
              
              switch (rule.conditionComparison) {
                case "equal":
                  conditionMet = lastMove === rule.conditionValue
                  break
                case "not_equal":
                  conditionMet = lastMove !== rule.conditionValue
                  break
                default:
                  conditionMet = false
              }
            }
            break
            
          case "opponent_cooperation_rate":
            if (opponentHistory.length > 0) {
              const cooperationRate = opponentHistory.filter(move => move === "cooperate").length / opponentHistory.length
              const threshold = Number(rule.conditionValue) || 0
              
              switch (rule.conditionComparison) {
                case "greater":
                  conditionMet = cooperationRate > threshold
                  break
                case "less":
                  conditionMet = cooperationRate < threshold
                  break
                case "greater_equal":
                  conditionMet = cooperationRate >= threshold
                  break
                case "less_equal":
                  conditionMet = cooperationRate <= threshold
                  break
                default:
                  conditionMet = false
              }
            }
            break
            
          case "round_number":
            if (history.length > 0) {
              const roundNumber = history.length
              const threshold = Number(rule.conditionValue) || 0
              
              switch (rule.conditionComparison) {
                case "equal":
                  conditionMet = roundNumber === threshold
                  break
                case "greater":
                  conditionMet = roundNumber > threshold
                  break
                case "less":
                  conditionMet = roundNumber < threshold
                  break
                case "greater_equal":
                  conditionMet = roundNumber >= threshold
                  break
                case "less_equal":
                  conditionMet = roundNumber <= threshold
                  break
                default:
                  conditionMet = false
              }
            }
            break
            
          case "score_difference":
            if (history.length > 0) {
              const myScore = history.reduce((sum, result) => sum + result.player1Score, 0)
              const opponentScore = history.reduce((sum, result) => sum + result.player2Score, 0)
              const scoreDiff = myScore - opponentScore
              const threshold = Number(rule.conditionValue) || 0
              
              switch (rule.conditionComparison) {
                case "greater":
                  conditionMet = scoreDiff > threshold
                  break
                case "less":
                  conditionMet = scoreDiff < threshold
                  break
                case "greater_equal":
                  conditionMet = scoreDiff >= threshold
                  break
                case "less_equal":
                  conditionMet = scoreDiff <= threshold
                  break
                default:
                  conditionMet = false
              }
            }
            break
        }
        
        // If condition is met, determine the action
        if (conditionMet) {
          switch (rule.actionType) {
            case "cooperate":
              return "cooperate"
              
            case "defect":
              return "defect"
              
            case "random":
              return Math.random() < (rule.actionValue || 0.5) ? "cooperate" : "defect"
              
            case "copy_opponent":
              if (opponentHistory.length > 0) {
                return opponentHistory[opponentHistory.length - 1]
              }
              return defaultAction
              
            case "opposite_opponent":
              if (opponentHistory.length > 0) {
                return opponentHistory[opponentHistory.length - 1] === "cooperate" ? "defect" : "cooperate"
              }
              return defaultAction
          }
        }
      }
      
      // If no rules matched, return default action
      return defaultAction
    }
    
    // Create the strategy object
    return {
      id: `custom_${Date.now()}`,
      name,
      description,
      color,
      isNice,
      isForgiving,
      getMove
    }
  }
  
  // Test the strategy against common opponents
  const testStrategy = () => {
    const customStrategy = createStrategyImplementation()
    const game = new PrisonersDilemmaGame(DEFAULT_PAYOFF_MATRIX)
    const testRounds = 50
    
    // Select a few strategies to test against
    const opponents = [
      ALL_STRATEGIES.find(s => s.id === "always_cooperate")!,
      ALL_STRATEGIES.find(s => s.id === "always_defect")!,
      ALL_STRATEGIES.find(s => s.id === "tit_for_tat")!,
      ALL_STRATEGIES.find(s => s.id === "grudger")!
    ]
    
    const results = opponents.map(opponent => {
      const matchResults = game.playMatch(customStrategy, opponent, testRounds)
      const [myScore] = game.getTotalScores()
      const cooperations = matchResults.filter(r => r.player1Move === "cooperate").length
      
      return {
        opponent,
        score: myScore,
        cooperationRate: cooperations / testRounds,
        rounds: testRounds
      }
    })
    
    setTestResults(results)
  }
  
  // Save the strategy
  const handleSave = () => {
    const strategy = createStrategyImplementation()
    onSave(strategy)
  }
  
  // Render condition input based on condition type
  const renderConditionInput = (rule: StrategyRule) => {
    switch (rule.conditionType) {
      case "always":
        return null
        
      case "last_opponent_move":
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={rule.conditionComparison || "equal"}
              onValueChange={(value) => updateRule(rule.id, { conditionComparison: value as any })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">is</SelectItem>
                <SelectItem value="not_equal">is not</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={rule.conditionValue as string || "cooperate"}
              onValueChange={(value) => updateRule(rule.id, { conditionValue: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cooperate">Cooperate</SelectItem>
                <SelectItem value="defect">Defect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
        
      case "opponent_cooperation_rate":
      case "round_number":
      case "score_difference":
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={rule.conditionComparison || "greater"}
              onValueChange={(value) => updateRule(rule.id, { conditionComparison: value as any })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greater">&gt;</SelectItem>
                <SelectItem value="less">&lt;</SelectItem>
                <SelectItem value="equal">=</SelectItem>
                <SelectItem value="greater_equal">≥</SelectItem>
                <SelectItem value="less_equal">≤</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              value={rule.conditionValue as number || 0}
              onChange={(e) => updateRule(rule.id, { conditionValue: parseFloat(e.target.value) })}
              className="w-24"
            />
          </div>
        )
        
      default:
        return null
    }
  }
  
  // Render action input based on action type
  const renderActionInput = (rule: StrategyRule) => {
    switch (rule.actionType) {
      case "random":
        return (
          <div className="flex items-center space-x-2">
            <span>Cooperate probability:</span>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={rule.actionValue || 0.5}
              onChange={(e) => updateRule(rule.id, { actionValue: parseFloat(e.target.value) })}
              className="w-20"
            />
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Custom Strategy Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Metadata */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Strategy Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-name">Name</Label>
              <Input
                id="strategy-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Strategy Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="strategy-color">Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="strategy-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#RRGGBB"
                />
                <div 
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="strategy-description">Description</Label>
              <Input
                id="strategy-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your strategy"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-nice"
                checked={isNice}
                onCheckedChange={setIsNice}
              />
              <Label htmlFor="is-nice">Is Nice (never defects first)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is-forgiving"
                checked={isForgiving}
                onCheckedChange={setIsForgiving}
              />
              <Label htmlFor="is-forgiving">Is Forgiving (can return to cooperation)</Label>
            </div>
          </div>
        </div>
        
        {/* Rules Builder */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Decision Rules</h3>
          <p className="text-sm text-muted-foreground">
            Rules are evaluated in order. The first rule with a matching condition determines the action.
          </p>
          
          {rules.map((rule, index) => (
            <Card key={rule.id} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => moveRuleUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => moveRuleDown(index)}
                    disabled={index === rules.length - 1}
                  >
                    ↓
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeRule(rule.id)}
                    disabled={rules.length === 1}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>If</Label>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={rule.conditionType}
                        onValueChange={(value) => updateRule(rule.id, { 
                          conditionType: value as ConditionType,
                          // Reset condition value and comparison when changing type
                          conditionValue: undefined,
                          conditionComparison: undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="last_opponent_move">Last opponent move</SelectItem>
                          <SelectItem value="opponent_cooperation_rate">Opponent cooperation rate</SelectItem>
                          <SelectItem value="round_number">Round number</SelectItem>
                          <SelectItem value="score_difference">Score difference</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {renderConditionInput(rule)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Then</Label>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={rule.actionType}
                        onValueChange={(value) => updateRule(rule.id, { 
                          actionType: value as ActionType,
                          // Reset action value when changing type
                          actionValue: undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cooperate">Cooperate</SelectItem>
                          <SelectItem value="defect">Defect</SelectItem>
                          <SelectItem value="random">Random</SelectItem>
                          <SelectItem value="copy_opponent">Copy opponent's last move</SelectItem>
                          <SelectItem value="opposite_opponent">Opposite of opponent's last move</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {renderActionInput(rule)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button variant="outline" onClick={addRule} className="w-full">
            Add Rule
          </Button>
        </div>
        
        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <h4 className="font-semibold">vs. {result.opponent.name}</h4>
                      <div className="text-2xl font-bold">{result.score} points</div>
                      <div className="text-sm text-muted-foreground">
                        Cooperation rate: {(result.cooperationRate * 100).toFixed(0)}%
                      </div>
                      <Badge variant={result.score > result.rounds * 2 ? "default" : "secondary"}>
                        {result.score > result.rounds * 2 ? "Win" : "Loss"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={testStrategy}>
              Test Strategy
            </Button>
            <Button onClick={handleSave}>
              Save Strategy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 