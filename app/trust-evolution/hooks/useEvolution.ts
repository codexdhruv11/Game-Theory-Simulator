"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { EvolutionEngine } from "../engine/evolution"
import { Strategy, EvolutionGeneration, EvolutionConfig, Population } from "../types"
import { DEFAULT_PAYOFF_MATRIX } from "../engine"

interface UseEvolutionOptions {
  initialConfig?: Partial<EvolutionConfig>
  autoStart?: boolean
}

const defaultConfig: EvolutionConfig = {
  populationSize: 100,
  mutationRate: 0.01,
  selectionPressure: 1.5,
  roundsPerGeneration: 10,
  maxGenerations: 20
}

export function useEvolution(
  strategies: Strategy[],
  options: UseEvolutionOptions = {}
) {
  const {
    initialConfig = {},
    autoStart = false
  } = options

  // Merge default config with initial config
  const mergedConfig = { ...defaultConfig, ...initialConfig }

  // Evolution state
  const [config, setConfig] = useState<EvolutionConfig>(mergedConfig)
  const [generations, setGenerations] = useState<EvolutionGeneration[]>([])
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(500) // ms per generation
  
  // References
  const evolutionEngineRef = useRef<EvolutionEngine | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize or update evolution engine when configuration or strategies change
  useEffect(() => {
    evolutionEngineRef.current = new EvolutionEngine(
      strategies,
      config,
      DEFAULT_PAYOFF_MATRIX
    )
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [strategies, config])

  // Auto-start evolution if specified
  useEffect(() => {
    if (autoStart && strategies.length > 1 && generations.length === 0) {
      runEvolution()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, strategies.length])

  // Run evolution simulation
  const runEvolution = useCallback((initialPopulation?: Population) => {
    if (!evolutionEngineRef.current) {
      setError("Evolution engine not initialized")
      return
    }
    
    if (strategies.length < 2) {
      setError("Need at least 2 strategies for evolution")
      return
    }
    
    setIsRunning(true)
    setIsPaused(false)
    setError(null)
    
    try {
      // Use setTimeout to allow UI to update before running the simulation
      setTimeout(() => {
        const results = evolutionEngineRef.current!.runEvolution(initialPopulation)
        setGenerations(results)
        setCurrentGeneration(0)
        startAnimation()
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error running evolution")
      setIsRunning(false)
    }
  }, [strategies])

  // Animation control
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    let lastTime = 0
    const animate = (time: number) => {
      if (!isPaused && time - lastTime > autoPlaySpeed) {
        lastTime = time
        setCurrentGeneration(prev => {
          if (prev < generations.length - 1) {
            return prev + 1
          } else {
            return prev
          }
        })
      }
      
      if (currentGeneration < generations.length - 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [isPaused, autoPlaySpeed, generations.length, currentGeneration])

  // Pause/resume animation
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  // Step forward one generation
  const stepForward = useCallback(() => {
    if (currentGeneration < generations.length - 1) {
      setCurrentGeneration(prev => prev + 1)
    }
  }, [currentGeneration, generations.length])

  // Step backward one generation
  const stepBackward = useCallback(() => {
    if (currentGeneration > 0) {
      setCurrentGeneration(prev => prev - 1)
    }
  }, [currentGeneration])

  // Reset simulation
  const resetEvolution = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsRunning(false)
    setIsPaused(false)
    setGenerations([])
    setCurrentGeneration(0)
    setError(null)
  }, [])

  // Update evolution configuration
  const updateConfig = useCallback((newConfig: Partial<EvolutionConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  // Update animation speed
  const updateAutoPlaySpeed = useCallback((speed: number) => {
    setAutoPlaySpeed(speed)
  }, [])

  // Get current generation data
  const getCurrentGenerationData = useCallback(() => {
    return generations[currentGeneration] || null
  }, [generations, currentGeneration])

  // Get dominant strategy in current generation
  const getDominantStrategy = useCallback(() => {
    const currentGen = getCurrentGenerationData()
    if (!currentGen) return null
    
    let maxCount = 0
    let dominantId = ""
    
    Object.entries(currentGen.population).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantId = id
      }
    })
    
    return strategies.find(s => s.id === dominantId) || null
  }, [getCurrentGenerationData, strategies])

  // Calculate population diversity
  const getPopulationDiversity = useCallback(() => {
    const currentGen = getCurrentGenerationData()
    if (!currentGen) return 0
    
    // Count number of strategies with significant population (>5%)
    const threshold = config.populationSize * 0.05
    let significantStrategies = 0
    
    Object.values(currentGen.population).forEach(count => {
      if (count >= threshold) {
        significantStrategies++
      }
    })
    
    return significantStrategies / strategies.length
  }, [getCurrentGenerationData, config.populationSize, strategies.length])

  return {
    config,
    generations,
    currentGeneration,
    isRunning,
    isPaused,
    error,
    autoPlaySpeed,
    runEvolution,
    togglePause,
    stepForward,
    stepBackward,
    resetEvolution,
    updateConfig,
    updateAutoPlaySpeed,
    getCurrentGenerationData,
    getDominantStrategy,
    getPopulationDiversity
  }
} 