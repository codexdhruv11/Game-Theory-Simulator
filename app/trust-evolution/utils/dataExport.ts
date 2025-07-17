"use client"

import { Tournament, EvolutionGeneration, PayoffMatrix, Strategy } from "../types"

// Match the GameConfig interface from useGameConfig.ts
interface GameConfig {
  payoffMatrix: PayoffMatrix
  noiseLevel: number
  enableNoise: boolean
  roundsPerMatch: number
  selectedStrategies: string[]
  theme: string
  animationsEnabled: boolean
}

interface ExportData {
  tournament?: Tournament
  evolution?: EvolutionGeneration[]
  gameConfig: GameConfig
  timestamp: string
  version: string
}

/**
 * Export tournament results to JSON
 */
export function exportTournamentToJson(tournament: Tournament, gameConfig: GameConfig): string {
  const exportData: ExportData = {
    tournament,
    gameConfig,
    timestamp: new Date().toISOString(),
    version: "1.0"
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export evolution results to JSON
 */
export function exportEvolutionToJson(
  generations: EvolutionGeneration[],
  gameConfig: GameConfig
): string {
  const exportData: ExportData = {
    evolution: generations,
    gameConfig,
    timestamp: new Date().toISOString(),
    version: "1.0"
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Export game configuration to JSON
 */
export function exportConfigToJson(gameConfig: GameConfig): string {
  const exportData: ExportData = {
    gameConfig,
    timestamp: new Date().toISOString(),
    version: "1.0"
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Import data from JSON
 */
export function importFromJson(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString)
    
    // Validate basic structure
    if (!data.gameConfig || !data.timestamp || !data.version) {
      throw new Error("Invalid export data format")
    }
    
    return data as ExportData
  } catch (error) {
    console.error("Error importing data:", error)
    return null
  }
}

/**
 * Export tournament results to CSV
 */
export function exportTournamentToCsv(
  tournament: Tournament,
  strategies: Strategy[]
): string {
  if (!tournament.rounds || tournament.rounds.length === 0) {
    return "No tournament data available"
  }
  
  const round = tournament.rounds[tournament.rounds.length - 1]
  const standings = round.standings
  
  // Create CSV header
  let csv = "Strategy,Total Score,Average Score,Cooperation Rate,Wins,Losses,Ties\n"
  
  // Add data rows
  standings.forEach(stat => {
    const strategy = strategies.find(s => s.id === stat.strategyId)
    const name = strategy ? strategy.name : stat.strategyId
    
    csv += `"${name}",${stat.totalScore},${stat.averageScore.toFixed(2)},`
    csv += `${(stat.cooperationRate * 100).toFixed(1)}%,`
    csv += `${stat.wins},${stat.losses},${stat.ties}\n`
  })
  
  return csv
}

/**
 * Export evolution results to CSV
 */
export function exportEvolutionToCsv(
  generations: EvolutionGeneration[],
  strategies: Strategy[]
): string {
  if (generations.length === 0) {
    return "No evolution data available"
  }
  
  // Create CSV header
  let csv = "Generation,Cooperation Rate"
  strategies.forEach(strategy => {
    csv += `,${strategy.name}`
  })
  csv += "\n"
  
  // Add data rows
  generations.forEach(gen => {
    csv += `${gen.generation},${(gen.cooperationRate * 100).toFixed(1)}%`
    
    strategies.forEach(strategy => {
      const population = gen.population[strategy.id] || 0
      csv += `,${population}`
    })
    
    csv += "\n"
  })
  
  return csv
}

/**
 * Download data as a file
 */
export function downloadFile(data: string, filename: string, type: string): void {
  // Create a blob
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  
  // Create a temporary link and trigger download
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download tournament results
 */
export function downloadTournamentResults(
  tournament: Tournament,
  strategies: Strategy[],
  format: "json" | "csv" = "json"
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `tournament-results-${timestamp}`
  
  if (format === "json") {
    const jsonData = exportTournamentToJson(tournament, {
      payoffMatrix: { cooperate: { cooperate: [0, 0], defect: [0, 0] }, defect: { cooperate: [0, 0], defect: [0, 0] } },
      noiseLevel: 0,
      enableNoise: false,
      roundsPerMatch: 0,
      selectedStrategies: [],
      theme: "default",
      animationsEnabled: true
    })
    downloadFile(jsonData, `${filename}.json`, "application/json")
  } else {
    const csvData = exportTournamentToCsv(tournament, strategies)
    downloadFile(csvData, `${filename}.csv`, "text/csv")
  }
}

/**
 * Download evolution results
 */
export function downloadEvolutionResults(
  generations: EvolutionGeneration[],
  strategies: Strategy[],
  format: "json" | "csv" = "json"
): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `evolution-results-${timestamp}`
  
  if (format === "json") {
    const jsonData = exportEvolutionToJson(generations, {
      payoffMatrix: { cooperate: { cooperate: [0, 0], defect: [0, 0] }, defect: { cooperate: [0, 0], defect: [0, 0] } },
      noiseLevel: 0,
      enableNoise: false,
      roundsPerMatch: 0,
      selectedStrategies: [],
      theme: "default",
      animationsEnabled: true
    })
    downloadFile(jsonData, `${filename}.json`, "application/json")
  } else {
    const csvData = exportEvolutionToCsv(generations, strategies)
    downloadFile(csvData, `${filename}.csv`, "text/csv")
  }
} 