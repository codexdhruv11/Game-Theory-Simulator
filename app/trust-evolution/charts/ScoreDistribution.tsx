"use client"

import { useMemo } from "react"
import { Strategy, StrategyStats } from "../types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts"

interface ScoreDistributionProps {
  standings: StrategyStats[]
  strategies: Strategy[]
  height?: number | string
  showLegend?: boolean
  layout?: "vertical" | "horizontal"
  showCooperationRate?: boolean
  showAverage?: boolean
}

export function ScoreDistribution({
  standings,
  strategies,
  height = 300,
  showLegend = true,
  layout = "horizontal",
  showCooperationRate = false,
  showAverage = true
}: ScoreDistributionProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    return standings.map(stat => {
      const strategy = strategies.find(s => s.id === stat.strategyId)
      return {
        name: strategy?.name || stat.strategyId,
        score: stat.totalScore,
        averageScore: stat.averageScore,
        cooperationRate: Math.round(stat.cooperationRate * 100),
        color: strategy?.color || "#666",
        strategyId: stat.strategyId
      }
    })
  }, [standings, strategies])

  // Calculate average score for reference line
  const averageScore = useMemo(() => {
    if (standings.length === 0) return 0
    const totalScore = standings.reduce((sum, stat) => sum + stat.totalScore, 0)
    return totalScore / standings.length
  }, [standings])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout={layout}
          margin={
            layout === "vertical" 
              ? { top: 5, right: 30, left: 100, bottom: 5 }
              : { top: 5, right: 30, left: 20, bottom: 30 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                height={60}
                tickMargin={30}
              />
              <YAxis />
            </>
          )}
          <Tooltip 
            formatter={(value, name) => {
              if (name === "cooperationRate") return [`${value}%`, "Cooperation Rate"]
              return [value, name === "score" ? "Total Score" : "Avg. Score Per Round"]
            }}
            labelFormatter={(label) => `Strategy: ${label}`}
          />
          {showLegend && <Legend />}
          
          <Bar 
            dataKey="score" 
            name="Total Score"
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          
          {showCooperationRate && (
            <Bar 
              dataKey="cooperationRate" 
              name="Cooperation Rate (%)" 
              fill="#82ca9d"
            />
          )}
          
          {showAverage && (
            <ReferenceLine 
              y={layout === "vertical" ? undefined : averageScore}
              x={layout === "vertical" ? averageScore : undefined}
              stroke="#ff7300"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${averageScore.toFixed(0)}`,
                position: layout === "vertical" ? "insideTopRight" : "insideTopLeft",
                fill: "#ff7300",
                fontSize: 12
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 