"use client"

import { useState, useCallback, useEffect } from "react"
import { PayoffMatrix, Strategy } from "../types"
import { DEFAULT_PAYOFF_MATRIX, ALL_STRATEGIES } from "../engine"

interface GameConfig {
  payoffMatrix: PayoffMatrix
  noiseLevel: number
  enableNoise: boolean
  roundsPerMatch: number
  selectedStrategies: string[]
  theme: string
  animationsEnabled: boolean
}

const defaultConfig: GameConfig = {
  payoffMatrix: DEFAULT_PAYOFF_MATRIX,
  noiseLevel: 0,
  enableNoise: false,
  roundsPerMatch: 200,
  selectedStrategies: ALL_STRATEGIES.slice(0, 6).map(s => s.id),
  theme: "default",
  animationsEnabled: true
}

interface UseGameConfigOptions {
  storageKey?: string
  initialConfig?: Partial<GameConfig>
}

export function useGameConfig(options: UseGameConfigOptions = {}) {
  const {
    storageKey = "trust-evolution-config",
    initialConfig = {}
  } = options

  // Merge default config with initial config
  const mergedConfig = { ...defaultConfig, ...initialConfig }
  
  // State
  const [config, setConfig] = useState<GameConfig>(mergedConfig)
  const [isLoaded, setIsLoaded] = useState(false)
  const [presets, setPresets] = useState<{ name: string; config: GameConfig }[]>([])

  // Load config from localStorage on mount
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem(storageKey)
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig))
        }
        
        const savedPresets = localStorage.getItem(`${storageKey}-presets`)
        if (savedPresets) {
          setPresets(JSON.parse(savedPresets))
        }
      } catch (error) {
        console.error("Error loading game configuration:", error)
      } finally {
        setIsLoaded(true)
      }
    }
    
    loadConfig()
  }, [storageKey])

  // Save config to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
    } catch (error) {
      console.error("Error saving game configuration:", error)
    }
  }, [config, storageKey, isLoaded])

  // Save presets to localStorage when they change
  useEffect(() => {
    if (!isLoaded) return
    
    try {
      localStorage.setItem(`${storageKey}-presets`, JSON.stringify(presets))
    } catch (error) {
      console.error("Error saving game presets:", error)
    }
  }, [presets, storageKey, isLoaded])

  // Update config
  const updateConfig = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  // Update payoff matrix
  const updatePayoffMatrix = useCallback((newMatrix: PayoffMatrix) => {
    setConfig(prev => ({ ...prev, payoffMatrix: newMatrix }))
  }, [])

  // Update noise settings
  const updateNoiseSettings = useCallback((noiseLevel: number, enableNoise: boolean) => {
    setConfig(prev => ({ ...prev, noiseLevel, enableNoise }))
  }, [])

  // Update rounds per match
  const updateRoundsPerMatch = useCallback((rounds: number) => {
    setConfig(prev => ({ ...prev, roundsPerMatch: rounds }))
  }, [])

  // Update selected strategies
  const updateSelectedStrategies = useCallback((strategyIds: string[]) => {
    setConfig(prev => ({ ...prev, selectedStrategies: strategyIds }))
  }, [])

  // Toggle strategy selection
  const toggleStrategy = useCallback((strategyId: string) => {
    setConfig(prev => {
      const isSelected = prev.selectedStrategies.includes(strategyId)
      if (isSelected) {
        return {
          ...prev,
          selectedStrategies: prev.selectedStrategies.filter(id => id !== strategyId)
        }
      } else {
        return {
          ...prev,
          selectedStrategies: [...prev.selectedStrategies, strategyId]
        }
      }
    })
  }, [])

  // Reset config to defaults
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig)
  }, [])

  // Save current config as preset
  const savePreset = useCallback((name: string) => {
    setPresets(prev => [...prev, { name, config: { ...config } }])
  }, [config])

  // Load preset
  const loadPreset = useCallback((presetIndex: number) => {
    if (presetIndex >= 0 && presetIndex < presets.length) {
      setConfig(presets[presetIndex].config)
      return true
    }
    return false
  }, [presets])

  // Delete preset
  const deletePreset = useCallback((presetIndex: number) => {
    setPresets(prev => prev.filter((_, index) => index !== presetIndex))
  }, [])

  // Export config to JSON
  const exportConfig = useCallback(() => {
    return JSON.stringify({
      config,
      presets,
      version: "1.0",
      timestamp: new Date().toISOString()
    })
  }, [config, presets])

  // Import config from JSON
  const importConfig = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString)
      if (data.config) {
        setConfig(data.config)
      }
      if (data.presets) {
        setPresets(data.presets)
      }
      return true
    } catch (error) {
      console.error("Error importing game configuration:", error)
      return false
    }
  }, [])

  // Get selected strategies as Strategy objects
  const getSelectedStrategies = useCallback(() => {
    return ALL_STRATEGIES.filter(s => config.selectedStrategies.includes(s.id))
  }, [config.selectedStrategies])

  // Validate config
  const validateConfig = useCallback(() => {
    const errors = []
    
    // Check payoff matrix follows PD rules (T > R > P > S)
    const { payoffMatrix } = config
    const T = payoffMatrix.defect.cooperate[0]
    const R = payoffMatrix.cooperate.cooperate[0]
    const P = payoffMatrix.defect.defect[0]
    const S = payoffMatrix.cooperate.defect[0]
    
    if (!(T > R && R > P && P > S)) {
      errors.push("Payoff matrix does not follow Prisoner's Dilemma rules (T > R > P > S)")
    }
    
    // Check at least 2 strategies are selected
    if (config.selectedStrategies.length < 2) {
      errors.push("At least 2 strategies must be selected")
    }
    
    // Check rounds per match is positive
    if (config.roundsPerMatch <= 0) {
      errors.push("Rounds per match must be positive")
    }
    
    // Check noise level is between 0 and 1
    if (config.noiseLevel < 0 || config.noiseLevel > 1) {
      errors.push("Noise level must be between 0 and 1")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [config])

  return {
    config,
    isLoaded,
    presets,
    updateConfig,
    updatePayoffMatrix,
    updateNoiseSettings,
    updateRoundsPerMatch,
    updateSelectedStrategies,
    toggleStrategy,
    resetConfig,
    savePreset,
    loadPreset,
    deletePreset,
    exportConfig,
    importConfig,
    getSelectedStrategies,
    validateConfig
  }
} 