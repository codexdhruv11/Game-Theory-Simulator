"use client"

import { PayoffMatrix as PayoffMatrixType } from "../types"

interface PayoffMatrixProps {
  matrix: PayoffMatrixType
  highlightCell?: [string, string] | null
  showLabels?: boolean
  editable?: boolean
  onCellChange?: (row: string, col: string, value: [number, number]) => void
  className?: string
}

export function PayoffMatrix({ 
  matrix, 
  highlightCell, 
  showLabels = true, 
  editable = false,
  onCellChange,
  className = ""
}: PayoffMatrixProps) {
  const getCellStyle = (row: string, col: string) => {
    const isHighlighted = highlightCell && highlightCell[0] === row && highlightCell[1] === col
    
    let baseStyle = "p-3 text-center border border-border transition-all duration-200 "
    
    if (isHighlighted) {
      baseStyle += "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 "
    } else {
      // Color coding based on outcomes
      if (row === "cooperate" && col === "cooperate") {
        baseStyle += "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 "
      } else if (row === "defect" && col === "defect") {
        baseStyle += "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 "
      } else {
        baseStyle += "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 "
      }
    }
    
    if (editable) {
      baseStyle += "cursor-pointer "
    }
    
    return baseStyle
  }

  const formatPayoff = (payoff: [number, number]) => {
    return `${payoff[0]}, ${payoff[1]}`
  }

  const getPayoffDescription = (row: string, col: string) => {
    if (row === "cooperate" && col === "cooperate") {
      return "Reward for mutual cooperation"
    } else if (row === "defect" && col === "defect") {
      return "Punishment for mutual defection"
    } else if (row === "defect" && col === "cooperate") {
      return "Temptation to defect vs Sucker's payoff"
    } else {
      return "Sucker's payoff vs Temptation to defect"
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="text-center">
          <h3 className="font-semibold text-sm">Payoff Matrix</h3>
          <p className="text-xs text-muted-foreground">
            (Your payoff, Opponent's payoff)
          </p>
        </div>
      )}
      
      <div className="inline-block border border-border rounded-lg overflow-hidden bg-background">
        <div className="grid grid-cols-3 min-w-[300px]">
          {/* Empty top-left cell */}
          <div className="p-3 bg-muted border-b border-r border-border"></div>
          
          {/* Column headers */}
          <div className="p-3 bg-muted border-b border-r border-border text-center font-semibold text-sm">
            Opponent Cooperates
          </div>
          <div className="p-3 bg-muted border-b border-border text-center font-semibold text-sm">
            Opponent Defects
          </div>
          
          {/* Row 1: You Cooperate */}
          <div className="p-3 bg-muted border-r border-border text-center font-semibold text-sm">
            You Cooperate
          </div>
          <div 
            className={getCellStyle("cooperate", "cooperate")}
            title={getPayoffDescription("cooperate", "cooperate")}
          >
            <div className="font-mono text-sm">
              {formatPayoff(matrix.cooperate.cooperate)}
            </div>
            {showLabels && (
              <div className="text-xs text-muted-foreground mt-1">
                Mutual Cooperation
              </div>
            )}
          </div>
          <div 
            className={getCellStyle("cooperate", "defect")}
            title={getPayoffDescription("cooperate", "defect")}
          >
            <div className="font-mono text-sm">
              {formatPayoff(matrix.cooperate.defect)}
            </div>
            {showLabels && (
              <div className="text-xs text-muted-foreground mt-1">
                You're Exploited
              </div>
            )}
          </div>
          
          {/* Row 2: You Defect */}
          <div className="p-3 bg-muted border-r border-border text-center font-semibold text-sm">
            You Defect
          </div>
          <div 
            className={getCellStyle("defect", "cooperate")}
            title={getPayoffDescription("defect", "cooperate")}
          >
            <div className="font-mono text-sm">
              {formatPayoff(matrix.defect.cooperate)}
            </div>
            {showLabels && (
              <div className="text-xs text-muted-foreground mt-1">
                You Exploit
              </div>
            )}
          </div>
          <div 
            className={getCellStyle("defect", "defect")}
            title={getPayoffDescription("defect", "defect")}
          >
            <div className="font-mono text-sm">
              {formatPayoff(matrix.defect.defect)}
            </div>
            {showLabels && (
              <div className="text-xs text-muted-foreground mt-1">
                Mutual Defection
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLabels && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <span className="font-semibold">Green:</span> Best mutual outcome (both cooperate)</p>
          <p>• <span className="font-semibold">Yellow:</span> Mixed outcomes (one cooperates, one defects)</p>
          <p>• <span className="font-semibold">Red:</span> Worst mutual outcome (both defect)</p>
        </div>
      )}
    </div>
  )
}