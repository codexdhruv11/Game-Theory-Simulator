"use client"

import { useMemo } from "react"
import { Strategy, EvolutionGeneration } from "../types"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

interface PopulationChartProps {
  generations: EvolutionGeneration[]
  strategies: Strategy[]
  currentGeneration?: number
  height?: number | string
  showLegend?: boolean
  stackOffset?: "none" | "expand" | "wiggle" | "silhouette"
  showPercentage?: boolean
}

export function PopulationChart({
  generations,
  strategies,
  currentGeneration,
  height = 300,
  showLegend = true,
  stackOffset = "none",
  showPercentage = false
}: PopulationChartProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    return generations.map(gen => {
      const data: any = { generation: gen.generation }
      
      // Add population for each strategy
      strategies.forEach(strategy => {
        const population = gen.population[strategy.id] || 0
        data[strategy.name] = population
      })
      
      return data
    })
  }, [generations, strategies])

  // Calculate total population for percentage calculation
  const totalPopulation = useMemo(() => {
    if (generations.length === 0) return 0
    
    const lastGeneration = generations[generations.length - 1]
    return Object.values(lastGeneration.population).reduce((sum, count) => sum + count, 0)
  }, [generations])

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    if (showPercentage) {
      return [`${(value / totalPopulation * 100).toFixed(1)}%`, name]
    }
    return [value, name]
  }

  // Highlight current generation
  const renderCursor = currentGeneration !== undefined && {
    stroke: "#666",
    strokeWidth: 2,
    strokeDasharray: "5 5",
    xAxisId: 0
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          stackOffset={stackOffset}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="generation"
            type="number"
            domain={['dataMin', 'dataMax']}
            allowDecimals={false}
          />
          <YAxis 
            tickFormatter={showPercentage ? 
              (value) => `${(value / totalPopulation * 100).toFixed(0)}%` : 
              undefined
            }
          />
          <Tooltip 
            formatter={formatTooltip}
            labelFormatter={(label) => `Generation: ${label}`}
          />
          {showLegend && <Legend />}
          
          {strategies.map((strategy) => (
            <Area
              key={strategy.id}
              type="monotone"
              dataKey={strategy.name}
              stackId="1"
              stroke={strategy.color}
              fill={strategy.color}
              fillOpacity={0.8}
              strokeWidth={1.5}
              activeDot={{ r: 6, strokeWidth: 1, stroke: "#fff" }}
            />
          ))}
          
          {currentGeneration !== undefined && (
            <CartesianGrid 
              vertical={true} 
              horizontal={false}
              verticalPoints={[currentGeneration]}
              stroke="#666"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
} 