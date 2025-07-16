"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  createRandomNetwork,
  updateNetworkStrategies,
  calculatePayoffs,
  type Network,
  type NetworkNode,
  type NetworkEdge
} from "@/lib/game-theory/network-games"
type NetworkEdge = any;

export function NetworkGame() {
  const [network, setNetwork] = useState<Network | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [networkSize, setNetworkSize] = useState([8])
  const [cooperationBenefit, setCooperationBenefit] = useState([3])
  const svgRef = useRef<SVGSVGElement>(null)

  const initializeNetwork = useCallback(() => {
    const newNetwork = createRandomNetwork(networkSize[0])
    newNetwork.cooperationBenefit = cooperationBenefit[0]
    const networkWithPayoffs = calculatePayoffs(newNetwork)
    setNetwork(networkWithPayoffs)
    setGeneration(0)
  }, [networkSize, cooperationBenefit])

  const evolveNetwork = useCallback(() => {
    if (!network) return
    
    const updatedNetwork = updateNetworkStrategies(network)
    const networkWithPayoffs = calculatePayoffs(updatedNetwork)
    setNetwork(networkWithPayoffs)
    setGeneration(prev => prev + 1)
  }, [network])

  useEffect(() => {
    initializeNetwork()
  }, [initializeNetwork])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && network) {
      interval = setInterval(evolveNetwork, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, network, evolveNetwork])

  const stepEvolution = () => {
    evolveNetwork()
  }

  const resetNetwork = () => {
    setIsRunning(false)
    initializeNetwork()
  }

  const cooperationRate = network ? 
    network.nodes.filter(n => n.strategy === 'cooperate').length / network.nodes.length : 0

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Network Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium">Network Size: {networkSize[0]}</label>
            <Slider
              value={networkSize}
              onValueChange={setNetworkSize}
              max={12}
              min={4}
              step={1}
              className="mt-2"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium">Cooperation Benefit: {cooperationBenefit[0]}</label>
            <Slider
              value={cooperationBenefit}
              onValueChange={(value) => {
                setCooperationBenefit(value)
                if (network) {
                  const updatedNetwork = { ...network, cooperationBenefit: value[0] }
                  setNetwork(calculatePayoffs(updatedNetwork))
                }
              }}
              max={5}
              min={1}
              step={0.5}
              className="mt-2"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? "Stop" : "Start"}
            </Button>
            <Button size="sm" onClick={stepEvolution} disabled={isRunning}>
              Step
            </Button>
            <Button size="sm" variant="outline" onClick={resetNetwork}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Network Visualization - Generation {generation}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <svg ref={svgRef} width="300" height="300" className="border rounded">
              {network && (
                <>
                  {/* Edges */}
                  {network.edges.map((edge, index) => {
                    const sourceNode = network.nodes.find(n => n.id === edge.source)
                    const targetNode = network.nodes.find(n => n.id === edge.target)
                    
                    if (!sourceNode || !targetNode) return null
                    
                    return (
                      <motion.line
                        key={`edge-${index}`}
                        x1={sourceNode.position.x}
                        y1={sourceNode.position.y}
                        x2={targetNode.position.x}
                        y2={targetNode.position.y}
                        stroke="currentColor"
                        strokeWidth="1"
                        opacity="0.3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    )
                  })}
                  
                  {/* Nodes */}
                  {network.nodes.map((node, index) => (
                    <motion.g key={node.id}>
                      <motion.circle
                        cx={node.position.x}
                        cy={node.position.y}
                        r="15"
                        fill={node.strategy === 'cooperate' ? '#3b82f6' : '#ef4444'}
                        stroke="currentColor"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.text
                        x={node.position.x}
                        y={node.position.y + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="bold"
                      >
                        {node.payoff.toFixed(0)}
                      </motion.text>
                    </motion.g>
                  ))}
                </>
              )}
            </svg>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Cooperators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Defectors</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Cooperation Rate:</span>
              <span className="font-mono">{(cooperationRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Average Payoff:</span>
              <span className="font-mono">
                {network ? (network.nodes.reduce((sum, n) => sum + n.payoff, 0) / network.nodes.length).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Network Density:</span>
                              <span className="font-mono">
                {network ? (network.edges.length / (network.nodes.length * (network.nodes.length - 1) / 2) * 100).toFixed(1) + '%' : '0%'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}