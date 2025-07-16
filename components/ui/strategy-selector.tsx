import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Types
export type Strategy = {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  behavior?: string;
};

export type StrategyCategory = {
  id: string;
  name: string;
  strategies: Strategy[];
};

interface StrategySelectorProps {
  strategies: Strategy[] | StrategyCategory[];
  selectedStrategy?: string;
  onSelectStrategy?: (strategyId: string) => void;
  showComparison?: boolean;
  className?: string;
  cardClassName?: string;
  isGrouped?: boolean;
}

export const StrategySelector = ({
  strategies,
  selectedStrategy,
  onSelectStrategy,
  showComparison = false,
  className,
  cardClassName,
  isGrouped = false,
}: StrategySelectorProps) => {
  const [activeTab, setActiveTab] = useState<string>("select");
  const [compareStrategies, setCompareStrategies] = useState<string[]>([]);
  
  // Helper to determine if the strategies are grouped by category
  const isStrategyCategory = (item: any): item is StrategyCategory => {
    return "strategies" in item;
  };
  
  // Get flat list of all strategies
  const getAllStrategies = (): Strategy[] => {
    if (!isGrouped) {
      return strategies as Strategy[];
    }
    
    return (strategies as StrategyCategory[]).flatMap(category => category.strategies);
  };
  
  // Find strategy by ID
  const getStrategyById = (id: string): Strategy | undefined => {
    return getAllStrategies().find(s => s.id === id);
  };
  
  // Handle strategy selection
  const handleSelectStrategy = (strategyId: string) => {
    if (onSelectStrategy) {
      onSelectStrategy(strategyId);
    }
  };
  
  // Toggle strategy comparison
  const toggleCompareStrategy = (strategyId: string) => {
    setCompareStrategies(prev => {
      if (prev.includes(strategyId)) {
        return prev.filter(id => id !== strategyId);
      } else {
        return [...prev, strategyId];
      }
    });
  };
  
  // Render strategy card
  const renderStrategyCard = (strategy: Strategy, isSelected: boolean) => {
    const isCompared = compareStrategies.includes(strategy.id);
    
    return (
      <motion.div
        key={strategy.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all border",
            isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50",
            cardClassName
          )}
          onClick={() => handleSelectStrategy(strategy.id)}
        >
          <div className="flex items-center mb-2">
            {strategy.icon && <div className="mr-2">{strategy.icon}</div>}
            <h3 className="font-medium">{strategy.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{strategy.description}</p>
          
          {strategy.behavior && (
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
              <code>{strategy.behavior}</code>
            </div>
          )}
          
          {showComparison && (
            <div className="absolute top-2 right-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center text-xs",
                        isCompared ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompareStrategy(strategy.id);
                      }}
                    >
                      {isCompared ? "✓" : "+"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCompared ? "Remove from comparison" : "Add to comparison"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };
  
  // Render strategy grid
  const renderStrategyGrid = () => {
    if (!isGrouped) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(strategies as Strategy[]).map(strategy => 
            renderStrategyCard(strategy, strategy.id === selectedStrategy)
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {(strategies as StrategyCategory[]).map(category => (
          <div key={category.id}>
            <h2 className="text-lg font-semibold mb-3">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.strategies.map(strategy => 
                renderStrategyCard(strategy, strategy.id === selectedStrategy)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render strategy comparison
  const renderStrategyComparison = () => {
    if (compareStrategies.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 border rounded">
          <p className="text-muted-foreground">
            Select strategies to compare by clicking the + button
          </p>
        </div>
      );
    }
    
    // Properties to compare
    const comparisonProperties = [
      { key: "name", label: "Strategy" },
      { key: "description", label: "Description" },
      { key: "behavior", label: "Behavior" },
    ];
    
    return (
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 border-b text-left"></th>
              {compareStrategies.map(id => {
                const strategy = getStrategyById(id);
                return (
                  <th key={id} className="p-2 border-b text-center">
                    <div className="flex flex-col items-center">
                      <span>{strategy?.name}</span>
                      <button
                        className="text-xs text-muted-foreground hover:text-destructive mt-1"
                        onClick={() => toggleCompareStrategy(id)}
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonProperties.slice(1).map(prop => (
              <tr key={prop.key} className="border-b">
                <td className="p-2 font-medium">{prop.label}</td>
                {compareStrategies.map(id => {
                  const strategy = getStrategyById(id);
                  return (
                    <td key={id} className="p-2 text-center">
                      {strategy && prop.key === "behavior" ? (
                        <div className="p-1 bg-muted/30 rounded text-xs">
                          <code>{strategy[prop.key as keyof Strategy] as string || "N/A"}</code>
                        </div>
                      ) : (
                        <span>{strategy?.[prop.key as keyof Strategy] as string || "N/A"}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render strategy builder (simplified version)
  const renderStrategyBuilder = () => {
    return (
      <div className="border rounded p-4">
        <p className="text-muted-foreground mb-4">
          The strategy builder would allow users to create custom conditional strategies by
          combining different rules and conditions. This is a placeholder for that functionality.
        </p>
        
        <div className="bg-muted/30 rounded p-4">
          <pre className="text-xs">
{`if (opponent.lastMove === "cooperate") {
  return "cooperate";
} else if (myHistory.defectionCount > 2) {
  return "defect";
} else {
  return Math.random() > 0.7 ? "cooperate" : "defect";
}`}
          </pre>
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("strategy-selector", className)}>
      {showComparison && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="select">Select Strategy</TabsTrigger>
            <TabsTrigger value="compare">Compare Strategies</TabsTrigger>
            <TabsTrigger value="build">Strategy Builder</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select">
            {renderStrategyGrid()}
          </TabsContent>
          
          <TabsContent value="compare">
            {renderStrategyComparison()}
          </TabsContent>
          
          <TabsContent value="build">
            {renderStrategyBuilder()}
          </TabsContent>
        </Tabs>
      )}
      
      {!showComparison && renderStrategyGrid()}
    </div>
  );
};

export default StrategySelector; 