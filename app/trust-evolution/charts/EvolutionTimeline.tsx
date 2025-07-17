"use client"

import { useMemo, useState } from "react"
import { Strategy, EvolutionGeneration } from "../types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceArea
} from "recharts"

interface EvolutionTimelineProps {
  generations: EvolutionGeneration[]
  strategies: Strategy[]
  height?: number | string
  showLegend?: boolean
  showBrush?: boolean
  highlightGeneration?: number
  showCooperationRate?: boolean
}

interface SignificantEvent {
  generation: number
  type: "extinction" | "emergence" | "dominance"
  strategyId: string
  strategyName: string
}

export function EvolutionTimeline({
  generations,
  strategies,
  height = 300,
  showLegend = true,
  showBrush = false,
  highlightGeneration,
  showCooperationRate = true
}: EvolutionTimelineProps) {
  // State for zoom
  const [zoomDomain, setZoomDomain] = useState<{ left: number; right: number } | null>(null)
  const [zoomStart, setZoomStart] = useState<number | null>(null)

  // Format data for chart
  const chartData = useMemo(() => {
    return generations.map(gen => {
      const data: Record<string, number | string> = { 
        generation: gen.generation,
        cooperationRate: Math.round(gen.cooperationRate * 100)
      }
      
      // Calculate percentage for each strategy
      const totalPopulation = Object.values(gen.population).reduce((sum, count) => sum + count, 0)
      
      strategies.forEach(strategy => {
        const population = gen.population[strategy.id] || 0
        data[`${strategy.name}_percent`] = Math.round((population / totalPopulation) * 100)
      })
      
      return data
    })
  }, [generations, strategies])

  // Handle zoom
  const handleMouseDown = (e: any) => {
    if (!e) return
    setZoomStart(e.activeLabel)
  }

  const handleMouseUp = (e: any) => {
    if (!e || !zoomStart) return
    
    const end = e.activeLabel
    if (zoomStart === end) {
      setZoomStart(null)
      return
    }
    
    const left = Math.min(zoomStart, end)
    const right = Math.max(zoomStart, end)
    
    setZoomDomain({ left, right })
    setZoomStart(null)
  }

  const handleBrushChange = (domain: any) => {
    if (!domain) return
    setZoomDomain({ left: domain.startIndex, right: domain.endIndex })
  }

  const resetZoom = () => {
    setZoomDomain(null)
  }

  // Find significant events (extinctions, emergences)
  const significantEvents = useMemo(() => {
    if (generations.length < 2) return []
    
    const events: SignificantEvent[] = []
    
    // Look for strategy extinctions or emergences
    for (let i = 1; i < generations.length; i++) {
      const prevGen = generations[i - 1]
      const currentGen = generations[i]
      
      strategies.forEach(strategy => {
        const prevPop = prevGen.population[strategy.id] || 0
        const currentPop = currentGen.population[strategy.id] || 0
        
        // Extinction (population drops to zero)
        if (prevPop > 0 && currentPop === 0) {
          events.push({
            generation: currentGen.generation,
            type: "extinction",
            strategyId: strategy.id,
            strategyName: strategy.name
          })
        }
        
        // Emergence (population grows from zero)
        if (prevPop === 0 && currentPop > 0) {
          events.push({
            generation: currentGen.generation,
            type: "emergence",
            strategyId: strategy.id,
            strategyName: strategy.name
          })
        }
        
        // Dominance shift (population exceeds 50%)
        const totalPrevPop = Object.values(prevGen.population).reduce((sum, count) => sum + count, 0)
        const totalCurrentPop = Object.values(currentGen.population).reduce((sum, count) => sum + count, 0)
        
        const prevPercent = prevPop / totalPrevPop
        const currentPercent = currentPop / totalCurrentPop
        
        if (prevPercent < 0.5 && currentPercent >= 0.5) {
          events.push({
            generation: currentGen.generation,
            type: "dominance",
            strategyId: strategy.id,
            strategyName: strategy.name
          })
        }
      })
    }
    
    return events
  }, [generations, strategies])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="generation"
            type="number"
            domain={zoomDomain ? [zoomDomain.left, zoomDomain.right] : ['dataMin', 'dataMax']}
            allowDecimals={false}
          />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value, name: string) => {
              if (typeof name === 'string') {
                const baseName = name.includes('_percent') ? name.split('_percent')[0] : name
                return [`${value}%`, baseName]
              }
              return [value, name]
            }}
            labelFormatter={(label) => `Generation: ${label}`}
          />
          {showLegend && <Legend />}
          
          {strategies.map((strategy) => (
            <Line
              key={strategy.id}
              type="monotone"
              dataKey={`${strategy.name}_percent`}
              name={strategy.name}
              stroke={strategy.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
            />
          ))}
          
          {showCooperationRate && (
            <Line
              type="monotone"
              dataKey="cooperationRate"
              name="Cooperation Rate"
              stroke="#000"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          
          {/* Highlight significant events */}
          {significantEvents.map((event, index) => (
            <ReferenceArea
              key={`event-${index}`}
              x1={event.generation - 0.5}
              x2={event.generation + 0.5}
              strokeOpacity={0.3}
              stroke={
                event.type === "extinction" ? "#ff0000" :
                event.type === "emergence" ? "#00ff00" :
                "#0000ff" // dominance
              }
            />
          ))}
          
          {/* Highlight current generation */}
          {highlightGeneration !== undefined && (
            <ReferenceArea
              x1={highlightGeneration - 0.5}
              x2={highlightGeneration + 0.5}
              fill="#666"
              fillOpacity={0.2}
            />
          )}
          
          {showBrush && (
            <Brush 
              dataKey="generation" 
              height={20} 
              stroke="#8884d8"
              onChange={handleBrushChange}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {zoomDomain && (
        <div className="mt-2 text-center">
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            onClick={resetZoom}
          >
            Reset Zoom
          </button>
        </div>
      )}
    </div>
  )
} 