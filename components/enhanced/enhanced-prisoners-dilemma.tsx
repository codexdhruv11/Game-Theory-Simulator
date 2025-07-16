"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

// Strategy types
type Strategy = "cooperate" | "defect";
type PlayerType = "tit-for-tat" | "always-cooperate" | "always-defect" | "random" | "grudger" | "pavlov";

// Payoff matrix
const PAYOFF_MATRIX = {
  cooperate: {
    cooperate: { player: 3, opponent: 3 },
    defect: { player: 0, opponent: 5 }
  },
  defect: {
    cooperate: { player: 5, opponent: 0 },
    defect: { player: 1, opponent: 1 }
  }
};

// AI opponent personalities
const AI_STRATEGIES: Record<PlayerType, (history: Strategy[], playerHistory?: Strategy[]) => Strategy> = {
  "tit-for-tat": (history) => history.length === 0 ? "cooperate" : history[history.length - 1],
  "always-cooperate": () => "cooperate",
  "always-defect": () => "defect",
  "random": () => Math.random() > 0.5 ? "cooperate" : "defect",
  "grudger": (history) => history.includes("defect") ? "defect" : "cooperate",
  "pavlov": (history, playerHistory = []) => {
    if (history.length === 0) return "cooperate";
    const lastPlayerMove = playerHistory[playerHistory.length - 1];
    const lastOpponentMove = history[history.length - 1];
    
    // Win-stay, lose-shift
    if (lastPlayerMove === "cooperate" && lastOpponentMove === "cooperate") return "cooperate";
    if (lastPlayerMove === "defect" && lastOpponentMove === "defect") return "cooperate";
    return "defect";
  }
};

// Helper function for strategy descriptions
const getStrategyDescription = (type: PlayerType): string => {
  switch (type) {
    case "tit-for-tat": return "Copies your last move";
    case "always-cooperate": return "Always cooperates";
    case "always-defect": return "Always defects";
    case "random": return "Chooses randomly";
    case "grudger": return "Cooperates until you defect once";
    case "pavlov": return "Win-stay, lose-shift strategy";
    default: return "";
  }
};

export const EnhancedPrisonersDilemma = () => {
  const { theme } = useTheme();
  const [playerStrategy, setPlayerStrategy] = useState<Strategy>("cooperate");
  const [opponentType, setOpponentType] = useState<PlayerType>("tit-for-tat");
  const [playerHistory, setPlayerHistory] = useState<Strategy[]>([]);
  const [opponentHistory, setOpponentHistory] = useState<Strategy[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState("game");
  const [tournamentResults, setTournamentResults] = useState<Record<PlayerType, number>>({
    "tit-for-tat": 0,
    "always-cooperate": 0,
    "always-defect": 0,
    "random": 0,
    "grudger": 0,
    "pavlov": 0
  });

  // Function to play a round
  const playRound = (playerMove: Strategy) => {
    setIsAnimating(true);
    
    // Get opponent's move based on their strategy
    const opponentMove = AI_STRATEGIES[opponentType](playerHistory, opponentHistory);
    
    // Calculate payoffs
    const payoff = PAYOFF_MATRIX[playerMove][opponentMove];
    
    // Update histories and scores
    setPlayerHistory([...playerHistory, playerMove]);
    setOpponentHistory([...opponentHistory, opponentMove]);
    setPlayerScore(playerScore + payoff.player);
    setOpponentScore(opponentScore + payoff.opponent);
    setRoundNumber(roundNumber + 1);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Function to reset the game
  const resetGame = () => {
    setPlayerHistory([]);
    setOpponentHistory([]);
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundNumber(0);
  };

  // Function to run a tournament
  const runTournament = () => {
    // Reset tournament results
    const results: Record<PlayerType, number> = {
      "tit-for-tat": 0,
      "always-cooperate": 0,
      "always-defect": 0,
      "random": 0,
      "grudger": 0,
      "pavlov": 0
    };
    
    // Run 100 rounds for each strategy pair
    const strategies: PlayerType[] = ["tit-for-tat", "always-cooperate", "always-defect", "random", "grudger", "pavlov"];
    
    strategies.forEach((strategy1) => {
      strategies.forEach((strategy2) => {
        if (strategy1 === strategy2) return;
        
        let history1: Strategy[] = [];
        let history2: Strategy[] = [];
        let score1 = 0;
        let score2 = 0;
        
        // Play 100 rounds
        for (let i = 0; i < 100; i++) {
          const move1 = AI_STRATEGIES[strategy1](history2, history1);
          const move2 = AI_STRATEGIES[strategy2](history1, history2);
          
          const payoff = PAYOFF_MATRIX[move1][move2];
          score1 += payoff.player;
          score2 += payoff.opponent;
          
          history1.push(move1);
          history2.push(move2);
        }
        
        // Update results
        results[strategy1] += score1;
      });
    });
    
    setTournamentResults(results);
    setActiveTab("tournament");
  };

  // Calculate cooperation rates
  const playerCooperationRate = playerHistory.filter(move => move === "cooperate").length / Math.max(1, playerHistory.length);
  const opponentCooperationRate = opponentHistory.filter(move => move === "cooperate").length / Math.max(1, opponentHistory.length);

  return (
    <Card className="w-full h-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full" data-testid="prisoners-dilemma-tabs">
        <div className="p-4 border-b">
          <TabsList>
            <TabsTrigger value="game" data-testid="tab-game">Game</TabsTrigger>
            <TabsTrigger value="matrix" data-testid="tab-matrix">Payoff Matrix</TabsTrigger>
            <TabsTrigger value="tournament" data-testid="tab-tournament">Tournament</TabsTrigger>
            <TabsTrigger value="stats" data-testid="tab-statistics">Statistics</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="game" className="p-4 h-[calc(100%-60px)] overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Your Strategy</h3>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={playerStrategy === "cooperate" ? "default" : "outline"}
                  onClick={() => setPlayerStrategy("cooperate")}
                  data-testid="strategy-cooperate"
                >
                  Cooperate
                </Button>
                <Button
                  variant={playerStrategy === "defect" ? "default" : "outline"}
                  onClick={() => setPlayerStrategy("defect")}
                  data-testid="strategy-defect"
                >
                  Defect
                </Button>
              </div>
              
              <h3 className="text-xl font-bold mb-2">Opponent Type</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(Object.keys(AI_STRATEGIES) as PlayerType[]).map((type) => (
                  <Button
                    key={type}
                    variant={opponentType === type ? "default" : "outline"}
                    onClick={() => {
                      setOpponentType(type);
                      resetGame();
                    }}
                    className="text-sm"
                  >
                    {type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  </Button>
                ))}
              </div>
              
              <p className="text-muted-foreground mb-4">
                <strong>Current opponent:</strong> {getStrategyDescription(opponentType)}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Round: {roundNumber}</h3>
                </div>
                <div>
                  <Button onClick={resetGame} variant="outline" size="sm">
                    Reset Game
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded p-4 text-center">
                  <h4 className="font-bold">Your Score</h4>
                  <motion.div
                    key={playerScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold"
                  >
                    {playerScore}
                  </motion.div>
                </div>
                <div className="border rounded p-4 text-center">
                  <h4 className="font-bold">Opponent Score</h4>
                  <motion.div
                    key={opponentScore}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-3xl font-bold"
                  >
                    {opponentScore}
                  </motion.div>
                </div>
              </div>
              
              <Button 
                onClick={() => playRound(playerStrategy)} 
                className="w-full"
                disabled={isAnimating}
              >
                Play Round
              </Button>
            </div>
          </div>
          
          {playerHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2">Game History</h3>
              <div className="border rounded overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Round</th>
                      <th className="p-2 text-left">Your Move</th>
                      <th className="p-2 text-left">Opponent Move</th>
                      <th className="p-2 text-left">Your Points</th>
                      <th className="p-2 text-left">Opponent Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerHistory.map((move, index) => {
                      const opponentMove = opponentHistory[index];
                      const payoff = PAYOFF_MATRIX[move][opponentMove];
                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                        >
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">
                            <span className={move === "cooperate" ? "text-green-500" : "text-red-500"}>
                              {move.charAt(0).toUpperCase() + move.slice(1)}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={opponentMove === "cooperate" ? "text-green-500" : "text-red-500"}>
                              {opponentMove.charAt(0).toUpperCase() + opponentMove.slice(1)}
                            </span>
                          </td>
                          <td className="p-2">{payoff.player}</td>
                          <td className="p-2">{payoff.opponent}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="matrix" className="p-4 h-[calc(100%-60px)] overflow-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Payoff Matrix</h3>
            
            <div className="relative w-full max-w-md h-64 perspective-1000">
              <motion.div
                className="w-full h-full"
                animate={{ rotateX: [0, 15, 0], rotateY: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              >
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-1/4"></th>
                      <th className="w-1/4 p-2 text-center border">
                        Opponent Cooperates
                      </th>
                      <th className="w-1/4 p-2 text-center border">
                        Opponent Defects
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="p-2 text-center border">You Cooperate</th>
                      <td className="p-4 border text-center bg-green-100 dark:bg-green-900/30">
                        <div className="font-bold">You: 3</div>
                        <div className="font-bold">Opponent: 3</div>
                        <div className="text-xs mt-2 text-muted-foreground">Mutual Cooperation</div>
                      </td>
                      <td className="p-4 border text-center bg-red-100 dark:bg-red-900/30">
                        <div className="font-bold">You: 0</div>
                        <div className="font-bold">Opponent: 5</div>
                        <div className="text-xs mt-2 text-muted-foreground">You're exploited</div>
                      </td>
                    </tr>
                    <tr>
                      <th className="p-2 text-center border">You Defect</th>
                      <td className="p-4 border text-center bg-blue-100 dark:bg-blue-900/30">
                        <div className="font-bold">You: 5</div>
                        <div className="font-bold">Opponent: 0</div>
                        <div className="text-xs mt-2 text-muted-foreground">You exploit them</div>
                      </td>
                      <td className="p-4 border text-center bg-amber-100 dark:bg-amber-900/30">
                        <div className="font-bold">You: 1</div>
                        <div className="font-bold">Opponent: 1</div>
                        <div className="text-xs mt-2 text-muted-foreground">Mutual Defection</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            </div>
            
            <div className="mt-8 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-2">Understanding the Prisoner's Dilemma</h3>
              <p className="mb-4">
                The Prisoner's Dilemma is a classic game theory scenario that demonstrates why two rational individuals might not cooperate, even when it's in their best interest to do so.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h4 className="font-bold mb-2">Nash Equilibrium</h4>
                  <p className="text-sm">
                    The Nash equilibrium in this game is mutual defection (bottom-right), where both players get 1 point each. Neither player can improve their outcome by changing only their own strategy.
                  </p>
                </div>
                <div className="border rounded p-4">
                  <h4 className="font-bold mb-2">Pareto Optimality</h4>
                  <p className="text-sm">
                    Mutual cooperation (top-left) is Pareto optimal, giving 3 points to each player. This is better for both players than the Nash equilibrium, but it's unstable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tournament" className="p-4 h-[calc(100%-60px)] overflow-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Strategy Tournament</h3>
            <p className="mb-4 text-center max-w-md">
              Run a tournament where each strategy plays against all others for 100 rounds.
              See which strategy accumulates the most points overall.
            </p>
            
            <Button onClick={runTournament} className="mb-8">
              Run Tournament
            </Button>
            
            {Object.keys(tournamentResults).some(key => tournamentResults[key as PlayerType] > 0) && (
              <div className="w-full max-w-md">
                <h4 className="font-bold mb-2">Results</h4>
                <div className="border rounded overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Strategy</th>
                        <th className="p-2 text-right">Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tournamentResults)
                        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
                        .map(([strategy, score], index) => (
                          <motion.tr
                            key={strategy}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                          >
                            <td className="p-2">
                              {strategy.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </td>
                            <td className="p-2 text-right font-bold">
                              {score}
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Tournament Analysis</h4>
                  <p className="text-sm">
                    In repeated games, cooperative strategies like Tit-for-Tat often outperform purely selfish strategies.
                    This demonstrates how cooperation can emerge even in competitive environments when there's a future.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="p-4 h-[calc(100%-60px)] overflow-auto">
          {playerHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded p-4">
                    <h4 className="font-bold mb-2">Cooperation Rate</h4>
                    <div className="flex justify-between mb-1">
                      <span>You:</span>
                      <span>{(playerCooperationRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${playerCooperationRate * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mb-1 mt-4">
                      <span>Opponent:</span>
                      <span>{(opponentCooperationRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${opponentCooperationRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4">
                    <h4 className="font-bold mb-2">Average Points Per Round</h4>
                    <div className="flex justify-between mb-1">
                      <span>You:</span>
                      <span>{(playerScore / roundNumber).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(playerScore / roundNumber) / 5 * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mb-1 mt-4">
                      <span>Opponent:</span>
                      <span>{(opponentScore / roundNumber).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${(opponentScore / roundNumber) / 5 * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border rounded p-4">
                  <h4 className="font-bold mb-2">Outcome Distribution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { 
                        label: "Mutual Cooperation", 
                        count: playerHistory.filter((move, i) => move === "cooperate" && opponentHistory[i] === "cooperate").length,
                        color: "bg-green-500" 
                      },
                      { 
                        label: "Mutual Defection", 
                        count: playerHistory.filter((move, i) => move === "defect" && opponentHistory[i] === "defect").length,
                        color: "bg-amber-500" 
                      },
                      { 
                        label: "You Exploited", 
                        count: playerHistory.filter((move, i) => move === "defect" && opponentHistory[i] === "cooperate").length,
                        color: "bg-blue-500" 
                      },
                      { 
                        label: "You Were Exploited", 
                        count: playerHistory.filter((move, i) => move === "cooperate" && opponentHistory[i] === "defect").length,
                        color: "bg-red-500" 
                      }
                    ].map((outcome) => (
                      <div key={outcome.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{outcome.label}:</span>
                          <span className="text-sm">{outcome.count} ({((outcome.count / roundNumber) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className={`${outcome.color} h-2.5 rounded-full`}
                            style={{ width: `${(outcome.count / roundNumber) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Strategy Analysis</h3>
                <div className="border rounded p-4">
                  <h4 className="font-bold mb-2">Pattern Recognition</h4>
                  <p className="text-sm mb-4">
                    Analysis of your strategy patterns and their effectiveness:
                  </p>
                  
                  {/* Conditional strategy analysis */}
                  {playerHistory.length >= 5 && (
                    <div>
                      {playerCooperationRate > 0.7 && (
                        <p className="text-sm mb-2">
                          <span className="font-bold">Highly Cooperative:</span> You tend to cooperate frequently. This works well against cooperative opponents but can be exploited.
                        </p>
                      )}
                      
                      {playerCooperationRate < 0.3 && (
                        <p className="text-sm mb-2">
                          <span className="font-bold">Highly Competitive:</span> You tend to defect frequently. This can yield short-term gains but may lead to mutual defection cycles.
                        </p>
                      )}
                      
                      {playerHistory.filter((move, i, arr) => i > 0 && move === arr[i-1]).length / (playerHistory.length - 1) > 0.7 && (
                        <p className="text-sm mb-2">
                          <span className="font-bold">Consistent:</span> You tend to repeat your previous move. This creates predictable patterns.
                        </p>
                      )}
                      
                      {playerHistory.filter((move, i, arr) => i > 0 && move !== arr[i-1]).length / (playerHistory.length - 1) > 0.7 && (
                        <p className="text-sm mb-2">
                          <span className="font-bold">Alternating:</span> You frequently switch between cooperation and defection. This can be unpredictable but potentially suboptimal.
                        </p>
                      )}
                      
                      {playerHistory.filter((move, i) => i > 0 && move === opponentHistory[i-1]).length / (playerHistory.length - 1) > 0.7 && (
                        <p className="text-sm mb-2">
                          <span className="font-bold">Responsive:</span> You tend to mirror your opponent's previous move, similar to Tit-for-Tat.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {playerHistory.length < 5 && (
                    <p className="text-sm text-muted-foreground">
                      Play more rounds to see strategy analysis.
                    </p>
                  )}
                </div>
                
                <div className="mt-4 border rounded p-4">
                  <h4 className="font-bold mb-2">Recommendation</h4>
                  {playerHistory.length >= 5 ? (
                    <div>
                      {playerScore < opponentScore && (
                        <p className="text-sm mb-2">
                          Your current approach is yielding suboptimal results. Consider adapting your strategy based on your opponent's behavior pattern.
                        </p>
                      )}
                      
                      {playerScore >= opponentScore && (
                        <p className="text-sm mb-2">
                          Your strategy is performing well against the current opponent. Continue observing patterns to maintain your advantage.
                        </p>
                      )}
                      
                      {opponentType === "tit-for-tat" && playerCooperationRate < 0.5 && (
                        <p className="text-sm mb-2">
                          Against Tit-for-Tat, consistent cooperation typically yields better long-term results than defection.
                        </p>
                      )}
                      
                      {opponentType === "always-defect" && playerCooperationRate > 0.5 && (
                        <p className="text-sm mb-2">
                          Against an Always Defect opponent, cooperation is consistently exploited. Consider matching their defection.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Play more rounds to receive strategy recommendations.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p>Play some rounds to generate statistics.</p>
              <Button onClick={() => setActiveTab("game")} className="mt-4">
                Go to Game
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EnhancedPrisonersDilemma; 