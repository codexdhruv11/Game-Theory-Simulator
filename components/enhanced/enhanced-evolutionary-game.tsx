"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import * as d3 from "d3";

// Types
type Strategy = "hawk" | "dove" | "retaliator" | "cooperator";
type GridCell = {
  strategy: Strategy;
  fitness: number;
  age: number;
};

// Strategy colors
const STRATEGY_COLORS = {
  hawk: { light: "#ef4444", dark: "#b91c1c" },
  dove: { light: "#22c55e", dark: "#15803d" },
  retaliator: { light: "#3b82f6", dark: "#1d4ed8" },
  cooperator: { light: "#a855f7", dark: "#7e22ce" },
};

// Strategy descriptions
const STRATEGY_DESCRIPTIONS = {
  hawk: "Always aggressive, takes resources by force",
  dove: "Always peaceful, shares resources and avoids conflict",
  retaliator: "Peaceful initially, but retaliates against aggression",
  cooperator: "Cooperates with cooperators, punishes defectors",
};

// Payoff matrix
const PAYOFF_MATRIX = {
  hawk: {
    hawk: -2, // Two hawks fight and get injured
    dove: 5,  // Hawk takes all from dove
    retaliator: 0, // Retaliator fights back against hawk
    cooperator: 3, // Cooperator gets exploited initially
  },
  dove: {
    hawk: 0,  // Dove retreats and gets nothing
    dove: 3,  // Doves share resources peacefully
    retaliator: 3, // Retaliator is peaceful with dove
    cooperator: 3, // Cooperator is peaceful with dove
  },
  retaliator: {
    hawk: 0,  // Retaliator fights back against hawk
    dove: 3,  // Retaliator is peaceful with dove
    retaliator: 3, // Two retaliators are peaceful
    cooperator: 3, // Cooperator and retaliator cooperate
  },
  cooperator: {
    hawk: 0,  // Cooperator punishes hawk after being exploited
    dove: 3,  // Cooperator is peaceful with dove
    retaliator: 3, // Cooperator and retaliator cooperate
    cooperator: 4, // Cooperators work together for mutual benefit
  },
};

export const EnhancedEvolutionaryGame = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Refs
  const landscapeRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState("spatial");
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [gridSize, setGridSize] = useState(20);
  const [mutationRate, setMutationRate] = useState(0.02);
  const [speed, setSpeed] = useState(5);
  const [populationData, setPopulationData] = useState<Record<Strategy, number>>({
    hawk: 0,
    dove: 0,
    retaliator: 0,
    cooperator: 0,
  });
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [historyData, setHistoryData] = useState<{generation: number, populations: Record<Strategy, number>}[]>([]);
  
  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, [gridSize]);
  
  // Animation loop
  useEffect(() => {
    let animationId: number;
    let timeoutId: NodeJS.Timeout;
    
    if (isRunning) {
      const runSimulation = () => {
        updateGeneration();
        timeoutId = setTimeout(() => {
          animationId = requestAnimationFrame(runSimulation);
        }, 1000 / speed);
      };
      
      animationId = requestAnimationFrame(runSimulation);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isRunning, speed, mutationRate]);
  
  // Update charts when population data changes
  useEffect(() => {
    if (chartRef.current && historyData.length > 0) {
      drawPopulationChart();
    }
  }, [historyData, theme, activeTab]);
  
  // Initialize the grid with random strategies
  const initializeGrid = () => {
    const strategies: Strategy[] = ["hawk", "dove", "retaliator", "cooperator"];
    const newGrid: GridCell[][] = [];
    
    for (let i = 0; i < gridSize; i++) {
      const row: GridCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        row.push({
          strategy: randomStrategy,
          fitness: 0,
          age: 0,
        });
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setGeneration(0);
    setHistoryData([]);
    updatePopulationCount(newGrid);
  };
  
  // Update population count
  const updatePopulationCount = (currentGrid: GridCell[][]) => {
    const counts: Record<Strategy, number> = {
      hawk: 0,
      dove: 0,
      retaliator: 0,
      cooperator: 0,
    };
    
    for (let i = 0; i < currentGrid.length; i++) {
      for (let j = 0; j < currentGrid[i].length; j++) {
        counts[currentGrid[i][j].strategy]++;
      }
    }
    
    setPopulationData(counts);
    setHistoryData(prev => [...prev, { generation, populations: counts }]);
  };
  
  // Update generation
  const updateGeneration = () => {
    if (!isRunning) return;
    
    // Calculate fitness based on neighbors
    const newGrid = JSON.parse(JSON.stringify(grid)) as GridCell[][];
    
    // Calculate fitness
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cell = grid[i][j];
        let fitness = 0;
        
        // Interact with neighbors (Moore neighborhood)
        for (let ni = -1; ni <= 1; ni++) {
          for (let nj = -1; nj <= 1; nj++) {
            if (ni === 0 && nj === 0) continue;
            
            const neighborI = (i + ni + gridSize) % gridSize;
            const neighborJ = (j + nj + gridSize) % gridSize;
            const neighbor = grid[neighborI][neighborJ];
            
            // Add payoff from interaction
            fitness += PAYOFF_MATRIX[cell.strategy][neighbor.strategy];
          }
        }
        
        newGrid[i][j].fitness = fitness;
        newGrid[i][j].age += 1;
      }
    }
    
    // Update strategies based on fitness
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cell = newGrid[i][j];
        
        // Find the neighbor with highest fitness (including self)
        let bestFitness = cell.fitness;
        let bestStrategy = cell.strategy;
        
        for (let ni = -1; ni <= 1; ni++) {
          for (let nj = -1; nj <= 1; nj++) {
            const neighborI = (i + ni + gridSize) % gridSize;
            const neighborJ = (j + nj + gridSize) % gridSize;
            const neighbor = newGrid[neighborI][neighborJ];
            
            if (neighbor.fitness > bestFitness) {
              bestFitness = neighbor.fitness;
              bestStrategy = neighbor.strategy;
            }
          }
        }
        
        // Apply mutation
        if (Math.random() < mutationRate) {
          const strategies: Strategy[] = ["hawk", "dove", "retaliator", "cooperator"];
          bestStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        }
        
        // Update strategy
        newGrid[i][j].strategy = bestStrategy;
      }
    }
    
    if (isRunning) {
      setGrid(newGrid);
      setGeneration(prev => prev + 1);
      updatePopulationCount(newGrid);
    }
  };
  
  // Draw population chart
  const drawPopulationChart = () => {
    const container = chartRef.current;
    if (!container) return;
    
    // Clear previous chart
    d3.select(container).selectAll("svg").remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    const svg = d3.select(container)
      .append("svg")
      .attr("width", container.clientWidth)
      .attr("height", container.clientHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleLinear()
      .domain([0, historyData.length - 1])
      .range([0, width]);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, gridSize * gridSize])
      .range([height, 0]);
    
    // Line generator
    const line = d3.line<{generation: number, populations: Record<Strategy, number>}>()
      .x(d => x(d.generation))
      .y(d => y(d.populations.hawk))
      .curve(d3.curveBasis);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("fill", isDark ? "white" : "black")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Generation");
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", isDark ? "white" : "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Population");
    
    // Add lines for each strategy
    const strategies: Strategy[] = ["hawk", "dove", "retaliator", "cooperator"];
    
    strategies.forEach(strategy => {
      const strategyLine = d3.line<{generation: number, populations: Record<Strategy, number>}>()
        .x(d => x(d.generation))
        .y(d => y(d.populations[strategy]))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(historyData)
        .attr("fill", "none")
        .attr("stroke", isDark ? STRATEGY_COLORS[strategy].dark : STRATEGY_COLORS[strategy].light)
        .attr("stroke-width", 2)
        .attr("d", strategyLine);
    });
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, 0)`);
    
    strategies.forEach((strategy, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      g.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", isDark ? STRATEGY_COLORS[strategy].dark : STRATEGY_COLORS[strategy].light);
      
      g.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("fill", isDark ? "white" : "black")
        .style("font-size", "12px")
        .text(strategy.charAt(0).toUpperCase() + strategy.slice(1));
    });
  };
  
  // Simulation control buttons
  const renderControls = () => (
    <div className="flex space-x-2 mb-4">
      {!isRunning ? (
        <Button 
          onClick={() => setIsRunning(true)} 
          className="flex items-center"
          data-testid="start-simulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Start
        </Button>
      ) : (
        <Button 
          onClick={() => setIsRunning(false)} 
          className="flex items-center"
          data-testid="stop-simulation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          Stop
        </Button>
      )}
      <Button 
        onClick={() => {
          setIsRunning(false);
          setTimeout(() => {
            initializeGrid();
          }, 100);
        }} 
        variant="outline" 
        className="flex items-center"
        data-testid="reset-simulation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>
        Reset
      </Button>
    </div>
  );

  // Grid visualization
  const renderGrid = () => {
    return (
      <div 
        ref={gridRef} 
        className="w-full aspect-square bg-muted rounded-md overflow-hidden"
        data-testid="population-grid"
      >
        <div className="grid h-full w-full" style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}>
          {grid.map((row, i) => 
            row.map((cell, j) => {
              const color = isDark 
                ? STRATEGY_COLORS[cell.strategy].dark 
                : STRATEGY_COLORS[cell.strategy].light;
              
              return (
                <div 
                  key={`${i}-${j}`}
                  className="transition-colors duration-200"
                  style={{ backgroundColor: color }}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Generation counter
  const renderGenerationCounter = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="text-lg font-semibold" data-testid="generation-counter">
        Generation: {generation}
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm">Speed:</span>
        <Slider
          value={[speed]}
          min={1}
          max={20}
          step={1}
          onValueChange={(value) => setSpeed(value[0])}
          className="w-24"
          data-testid="speed-slider"
        />
      </div>
    </div>
  );
  
  // Render 3D landscape
  const render3DLandscape = () => {
    // This would be a placeholder for a more complex 3D visualization
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded border border-muted-foreground/20">
        <div className="text-center">
          <p className="text-muted-foreground">3D Fitness Landscape Visualization</p>
          <p className="text-sm text-muted-foreground mt-2">
            (This would be implemented with WebGL or Three.js in a full implementation)
          </p>
        </div>
      </div>
    );
  };
  
  // Render population statistics
  const renderPopulationStats = () => {
    const total = gridSize * gridSize;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(populationData) as Strategy[]).map(strategy => {
          const count = populationData[strategy];
          const percentage = (count / total) * 100;
          
          return (
            <div key={strategy} className="border rounded p-2">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: isDark ? STRATEGY_COLORS[strategy].dark : STRATEGY_COLORS[strategy].light }}
                  />
                  <span className="font-medium">
                    {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                  </span>
                </div>
                <span className="text-sm">{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {STRATEGY_DESCRIPTIONS[strategy]}
              </p>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="w-full h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className="p-4 border-b">
          <TabsList>
            <TabsTrigger value="spatial">Spatial Evolution</TabsTrigger>
            <TabsTrigger value="landscape">Fitness Landscape</TabsTrigger>
            <TabsTrigger value="population">Population Dynamics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold">Generation: {generation}</h3>
            </div>
            <div className="flex gap-2">
              {renderControls()}
            </div>
          </div>
        </div>
        
        <TabsContent value="spatial" className="p-4 h-[calc(100%-120px)] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 h-[400px] md:h-full">
              <div className="border rounded h-full" ref={gridRef}>
                {renderGrid()}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Population Statistics</h3>
                {renderPopulationStats()}
              </div>
              
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Evolution Explanation</h3>
                <p className="text-sm text-muted-foreground">
                  This spatial evolutionary model shows how strategies spread through a population based on their fitness.
                  Cells adopt the strategy of their most successful neighbor, with occasional mutations.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Watch how clusters of similar strategies form and compete for territory.
                  Successful strategies will spread, while less successful ones will be replaced.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="landscape" className="p-4 h-[calc(100%-120px)] overflow-auto">
          <div className="h-full" ref={landscapeRef}>
            {render3DLandscape()}
          </div>
        </TabsContent>
        
        <TabsContent value="population" className="p-4 h-[calc(100%-120px)] overflow-auto">
          <div className="h-full" ref={chartRef}>
            {/* Population chart will be rendered here by D3 */}
            {historyData.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Run the simulation to generate population data</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="p-4 h-[calc(100%-120px)] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">Grid Size: {gridSize}x{gridSize}</h3>
                <Slider
                  value={[gridSize]}
                  min={10}
                  max={50}
                  step={5}
                  onValueChange={(value) => setGridSize(value[0])}
                  disabled={isRunning}
                  className="mb-6"
                />
                <p className="text-sm text-muted-foreground">
                  Larger grids allow for more complex patterns but run slower.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Mutation Rate: {(mutationRate * 100).toFixed(1)}%</h3>
                <Slider
                  value={[mutationRate * 100]}
                  min={0}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setMutationRate(value[0] / 100)}
                  className="mb-6"
                />
                <p className="text-sm text-muted-foreground">
                  Higher mutation rates increase genetic diversity but can disrupt successful strategies.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2">Simulation Speed: {speed}x</h3>
                <Slider
                  value={[speed]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setSpeed(value[0])}
                  className="mb-6"
                />
                <p className="text-sm text-muted-foreground">
                  Adjust how quickly generations pass.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">Strategy Information</h3>
                
                <div className="space-y-4">
                  {(Object.keys(STRATEGY_COLORS) as Strategy[]).map(strategy => (
                    <div key={strategy} className="flex items-start">
                      <div 
                        className="w-4 h-4 rounded-full mt-1 mr-2 flex-shrink-0"
                        style={{ backgroundColor: isDark ? STRATEGY_COLORS[strategy].dark : STRATEGY_COLORS[strategy].light }}
                      />
                      <div>
                        <h4 className="font-medium">{strategy.charAt(0).toUpperCase() + strategy.slice(1)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {STRATEGY_DESCRIPTIONS[strategy]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded p-4">
                <h3 className="font-bold mb-2">About Evolutionary Game Theory</h3>
                <p className="text-sm text-muted-foreground">
                  Evolutionary game theory applies game theory principles to evolving populations.
                  It helps explain how behaviors and strategies emerge and persist in nature.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Key concepts include evolutionary stable strategies (ESS), fitness landscapes,
                  and the role of spatial structure in promoting cooperation.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EnhancedEvolutionaryGame; 