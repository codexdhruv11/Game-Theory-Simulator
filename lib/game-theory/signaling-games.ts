/**
 * Signaling Game Theory Implementation
 * 
 * This module provides implementations of various signaling game concepts
 * including Perfect Bayesian equilibrium calculations, separating and pooling equilibria,
 * and specific signaling models.
 */

/**
 * Represents a player type in a signaling game
 */
export interface PlayerType {
  id: string;
  probability: number;  // Prior probability of this type
  signalCosts: number[];  // Cost of each signal for this type
  payoffs: number[][];  // Payoffs for each (signal, action) pair
}

/**
 * Represents a signaling game
 */
export interface SignalingGame {
  types: PlayerType[];
  signals: string[];
  actions: string[];
  receiverPayoffs: number[][][];  // [type][signal][action]
}

/**
 * Represents a strategy in a signaling game
 */
export interface SignalingStrategy {
  senderStrategy: number[][];  // Probability of each signal for each type
  receiverStrategy: number[][];  // Probability of each action for each signal
  beliefs: number[][];  // Posterior beliefs about types for each signal
}

/**
 * Represents an equilibrium in a signaling game
 */
export interface SignalingEquilibrium extends SignalingStrategy {
  type: 'separating' | 'pooling' | 'semi-pooling' | 'hybrid';
  welfare: {
    sender: number;
    receiver: number;
    total: number;
  };
  isEfficient: boolean;
}

/**
 * Checks if a strategy profile is a Perfect Bayesian Equilibrium (PBE)
 * @param game - Signaling game
 * @param strategy - Strategy profile to check
 * @returns Whether the strategy is a PBE and why
 */
export function isPerfectBayesianEquilibrium(
  game: SignalingGame,
  strategy: SignalingStrategy
): { isPBE: boolean; reason?: string } {
  const { types, signals, actions } = game;
  const { senderStrategy, receiverStrategy, beliefs } = strategy;
  
  // Check if sender strategies are optimal given receiver strategies
  for (let t = 0; t < types.length; t++) {
    const type = types[t];
    
    // Find the best signal for this type
    let bestSignal = 0;
    let bestPayoff = -Infinity;
    
    for (let s = 0; s < signals.length; s++) {
      let expectedPayoff = 0;
      
      for (let a = 0; a < actions.length; a++) {
        expectedPayoff += receiverStrategy[s][a] * (type.payoffs[s][a] - type.signalCosts[s]);
      }
      
      if (expectedPayoff > bestPayoff) {
        bestPayoff = expectedPayoff;
        bestSignal = s;
      }
    }
    
    // Check if the sender is playing optimally
    for (let s = 0; s < signals.length; s++) {
      if (senderStrategy[t][s] > 0 && s !== bestSignal) {
        // Sender is putting positive probability on a suboptimal signal
        return {
          isPBE: false,
          reason: `Type ${type.id} is using suboptimal signal ${signals[s]}`
        };
      }
    }
  }
  
  // Check if receiver strategies are optimal given beliefs
  for (let s = 0; s < signals.length; s++) {
    // Check if this signal is ever sent
    const signalUsed = types.some((_, t) => senderStrategy[t][s] > 0);
    
    if (signalUsed) {
      // Find the best action given beliefs
      let bestAction = 0;
      let bestPayoff = -Infinity;
      
      for (let a = 0; a < actions.length; a++) {
        let expectedPayoff = 0;
        
        for (let t = 0; t < types.length; t++) {
          expectedPayoff += beliefs[s][t] * game.receiverPayoffs[t][s][a];
        }
        
        if (expectedPayoff > bestPayoff) {
          bestPayoff = expectedPayoff;
          bestAction = a;
        }
      }
      
      // Check if the receiver is playing optimally
      for (let a = 0; a < actions.length; a++) {
        if (receiverStrategy[s][a] > 0 && a !== bestAction) {
          // Receiver is putting positive probability on a suboptimal action
          return {
            isPBE: false,
            reason: `Receiver is using suboptimal action ${actions[a]} after signal ${signals[s]}`
          };
        }
      }
    }
  }
  
  // Check if beliefs are consistent with Bayes' rule on the equilibrium path
  for (let s = 0; s < signals.length; s++) {
    // Check if this signal is ever sent
    const signalUsed = types.some((_, t) => senderStrategy[t][s] > 0);
    
    if (signalUsed) {
      // Calculate Bayesian posterior beliefs
      const bayesianBeliefs = calculatePosteriorBeliefs(game, senderStrategy, s);
      
      // Check if beliefs match Bayesian update
      for (let t = 0; t < types.length; t++) {
        if (Math.abs(beliefs[s][t] - bayesianBeliefs[t]) > 1e-6) {
          // Beliefs are inconsistent with Bayes' rule
          return {
            isPBE: false,
            reason: `Beliefs after signal ${signals[s]} are inconsistent with Bayes' rule`
          };
        }
      }
    }
  }
  
  return { isPBE: true };
}

/**
 * Calculates posterior beliefs using Bayes' rule
 * @param game - Signaling game
 * @param senderStrategy - Sender's strategy
 * @param signal - Signal index
 * @returns Posterior beliefs
 */
export function calculatePosteriorBeliefs(
  game: SignalingGame,
  senderStrategy: number[][],
  signal: number
): number[] {
  const { types } = game;
  const beliefs: number[] = Array(types.length).fill(0);
  
  // Calculate denominator (probability of observing the signal)
  let denominator = 0;
  for (let t = 0; t < types.length; t++) {
    denominator += types[t].probability * senderStrategy[t][signal];
  }
  
  // If signal is never sent, use uniform beliefs
  if (denominator === 0) {
    return types.map(() => 1 / types.length);
  }
  
  // Calculate posterior for each type
  for (let t = 0; t < types.length; t++) {
    beliefs[t] = (types[t].probability * senderStrategy[t][signal]) / denominator;
  }
  
  return beliefs;
}

/**
 * Finds separating equilibria in a signaling game
 * @param game - Signaling game
 * @returns Array of separating equilibria
 */
export function findSeparatingEquilibria(game: SignalingGame): SignalingEquilibrium[] {
  const { types, signals, actions } = game;
  
  // We'll only consider pure strategies for simplicity
  const equilibria: SignalingEquilibrium[] = [];
  
  // Try all possible separating signal assignments
  const signalAssignments = generatePermutations(signals.length, types.length);
  
  for (const assignment of signalAssignments) {
    // Check if assignment is valid (each type uses a different signal)
    if (new Set(assignment).size !== types.length) continue;
    
    // Create sender strategy
    const senderStrategy: number[][] = Array(types.length).fill(0).map(() => 
      Array(signals.length).fill(0)
    );
    
    for (let t = 0; t < types.length; t++) {
      senderStrategy[t][assignment[t]] = 1;
    }
    
    // Create receiver beliefs (perfect identification in separating equilibrium)
    const beliefs: number[][] = Array(signals.length).fill(0).map(() => 
      Array(types.length).fill(0)
    );
    
    for (let t = 0; t < types.length; t++) {
      beliefs[assignment[t]][t] = 1;
    }
    
    // Create receiver strategy (best response to beliefs)
    const receiverStrategy: number[][] = Array(signals.length).fill(0).map(() => 
      Array(actions.length).fill(0)
    );
    
    for (let s = 0; s < signals.length; s++) {
      // Find which type (if any) sends this signal
      const senderType = assignment.indexOf(s);
      
      if (senderType !== -1) {
        // Find best response to this type
        let bestAction = 0;
        let bestPayoff = -Infinity;
        
        for (let a = 0; a < actions.length; a++) {
          const payoff = game.receiverPayoffs[senderType][s][a];
          
          if (payoff > bestPayoff) {
            bestPayoff = payoff;
            bestAction = a;
          }
        }
        
        receiverStrategy[s][bestAction] = 1;
      } else {
        // Off-equilibrium signal, use arbitrary beliefs and best response
        // For simplicity, we'll believe it's type 0
        beliefs[s][0] = 1;
        
        let bestAction = 0;
        let bestPayoff = -Infinity;
        
        for (let a = 0; a < actions.length; a++) {
          const payoff = game.receiverPayoffs[0][s][a];
          
          if (payoff > bestPayoff) {
            bestPayoff = payoff;
            bestAction = a;
          }
        }
        
        receiverStrategy[s][bestAction] = 1;
      }
    }
    
    // Check if this is a PBE
    const strategy: SignalingStrategy = {
      senderStrategy,
      receiverStrategy,
      beliefs
    };
    
    const { isPBE } = isPerfectBayesianEquilibrium(game, strategy);
    
    if (isPBE) {
      // Calculate welfare
      const welfare = calculateWelfare(game, strategy);
      
      equilibria.push({
        ...strategy,
        type: 'separating',
        welfare,
        isEfficient: true // Separating equilibria are typically efficient
      });
    }
  }
  
  return equilibria;
}

/**
 * Finds pooling equilibria in a signaling game
 * @param game - Signaling game
 * @returns Array of pooling equilibria
 */
export function findPoolingEquilibria(game: SignalingGame): SignalingEquilibrium[] {
  const { types, signals, actions } = game;
  
  // We'll only consider pure strategies for simplicity
  const equilibria: SignalingEquilibrium[] = [];
  
  // Try each signal as the pooling signal
  for (let poolingSignal = 0; poolingSignal < signals.length; poolingSignal++) {
    // Create sender strategy (all types use the same signal)
    const senderStrategy: number[][] = Array(types.length).fill(0).map(() => 
      Array(signals.length).fill(0)
    );
    
    for (let t = 0; t < types.length; t++) {
      senderStrategy[t][poolingSignal] = 1;
    }
    
    // Create receiver beliefs (prior probabilities at the pooling signal)
    const beliefs: number[][] = Array(signals.length).fill(0).map(() => 
      Array(types.length).fill(0)
    );
    
    for (let t = 0; t < types.length; t++) {
      beliefs[poolingSignal][t] = types[t].probability;
    }
    
    // For off-equilibrium signals, we need to specify beliefs
    // We'll use the "most pessimistic" belief that supports the equilibrium
    for (let s = 0; s < signals.length; s++) {
      if (s !== poolingSignal) {
        // Assume it's the type that would benefit least from deviating
        // For simplicity, we'll just use type 0
        beliefs[s][0] = 1;
      }
    }
    
    // Create receiver strategy (best response to beliefs)
    const receiverStrategy: number[][] = Array(signals.length).fill(0).map(() => 
      Array(actions.length).fill(0)
    );
    
    for (let s = 0; s < signals.length; s++) {
      // Find best response given beliefs
      let bestAction = 0;
      let bestPayoff = -Infinity;
      
      for (let a = 0; a < actions.length; a++) {
        let expectedPayoff = 0;
        
        for (let t = 0; t < types.length; t++) {
          expectedPayoff += beliefs[s][t] * game.receiverPayoffs[t][s][a];
        }
        
        if (expectedPayoff > bestPayoff) {
          bestPayoff = expectedPayoff;
          bestAction = a;
        }
      }
      
      receiverStrategy[s][bestAction] = 1;
    }
    
    // Check if this is a PBE
    const strategy: SignalingStrategy = {
      senderStrategy,
      receiverStrategy,
      beliefs
    };
    
    const { isPBE } = isPerfectBayesianEquilibrium(game, strategy);
    
    if (isPBE) {
      // Calculate welfare
      const welfare = calculateWelfare(game, strategy);
      
      equilibria.push({
        ...strategy,
        type: 'pooling',
        welfare,
        isEfficient: false // Pooling equilibria are typically inefficient
      });
    }
  }
  
  return equilibria;
}

/**
 * Calculates welfare for a signaling game strategy
 * @param game - Signaling game
 * @param strategy - Strategy profile
 * @returns Welfare measures
 */
export function calculateWelfare(
  game: SignalingGame,
  strategy: SignalingStrategy
): { sender: number; receiver: number; total: number } {
  const { types, signals, actions } = game;
  const { senderStrategy, receiverStrategy } = strategy;
  
  let senderWelfare = 0;
  let receiverWelfare = 0;
  
  // Calculate expected payoffs
  for (let t = 0; t < types.length; t++) {
    const type = types[t];
    
    for (let s = 0; s < signals.length; s++) {
      if (senderStrategy[t][s] > 0) {
        for (let a = 0; a < actions.length; a++) {
          if (receiverStrategy[s][a] > 0) {
            const probability = type.probability * senderStrategy[t][s] * receiverStrategy[s][a];
            
            // Sender payoff includes signal cost
            senderWelfare += probability * (type.payoffs[s][a] - type.signalCosts[s]);
            
            // Receiver payoff
            receiverWelfare += probability * game.receiverPayoffs[t][s][a];
          }
        }
      }
    }
  }
  
  return {
    sender: senderWelfare,
    receiver: receiverWelfare,
    total: senderWelfare + receiverWelfare
  };
}

/**
 * Creates a job market signaling model (Spence model)
 * @param highProductivity - Productivity of high-type workers
 * @param lowProductivity - Productivity of low-type workers
 * @param highTypeProportion - Proportion of high-type workers
 * @param educationCostHigh - Cost of education for high-type workers
 * @param educationCostLow - Cost of education for low-type workers
 * @returns Signaling game representing the job market
 */
export function createJobMarketSignalingModel(
  highProductivity: number,
  lowProductivity: number,
  highTypeProportion: number,
  educationCostHigh: number,
  educationCostLow: number
): SignalingGame {
  // Types: High productivity, Low productivity
  const types: PlayerType[] = [
    {
      id: 'high',
      probability: highTypeProportion,
      signalCosts: [0, educationCostHigh], // No education, Education
      payoffs: [
        [lowProductivity, lowProductivity], // No education: get low wage regardless of action
        [lowProductivity, highProductivity]  // Education: low wage if not hired, high wage if hired
      ]
    },
    {
      id: 'low',
      probability: 1 - highTypeProportion,
      signalCosts: [0, educationCostLow], // No education, Education
      payoffs: [
        [lowProductivity, lowProductivity], // No education: get low wage regardless of action
        [lowProductivity, highProductivity]  // Education: low wage if not hired, high wage if hired
      ]
    }
  ];
  
  // Signals: No education, Education
  const signals = ['no-education', 'education'];
  
  // Actions: Offer low wage, Offer high wage
  const actions = ['low-wage', 'high-wage'];
  
  // Receiver payoffs: employer gets productivity minus wage
  const receiverPayoffs: number[][][] = [
    // High type
    [
      [0, highProductivity - lowProductivity], // No education
      [0, highProductivity - highProductivity]  // Education
    ],
    // Low type
    [
      [0, lowProductivity - lowProductivity], // No education
      [0, lowProductivity - highProductivity]  // Education
    ]
  ];
  
  return {
    types,
    signals,
    actions,
    receiverPayoffs
  };
}

/**
 * Creates a cheap talk game
 * @param senderPreferences - Sender's preferred action for each state
 * @param receiverPreferences - Receiver's preferred action for each state
 * @param stateProbabilities - Prior probabilities of each state
 * @returns Signaling game representing the cheap talk scenario
 */
export function createCheapTalkGame(
  senderPreferences: number[][],
  receiverPreferences: number[][],
  stateProbabilities: number[]
): SignalingGame {
  const numStates = senderPreferences.length;
  const numActions = senderPreferences[0].length;
  
  // Types: Each state is a type
  const types: PlayerType[] = Array(numStates).fill(0).map((_, i) => ({
    id: `state-${i}`,
    probability: stateProbabilities[i],
    signalCosts: Array(numStates).fill(0), // Cheap talk has no cost
    payoffs: Array(numStates).fill(0).map(() => senderPreferences[i])
  }));
  
  // Signals: One message for each state
  const signals = Array(numStates).fill(0).map((_, i) => `message-${i}`);
  
  // Actions: One action for each possible action
  const actions = Array(numActions).fill(0).map((_, i) => `action-${i}`);
  
  // Receiver payoffs
  const receiverPayoffs: number[][][] = Array(numStates).fill(0).map((_, state) => 
    Array(numStates).fill(0).map(() => receiverPreferences[state])
  );
  
  return {
    types,
    signals,
    actions,
    receiverPayoffs
  };
}

/**
 * Helper function to generate all permutations of k elements from n
 * @param n - Total number of elements
 * @param k - Number of elements to select
 * @returns Array of permutations
 */
function generatePermutations(n: number, k: number): number[][] {
  if (k === 0) return [[]];
  
  const result: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    const subPermutations = generatePermutations(n, k - 1);
    
    for (const perm of subPermutations) {
      result.push([i, ...perm]);
    }
  }
  
  return result;
}