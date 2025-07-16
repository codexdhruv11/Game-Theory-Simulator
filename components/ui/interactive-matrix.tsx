import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Types
export type MatrixCell = {
  row: number;
  col: number;
  rowPlayer: number;
  colPlayer: number;
};

export type MatrixSize = {
  rows: number;
  cols: number;
};

export type EquilibriumType = "nash" | "dominant" | "pareto" | "none";

interface InteractiveMatrixProps {
  initialMatrix?: MatrixCell[][];
  size?: MatrixSize;
  editable?: boolean;
  highlightEquilibria?: boolean;
  showBestResponses?: boolean;
  className?: string;
  rowLabels?: string[];
  colLabels?: string[];
  onMatrixChange?: (matrix: MatrixCell[][]) => void;
}

export const InteractiveMatrix = ({
  initialMatrix,
  size = { rows: 2, cols: 2 },
  editable = true,
  highlightEquilibria = true,
  showBestResponses = true,
  className,
  rowLabels = ["Strategy A", "Strategy B"],
  colLabels = ["Strategy X", "Strategy Y"],
  onMatrixChange,
}: InteractiveMatrixProps) => {
  // Initialize matrix
  const [matrix, setMatrix] = useState<MatrixCell[][]>(() => {
    if (initialMatrix) return initialMatrix;
    
    // Create default matrix
    return Array(size.rows).fill(0).map((_, row) =>
      Array(size.cols).fill(0).map((_, col) => ({
        row,
        col,
        rowPlayer: 0,
        colPlayer: 0,
      }))
    );
  });
  
  // Calculate Nash equilibria
  const [nashEquilibria, setNashEquilibria] = useState<boolean[][]>([]);
  const [rowBestResponses, setRowBestResponses] = useState<boolean[][]>([]);
  const [colBestResponses, setColBestResponses] = useState<boolean[][]>([]);
  const [dominantStrategies, setDominantStrategies] = useState<{
    row: number | null;
    col: number | null;
  }>({ row: null, col: null });
  
  // Calculate equilibria and best responses when matrix changes
  useEffect(() => {
    calculateBestResponses();
    calculateNashEquilibria();
    calculateDominantStrategies();
    
    if (onMatrixChange) {
      onMatrixChange(matrix);
    }
  }, [matrix]);
  
  // Calculate best responses for each player
  const calculateBestResponses = () => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Initialize arrays
    const rowBest = Array(rows).fill(0).map(() => Array(cols).fill(false));
    const colBest = Array(rows).fill(0).map(() => Array(cols).fill(false));
    
    // For each column, find the row's best response
    for (let j = 0; j < cols; j++) {
      let maxPayoff = -Infinity;
      let maxIndices: number[] = [];
      
      for (let i = 0; i < rows; i++) {
        const payoff = matrix[i][j].rowPlayer;
        
        if (payoff > maxPayoff) {
          maxPayoff = payoff;
          maxIndices = [i];
        } else if (payoff === maxPayoff) {
          maxIndices.push(i);
        }
      }
      
      // Mark best responses
      maxIndices.forEach(i => {
        rowBest[i][j] = true;
      });
    }
    
    // For each row, find the column's best response
    for (let i = 0; i < rows; i++) {
      let maxPayoff = -Infinity;
      let maxIndices: number[] = [];
      
      for (let j = 0; j < cols; j++) {
        const payoff = matrix[i][j].colPlayer;
        
        if (payoff > maxPayoff) {
          maxPayoff = payoff;
          maxIndices = [j];
        } else if (payoff === maxPayoff) {
          maxIndices.push(j);
        }
      }
      
      // Mark best responses
      maxIndices.forEach(j => {
        colBest[i][j] = true;
      });
    }
    
    setRowBestResponses(rowBest);
    setColBestResponses(colBest);
  };
  
  // Calculate Nash equilibria
  const calculateNashEquilibria = () => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const nash = Array(rows).fill(0).map(() => Array(cols).fill(false));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (rowBestResponses[i][j] && colBestResponses[i][j]) {
          nash[i][j] = true;
        }
      }
    }
    
    setNashEquilibria(nash);
  };
  
  // Calculate dominant strategies
  const calculateDominantStrategies = () => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    // Check for row player's dominant strategy
    let rowDominant: number | null = null;
    
    for (let i = 0; i < rows; i++) {
      let isDominant = true;
      
      for (let i2 = 0; i2 < rows; i2++) {
        if (i === i2) continue;
        
        for (let j = 0; j < cols; j++) {
          if (matrix[i][j].rowPlayer <= matrix[i2][j].rowPlayer) {
            isDominant = false;
            break;
          }
        }
        
        if (!isDominant) break;
      }
      
      if (isDominant) {
        rowDominant = i;
        break;
      }
    }
    
    // Check for column player's dominant strategy
    let colDominant: number | null = null;
    
    for (let j = 0; j < cols; j++) {
      let isDominant = true;
      
      for (let j2 = 0; j2 < cols; j2++) {
        if (j === j2) continue;
        
        for (let i = 0; i < rows; i++) {
          if (matrix[i][j].colPlayer <= matrix[i][j2].colPlayer) {
            isDominant = false;
            break;
          }
        }
        
        if (!isDominant) break;
      }
      
      if (isDominant) {
        colDominant = j;
        break;
      }
    }
    
    setDominantStrategies({ row: rowDominant, col: colDominant });
  };
  
  // Handle cell value change
  const handleCellChange = (row: number, col: number, player: "rowPlayer" | "colPlayer", value: string) => {
    const numValue = parseInt(value) || 0;
    
    setMatrix(prev => {
      const newMatrix = [...prev];
      newMatrix[row] = [...newMatrix[row]];
      newMatrix[row][col] = {
        ...newMatrix[row][col],
        [player]: numValue,
      };
      return newMatrix;
    });
  };
  
  // Get cell background color based on equilibrium status
  const getCellBackgroundColor = (row: number, col: number): string => {
    if (highlightEquilibria && nashEquilibria[row]?.[col]) {
      return "bg-green-100 dark:bg-green-900/30";
    }
    
    if (dominantStrategies.row === row && dominantStrategies.col === col) {
      return "bg-purple-100 dark:bg-purple-900/30";
    }
    
    if (dominantStrategies.row === row) {
      return "bg-blue-100 dark:bg-blue-900/20";
    }
    
    if (dominantStrategies.col === col) {
      return "bg-amber-100 dark:bg-amber-900/20";
    }
    
    return "bg-background";
  };
  
  // Get cell border style based on best response
  const getCellBorderStyle = (row: number, col: number): string => {
    if (!showBestResponses) return "";
    
    let borderClasses = "";
    
    if (rowBestResponses[row]?.[col]) {
      borderClasses += " border-l-2 border-l-blue-500";
    }
    
    if (colBestResponses[row]?.[col]) {
      borderClasses += " border-b-2 border-b-red-500";
    }
    
    return borderClasses;
  };
  
  // Export matrix as JSON
  const exportMatrix = () => {
    const json = JSON.stringify(matrix, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "game-matrix.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Reset matrix to zeros
  const resetMatrix = () => {
    setMatrix(
      Array(size.rows).fill(0).map((_, row) =>
        Array(size.cols).fill(0).map((_, col) => ({
          row,
          col,
          rowPlayer: 0,
          colPlayer: 0,
        }))
      )
    );
  };
  
  // Render the matrix
  return (
    <div className={cn("interactive-matrix", className)}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Game Matrix</h3>
          <p className="text-xs text-muted-foreground">
            {nashEquilibria.flat().filter(Boolean).length > 0
              ? `${nashEquilibria.flat().filter(Boolean).length} Nash equilibria found`
              : "No Nash equilibria found"}
          </p>
        </div>
        
        {editable && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetMatrix}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={exportMatrix}>
              Export
            </Button>
          </div>
        )}
      </div>
      
      <div className="relative overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 border-b border-r"></th>
              {Array(size.cols).fill(0).map((_, col) => (
                <th key={col} className="p-2 border-b text-center min-w-[100px]">
                  {colLabels[col] || `Column ${col + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(size.rows).fill(0).map((_, row) => (
              <tr key={row}>
                <th className="p-2 border-r text-center">
                  {rowLabels[row] || `Row ${row + 1}`}
                </th>
                {Array(size.cols).fill(0).map((_, col) => (
                  <td
                    key={col}
                    className={cn(
                      "p-2 border text-center relative",
                      getCellBackgroundColor(row, col),
                      getCellBorderStyle(row, col)
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Row:</span>
                              {editable ? (
                                <Input
                                  type="number"
                                  value={matrix[row][col].rowPlayer}
                                  onChange={(e) => handleCellChange(row, col, "rowPlayer", e.target.value)}
                                  className="w-12 h-6 text-right p-1"
                                />
                              ) : (
                                <span className="font-medium">{matrix[row][col].rowPlayer}</span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Row player's payoff</p>
                            {rowBestResponses[row]?.[col] && (
                              <p className="text-blue-500">Best response to column {col + 1}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="border-t border-dashed border-muted-foreground/30"></div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Col:</span>
                              {editable ? (
                                <Input
                                  type="number"
                                  value={matrix[row][col].colPlayer}
                                  onChange={(e) => handleCellChange(row, col, "colPlayer", e.target.value)}
                                  className="w-12 h-6 text-right p-1"
                                />
                              ) : (
                                <span className="font-medium">{matrix[row][col].colPlayer}</span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Column player's payoff</p>
                            {colBestResponses[row]?.[col] && (
                              <p className="text-red-500">Best response to row {row + 1}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {nashEquilibria[row]?.[col] && highlightEquilibria && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                        title="Nash Equilibrium"
                      >
                        <span className="text-white text-[10px]">N</span>
                      </motion.div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {highlightEquilibria && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 border rounded bg-green-100 dark:bg-green-900/30">
            <span className="font-medium">Nash Equilibrium</span>: Neither player can improve by changing only their strategy
          </div>
          <div className="p-2 border rounded bg-blue-100 dark:bg-blue-900/20">
            <span className="font-medium">Row Dominant</span>: Best strategy regardless of opponent's choice
          </div>
          <div className="p-2 border rounded bg-amber-100 dark:bg-amber-900/20">
            <span className="font-medium">Column Dominant</span>: Best strategy regardless of opponent's choice
          </div>
          <div className="p-2 border rounded bg-purple-100 dark:bg-purple-900/30">
            <span className="font-medium">Both Dominant</span>: Dominant strategy equilibrium
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMatrix; 