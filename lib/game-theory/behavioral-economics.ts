/**
 * Behavioral Game Theory Implementation
 * 
 * This module provides implementations of various behavioral game theory models
 * including quantal response equilibrium, level-k thinking, prospect theory,
 * and social preference models.
 */

/**
 * Represents a game in normal form
 */
export interface NormalFormGame {
  players: number;
  strategies: number[];
  payoffs: number[][][];
}

/**
 * Represents a mixed strategy profile
 */
export type MixedStrategy = number[][];

/**
 * Represents a behavioral player type
 */
export enum BehavioralType {
  Rational = 'rational',
  LevelK = 'level-k',
  QuartalResponse = 'qre',
  ProspectTheory = 'prospect-theory',
  InequalityAverse = 'inequality-averse',
  Reciprocal = 'reciprocal',
  Altruistic = 'altruistic'
}

/**
 * Parameters for behavioral models
 */
export interface BehavioralParameters {
  lambda?: number;        // QRE rationality parameter
  level?: number;         // Level-k thinking level
  alpha?: number;         // Inequality aversion (disadvantageous)
  beta?: number;          // Inequality aversion (advantageous)
  delta?: number;         // Reciprocity parameter
  gamma?: number;         // Altruism parameter
  referencePt?: number;   // Prospect theory reference point
  lossPower?: number;     // Prospect theory loss aversion power
  gainPower?: number;     // Prospect theory gain sensitivity power
  lossAversion?: number;  // Prospect theory loss aversion coefficient
}

/**
 * Calculates the expected payoff for a player given a strategy profile
 * @param game - Normal form game
 * @param player - Player index
 * @param strategy - Pure strategy index
 * @param profile - Mixed strategy profile
 * @returns Expected payoff
 */
export function expectedPayoff(
  game: NormalFormGame,
  player: number,
  strategy: number,
  profile: MixedStrategy
): number {
  const { players, strategies, payoffs } = game;
  
  // For a 2-player game
  if (players === 2) {
    let sum = 0;
    for (let j = 0; j < strategies[1]; j++) {
      sum += profile[1][j] * payoffs[player][strategy][j];
    }
    return sum;
  }
  
  // For games with more players, we need to calculate over all strategy combinations
  // This is a simplified approach that doesn't scale well to many players
  let sum = 0;
  let count = 0;
  
  // Recursive function to iterate through all strategy combinations
  function iterate(currentPlayer: number, currentProfile: number[]): void {
    if (currentPlayer === players) {
      // Calculate probability of this profile
      let probability = 1;
      for (let p = 0; p < players; p++) {
        if (p !== player) {
          probability *= profile[p][currentProfile[p]];
        }
      }
      
      // Get payoff for this combination
      let payoff = payoffs[player][strategy];
      for (let p = 0; p < players; p++) {
        if (p !== player) {
          payoff = payoff[currentProfile[p]];
        }
      }
      
      sum += probability * payoff;
      count++;
      return;
    }
    
    if (currentPlayer === player) {
      // Skip the player we're calculating for
      iterate(currentPlayer + 1, currentProfile);
    } else {
      // Try each strategy for other players
      for (let s = 0; s < strategies[currentPlayer]; s++) {
        currentProfile[currentPlayer] = s;
        iterate(currentPlayer + 1, currentProfile);
      }
    }
  }
  
  iterate(0, Array(players).fill(0));
  
  return sum;
}

/**
 * Calculates the Quantal Response Equilibrium (QRE) for a game
 * @param game - Normal form game
 * @param lambda - Rationality parameter (higher = more rational)
 * @param iterations - Maximum number of iterations
 * @param tolerance - Convergence tolerance
 * @returns QRE mixed strategy profile
 */
export function calculateQRE(
  game: NormalFormGame,
  lambda: number = 1,
  iterations: number = 100,
  tolerance: number = 1e-6
): MixedStrategy {
  const { players, strategies } = game;
  
  // Initialize with uniform mixed strategies
  let profile: MixedStrategy = Array(players).fill(0).map((_, i) => 
    Array(strategies[i]).fill(1 / strategies[i])
  );
  
  for (let iter = 0; iter < iterations; iter++) {
    const newProfile: MixedStrategy = Array(players).fill(0).map(() => []);
    let maxDiff = 0;
    
    // Update each player's strategy
    for (let i = 0; i < players; i++) {
      // Calculate expected payoffs for each strategy
      const expPayoffs = Array(strategies[i]).fill(0).map((_, s) => 
        expectedPayoff(game, i, s, profile)
      );
      
      // Apply logit response function
      const expLambdaPayoffs = expPayoffs.map(p => Math.exp(lambda * p));
      const sum = expLambdaPayoffs.reduce((a, b) => a + b, 0);
      
      // New mixed strategy
      newProfile[i] = expLambdaPayoffs.map(exp => exp / sum);
      
      // Track maximum difference for convergence check
      const diff = Math.max(...newProfile[i].map((p, j) => Math.abs(p - profile[i][j])));
      maxDiff = Math.max(maxDiff, diff);
    }
    
    profile = newProfile;
    
    // Check for convergence
    if (maxDiff < tolerance) {
      break;
    }
  }
  
  return profile;
}

/**
 * Represents a level-k player's belief about other players
 */
export interface LevelKBelief {
  level: number;
  strategy: number[];
}

/**
 * Calculates the best response for a level-k thinker
 * @param game - Normal form game
 * @param player - Player index
 * @param beliefs - Beliefs about other players' strategies
 * @returns Best response strategy index
 */
export function levelKBestResponse(
  game: NormalFormGame,
  player: number,
  beliefs: LevelKBelief[]
): number {
  const { strategies, payoffs } = game;
  
  // Create a profile based on beliefs
  const profile: MixedStrategy = Array(game.players).fill(0).map((_, i) => {
    if (i === player) {
      // Will be filled with best response
      return Array(strategies[i]).fill(0);
    } else {
      // Find belief about this player
      const belief = beliefs.find(b => b.player === i);
      if (belief) {
        return belief.strategy;
      } else {
        // Default to uniform if no belief
        return Array(strategies[i]).fill(1 / strategies[i]);
      }
    }
  });
  
  // Calculate expected payoff for each strategy
  const expectedPayoffs = Array(strategies[player]).fill(0).map((_, s) => 
    expectedPayoff(game, player, s, profile)
  );
  
  // Return index of strategy with highest expected payoff
  return expectedPayoffs.indexOf(Math.max(...expectedPayoffs));
}

/**
 * Generates level-k strategies for a game
 * @param game - Normal form game
 * @param maxLevel - Maximum thinking level
 * @returns Array of strategies for each level and player
 */
export function generateLevelKStrategies(
  game: NormalFormGame,
  maxLevel: number = 3
): { level: number, player: number, strategy: number[] }[] {
  const { players, strategies } = game;
  const results: { level: number, player: number, strategy: number[] }[] = [];
  
  // Level 0: Random play (uniform distribution)
  for (let i = 0; i < players; i++) {
    results.push({
      level: 0,
      player: i,
      strategy: Array(strategies[i]).fill(1 / strategies[i])
    });
  }
  
  // Higher levels
  for (let k = 1; k <= maxLevel; k++) {
    for (let i = 0; i < players; i++) {
      // Collect beliefs about other players (they are level k-1)
      const beliefs: LevelKBelief[] = [];
      
      for (let j = 0; j < players; j++) {
        if (j !== i) {
          const levelKMinus1 = results.find(r => r.level === k - 1 && r.player === j);
          if (levelKMinus1) {
            beliefs.push({
              level: k - 1,
              player: j,
              strategy: levelKMinus1.strategy
            });
          }
        }
      }
      
      // Calculate best response
      const br = levelKBestResponse(game, i, beliefs);
      
      // Create pure strategy
      const strategy = Array(strategies[i]).fill(0);
      strategy[br] = 1;
      
      results.push({
        level: k,
        player: i,
        strategy
      });
    }
  }
  
  return results;
}

/**
 * Applies prospect theory value function to a payoff
 * @param payoff - Original payoff
 * @param referencePt - Reference point
 * @param alpha - Power for gains
 * @param beta - Power for losses
 * @param lambda - Loss aversion coefficient
 * @returns Prospect theory transformed payoff
 */
export function prospectTheoryValue(
  payoff: number,
  referencePt: number = 0,
  alpha: number = 0.88,
  beta: number = 0.88,
  lambda: number = 2.25
): number {
  const gain = payoff - referencePt;
  
  if (gain >= 0) {
    return Math.pow(gain, alpha);
  } else {
    return -lambda * Math.pow(-gain, beta);
  }
}

/**
 * Probability weighting function for prospect theory
 * @param p - Original probability
 * @param gamma - Weighting parameter
 * @returns Weighted probability
 */
export function probabilityWeighting(p: number, gamma: number = 0.61): number {
  return Math.pow(p, gamma) / Math.pow(Math.pow(p, gamma) + Math.pow(1 - p, gamma), 1 / gamma);
}

/**
 * Calculates the expected utility under prospect theory
 * @param outcomes - Possible payoff outcomes
 * @param probabilities - Probabilities of outcomes
 * @param params - Prospect theory parameters
 * @returns Prospect theory expected utility
 */
export function prospectTheoryUtility(
  outcomes: number[],
  probabilities: number[],
  params: BehavioralParameters = {}
): number {
  const {
    referencePt = 0,
    gainPower = 0.88,
    lossPower = 0.88,
    lossAversion = 2.25
  } = params;
  
  let utility = 0;
  
  for (let i = 0; i < outcomes.length; i++) {
    const value = prospectTheoryValue(
      outcomes[i],
      referencePt,
      gainPower,
      lossPower,
      lossAversion
    );
    
    const weight = probabilityWeighting(probabilities[i]);
    utility += value * weight;
  }
  
  return utility;
}

/**
 * Calculates utility with inequality aversion (Fehr-Schmidt model)
 * @param ownPayoff - Player's own payoff
 * @param otherPayoffs - Other players' payoffs
 * @param alpha - Disadvantageous inequality aversion
 * @param beta - Advantageous inequality aversion
 * @returns Utility with inequality aversion
 */
export function inequalityAverseUtility(
  ownPayoff: number,
  otherPayoffs: number[],
  alpha: number = 0.5,
  beta: number = 0.3
): number {
  const n = otherPayoffs.length + 1; // Total number of players
  
  // Disadvantageous inequality (others doing better than me)
  const disadvantageous = otherPayoffs
    .filter(p => p > ownPayoff)
    .reduce((sum, p) => sum + (p - ownPayoff), 0) / (n - 1);
  
  // Advantageous inequality (me doing better than others)
  const advantageous = otherPayoffs
    .filter(p => p < ownPayoff)
    .reduce((sum, p) => sum + (ownPayoff - p), 0) / (n - 1);
  
  return ownPayoff - alpha * disadvantageous - beta * advantageous;
}

/**
 * Calculates utility with reciprocity concerns
 * @param ownPayoff - Player's own payoff
 * @param otherPayoffs - Other players' payoffs
 * @param intentions - Perceived kindness of others' actions (-1 to 1)
 * @param delta - Reciprocity parameter
 * @returns Utility with reciprocity
 */
export function reciprocityUtility(
  ownPayoff: number,
  otherPayoffs: number[],
  intentions: number[],
  delta: number = 0.5
): number {
  let reciprocityTerm = 0;
  
  for (let i = 0; i < otherPayoffs.length; i++) {
    reciprocityTerm += intentions[i] * otherPayoffs[i];
  }
  
  return ownPayoff + delta * reciprocityTerm;
}

/**
 * Calculates utility with altruism
 * @param ownPayoff - Player's own payoff
 * @param otherPayoffs - Other players' payoffs
 * @param gamma - Altruism parameter
 * @returns Utility with altruism
 */
export function altruisticUtility(
  ownPayoff: number,
  otherPayoffs: number[],
  gamma: number = 0.3
): number {
  const otherSum = otherPayoffs.reduce((sum, p) => sum + p, 0);
  return ownPayoff + gamma * otherSum;
}

/**
 * Simulates learning in games using reinforcement learning
 * @param game - Normal form game
 * @param iterations - Number of iterations
 * @param learningRate - Learning rate parameter
 * @param explorationRate - Exploration rate parameter
 * @returns Final strategy profile and history
 */
export function reinforcementLearning(
  game: NormalFormGame,
  iterations: number = 1000,
  learningRate: number = 0.1,
  explorationRate: number = 0.2
): {
  profile: MixedStrategy;
  history: {
    iteration: number;
    actions: number[];
    payoffs: number[];
    profile: MixedStrategy;
  }[];
} {
  const { players, strategies } = game;
  
  // Initialize propensities (action values)
  const propensities: number[][] = Array(players).fill(0).map((_, i) => 
    Array(strategies[i]).fill(1)
  );
  
  // Initialize mixed strategies
  let profile: MixedStrategy = Array(players).fill(0).map((_, i) => 
    Array(strategies[i]).fill(1 / strategies[i])
  );
  
  const history: {
    iteration: number;
    actions: number[];
    payoffs: number[];
    profile: MixedStrategy;
  }[] = [];
  
  for (let iter = 0; iter < iterations; iter++) {
    // Choose actions based on current propensities with exploration
    const actions: number[] = [];
    
    for (let i = 0; i < players; i++) {
      if (Math.random() < explorationRate) {
        // Random exploration
        actions[i] = Math.floor(Math.random() * strategies[i]);
      } else {
        // Exploitation based on propensities
        const probs = propensities[i].map(p => p / propensities[i].reduce((a, b) => a + b, 0));
        let r = Math.random();
        let cumProb = 0;
        
        for (let s = 0; s < strategies[i]; s++) {
          cumProb += probs[s];
          if (r <= cumProb) {
            actions[i] = s;
            break;
          }
        }
      }
    }
    
    // Calculate payoffs
    const payoffs: number[] = Array(players).fill(0);
    
    // For a 2-player game
    if (players === 2) {
      payoffs[0] = game.payoffs[0][actions[0]][actions[1]];
      payoffs[1] = game.payoffs[1][actions[0]][actions[1]];
    } else {
      // For games with more players (simplified)
      for (let i = 0; i < players; i++) {
        let payoff = game.payoffs[i];
        for (let j = 0; j < players; j++) {
          payoff = payoff[actions[j]];
        }
        payoffs[i] = payoff;
      }
    }
    
    // Update propensities
    for (let i = 0; i < players; i++) {
      for (let s = 0; s < strategies[i]; s++) {
        if (s === actions[i]) {
          // Update chosen action
          propensities[i][s] = (1 - learningRate) * propensities[i][s] + learningRate * payoffs[i];
        } else {
          // Decay unchosen actions
          propensities[i][s] = (1 - learningRate) * propensities[i][s];
        }
      }
      
      // Update mixed strategy
      const sum = propensities[i].reduce((a, b) => a + b, 0);
      profile[i] = propensities[i].map(p => p / sum);
    }
    
    // Record history
    history.push({
      iteration: iter,
      actions: [...actions],
      payoffs: [...payoffs],
      profile: profile.map(p => [...p])
    });
  }
  
  return { profile, history };
}

/**
 * Calculates the Experience-Weighted Attraction (EWA) learning model
 * @param game - Normal form game
 * @param iterations - Number of iterations
 * @param params - EWA parameters
 * @returns Final strategy profile and history
 */
export function experienceWeightedAttraction(
  game: NormalFormGame,
  iterations: number = 1000,
  params: {
    delta: number;  // Imagination factor
    phi: number;    // Experience decay
    rho: number;    // Attraction decay
    lambda: number; // Response sensitivity
  } = { delta: 0.5, phi: 0.9, rho: 0.9, lambda: 1 }
): {
  profile: MixedStrategy;
  history: {
    iteration: number;
    actions: number[];
    payoffs: number[];
    profile: MixedStrategy;
  }[];
} {
  const { players, strategies } = game;
  const { delta, phi, rho, lambda } = params;
  
  // Initialize attractions
  const attractions: number[][] = Array(players).fill(0).map((_, i) => 
    Array(strategies[i]).fill(0)
  );
  
  // Initialize experience weights
  let experiences = Array(players).fill(1);
  
  // Initialize mixed strategies
  let profile: MixedStrategy = Array(players).fill(0).map((_, i) => 
    Array(strategies[i]).fill(1 / strategies[i])
  );
  
  const history: {
    iteration: number;
    actions: number[];
    payoffs: number[];
    profile: MixedStrategy;
  }[] = [];
  
  for (let iter = 0; iter < iterations; iter++) {
    // Choose actions based on current attractions
    const actions: number[] = [];
    
    for (let i = 0; i < players; i++) {
      // Convert attractions to probabilities using logit
      const expAttractions = attractions[i].map(a => Math.exp(lambda * a));
      const sumExpAttractions = expAttractions.reduce((a, b) => a + b, 0);
      const probs = expAttractions.map(exp => exp / sumExpAttractions);
      
      // Sample action
      let r = Math.random();
      let cumProb = 0;
      
      for (let s = 0; s < strategies[i]; s++) {
        cumProb += probs[s];
        if (r <= cumProb) {
          actions[i] = s;
          break;
        }
      }
    }
    
    // Calculate payoffs
    const payoffs: number[] = Array(players).fill(0);
    
    // For a 2-player game
    if (players === 2) {
      payoffs[0] = game.payoffs[0][actions[0]][actions[1]];
      payoffs[1] = game.payoffs[1][actions[0]][actions[1]];
    } else {
      // For games with more players (simplified)
      for (let i = 0; i < players; i++) {
        let payoff = game.payoffs[i];
        for (let j = 0; j < players; j++) {
          payoff = payoff[actions[j]];
        }
        payoffs[i] = payoff;
      }
    }
    
    // Update attractions using EWA
    for (let i = 0; i < players; i++) {
      // Update experience
      experiences[i] = phi * experiences[i] + 1;
      
      for (let s = 0; s < strategies[i]; s++) {
        // Calculate payoff for strategy s (actual or foregone)
        let strategyPayoff;
        
        if (s === actions[i]) {
          // Actual payoff for chosen strategy
          strategyPayoff = payoffs[i];
        } else {
          // Foregone payoff for unchosen strategy
          // We need to calculate what the payoff would have been
          const hypotheticalActions = [...actions];
          hypotheticalActions[i] = s;
          
          if (players === 2) {
            strategyPayoff = game.payoffs[i][hypotheticalActions[0]][hypotheticalActions[1]];
          } else {
            // Simplified for more players
            let payoff = game.payoffs[i];
            for (let j = 0; j < players; j++) {
              payoff = payoff[hypotheticalActions[j]];
            }
            strategyPayoff = payoff;
          }
        }
        
        // Update attraction
        attractions[i][s] = (phi * experiences[i] * attractions[i][s] + 
          (s === actions[i] ? 1 : delta) * strategyPayoff) / 
          (phi * experiences[i] + (s === actions[i] ? 1 : delta));
      }
      
      // Update mixed strategy
      const expAttractions = attractions[i].map(a => Math.exp(lambda * a));
      const sumExpAttractions = expAttractions.reduce((a, b) => a + b, 0);
      profile[i] = expAttractions.map(exp => exp / sumExpAttractions);
    }
    
    // Record history
    history.push({
      iteration: iter,
      actions: [...actions],
      payoffs: [...payoffs],
      profile: profile.map(p => [...p])
    });
  }
  
  return { profile, history };
}