/**
 * Cooperative Game Theory Implementation
 * 
 * This module provides implementations of various cooperative game theory concepts
 * including Shapley value calculations, core solution concepts, and coalition formation.
 */

/**
 * Represents a coalition in a cooperative game
 */
export interface Coalition {
  players: number[];
  value: number;
}

/**
 * Characteristic function that maps coalitions to their values
 */
export type CharacteristicFunction = (coalition: number[]) => number;

/**
 * Solution concept for a cooperative game
 */
export interface Solution {
  type: string;
  allocation: number[];
  properties: {
    isEfficient: boolean;
    isIndividuallyRational: boolean;
    isInCore?: boolean;
    isStable?: boolean;
  };
}

/**
 * Calculates the Shapley value for each player in a cooperative game
 * @param n - Number of players
 * @param characteristicFunction - Function that returns the value of any coalition
 * @returns Array of Shapley values, one for each player
 */
export function calculateShapleyValues(
  n: number,
  characteristicFunction: CharacteristicFunction
): number[] {
  const shapleyValues: number[] = Array(n).fill(0);
  
  // Generate all possible coalitions
  const allCoalitions = generateAllCoalitions(n);
  
  // Calculate marginal contributions for each player in each coalition
  for (let player = 0; player < n; player++) {
    let totalMarginalContribution = 0;
    let totalWeight = 0;
    
    // For each coalition that doesn't include the player
    for (const coalition of allCoalitions) {
      if (!coalition.includes(player)) {
        // Calculate coalition value with and without the player
        const coalitionValue = characteristicFunction(coalition);
        const coalitionWithPlayer = [...coalition, player];
        const coalitionWithPlayerValue = characteristicFunction(coalitionWithPlayer);
        
        // Marginal contribution
        const marginalContribution = coalitionWithPlayerValue - coalitionValue;
        
        // Weight is based on coalition size
        const coalitionSize = coalition.length;
        const weight = factorial(coalitionSize) * factorial(n - coalitionSize - 1) / factorial(n);
        totalMarginalContribution += marginalContribution * weight;
        totalWeight += weight;
      }
    }
    
    shapleyValues[player] = totalMarginalContribution;
  }
  
  return shapleyValues;
}

/**
 * More efficient implementation of Shapley value calculation for games with many players
 * Uses sampling to approximate Shapley values
 * @param n - Number of players
 * @param characteristicFunction - Function that returns the value of any coalition
 * @param sampleSize - Number of permutations to sample
 * @returns Array of approximate Shapley values
 */
export function calculateApproximateShapleyValues(
  n: number,
  characteristicFunction: CharacteristicFunction,
  sampleSize: number = 1000
): number[] {
  const shapleyValues: number[] = Array(n).fill(0);
  
  // Sample random permutations
  for (let sample = 0; sample < sampleSize; sample++) {
    const permutation = getRandomPermutation(n);
    let coalition: number[] = [];
    
    // Process each player in the permutation
    for (const player of permutation) {
      // Calculate marginal contribution
      const coalitionValue = characteristicFunction(coalition);
      coalition.push(player);
      const newCoalitionValue = characteristicFunction(coalition);
      
      // Add marginal contribution to player's Shapley value
      shapleyValues[player] += newCoalitionValue - coalitionValue;
    }
  }
  
  // Average the values
  for (let i = 0; i < n; i++) {
    shapleyValues[i] /= sampleSize;
  }
  
  return shapleyValues;
}

/**
 * Checks if an allocation is in the core of a cooperative game
 * @param allocation - Proposed allocation of value to players
 * @param n - Number of players
 * @param characteristicFunction - Function that returns the value of any coalition
 * @returns Boolean indicating if the allocation is in the core
 */
export function isInCore(
  allocation: number[],
  n: number,
  characteristicFunction: CharacteristicFunction
): boolean {
  // Check efficiency (sum of allocations equals grand coalition value)
  const grandCoalition = Array.from({ length: n }, (_, i) => i);
  const grandCoalitionValue = characteristicFunction(grandCoalition);
  
  const sumAllocations = allocation.reduce((sum, value) => sum + value, 0);
  if (Math.abs(sumAllocations - grandCoalitionValue) > 1e-6) {
    return false;
  }
  
  // Check coalition rationality for all possible coalitions
  const allCoalitions = generateAllCoalitions(n);
  
  for (const coalition of allCoalitions) {
    if (coalition.length === 0 || coalition.length === n) continue;
    
    const coalitionValue = characteristicFunction(coalition);
    const coalitionAllocation = coalition.reduce((sum, player) => sum + allocation[player], 0);
    
    // If any coalition gets less than its value, allocation is not in core
    if (coalitionAllocation < coalitionValue - 1e-6) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculates the nucleolus of a cooperative game
 * This is a simplified implementation that may not be efficient for large games
 * @param n - Number of players
 * @param characteristicFunction - Function that returns the value of any coalition
 * @returns Nucleolus allocation
 */
export function calculateNucleolus(
  n: number,
  characteristicFunction: CharacteristicFunction
): number[] {
  // Start with Shapley value as initial allocation
  let allocation = calculateShapleyValues(n, characteristicFunction);
  
  // Grand coalition value
  const grandCoalition = Array.from({ length: n }, (_, i) => i);
  const v = characteristicFunction(grandCoalition);
  
  // Normalize to ensure efficiency
  const sumAllocations = allocation.reduce((sum, value) => sum + value, 0);
  allocation = allocation.map(value => (value / sumAllocations) * v);
  
  // Generate all coalitions except empty and grand
  const allCoalitions = generateAllCoalitions(n).filter(
    coalition => coalition.length > 0 && coalition.length < n
  );
  
  // Iterative process to find nucleolus
  const maxIterations = 100;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    // Calculate excesses for all coalitions
    const excesses: { coalition: number[], excess: number }[] = [];
    
    for (const coalition of allCoalitions) {
      const coalitionValue = characteristicFunction(coalition);
      const coalitionAllocation = coalition.reduce((sum, player) => sum + allocation[player], 0);
      const excess = coalitionValue - coalitionAllocation;
      
      excesses.push({ coalition, excess });
    }
    
    // Sort excesses in descending order
    excesses.sort((a, b) => b.excess - a.excess);
    
    // If maximum excess is very small, we're close enough to nucleolus
    if (excesses.length === 0 || Math.abs(excesses[0].excess) < 1e-6) {
      break;
    }
    
    // Find all coalitions with maximum excess
    const maxExcess = excesses[0].excess;
    const maxExcessCoalitions = excesses
      .filter(e => Math.abs(e.excess - maxExcess) < 1e-6)
      .map(e => e.coalition);
    
    // Adjust allocation to minimize maximum excess
    // This is a simplified approach - a proper implementation would use linear programming
    const step = 0.01;
    
    for (const coalition of maxExcessCoalitions) {
      const complement = grandCoalition.filter(player => !coalition.includes(player));
      
      // Transfer value from complement to coalition
      for (const player of coalition) {
        allocation[player] += step / coalition.length;
      }
      
      for (const player of complement) {
        allocation[player] -= step / complement.length;
      }
    }
    
    // Normalize to ensure efficiency
    const newSumAllocations = allocation.reduce((sum, value) => sum + value, 0);
    allocation = allocation.map(value => (value / newSumAllocations) * v);
    
    iteration++;
  }
  
  return allocation;
}

/**
 * Calculates the Banzhaf power index for a weighted voting game
 * @param weights - Array of voting weights for each player
 * @param quota - Minimum weight required for a coalition to win
 * @returns Array of Banzhaf power indices
 */
export function calculateBanzhafIndex(weights: number[], quota: number): number[] {
  const n = weights.length;
  const banzhafIndices: number[] = Array(n).fill(0);
  const totalSwings = Array(n).fill(0);
  
  // Generate all possible coalitions
  const allCoalitions = generateAllCoalitions(n);
  
  // Count swings for each player
  for (const coalition of allCoalitions) {
    const coalitionWeight = coalition.reduce((sum, player) => sum + weights[player], 0);
    
    // Check if coalition is winning
    const isWinning = coalitionWeight >= quota;
    
    // Check for critical players (swings)
    for (const player of coalition) {
      const coalitionWithoutPlayer = coalition.filter(p => p !== player);
      const weightWithoutPlayer = coalitionWithoutPlayer.reduce(
        (sum, p) => sum + weights[p], 
        0
      );
      
      // Player is critical if coalition wins with them but loses without them
      if (isWinning && weightWithoutPlayer < quota) {
        totalSwings[player]++;
      }
    }
  }
  
  // Calculate normalized Banzhaf indices
  const totalSwingsSum = totalSwings.reduce((sum, swings) => sum + swings, 0);
  
  if (totalSwingsSum > 0) {
    for (let i = 0; i < n; i++) {
      banzhafIndices[i] = totalSwings[i] / totalSwingsSum;
    }
  }
  
  return banzhafIndices;
}

/**
 * Calculates the Shapley-Shubik power index for a weighted voting game
 * @param weights - Array of voting weights for each player
 * @param quota - Minimum weight required for a coalition to win
 * @returns Array of Shapley-Shubik power indices
 */
export function calculateShapleyShubikIndex(weights: number[], quota: number): number[] {
  const n = weights.length;
  
  // Define characteristic function for the voting game
  const characteristicFunction = (coalition: number[]) => {
    const coalitionWeight = coalition.reduce((sum, player) => sum + weights[player], 0);
    return coalitionWeight >= quota ? 1 : 0;
  };
  
  // Shapley values for this game are the Shapley-Shubik indices
  return calculateShapleyValues(n, characteristicFunction);
}

/**
 * Finds a stable coalition structure using the Nash stability concept
 * @param n - Number of players
 * @param valuationFunction - Function that returns the value a player gets in a coalition
 * @returns Stable coalition structure
 */
export function findStableCoalitionStructure(
  n: number,
  valuationFunction: (player: number, coalition: number[]) => number
): number[][] {
  // Start with singleton coalitions
  let coalitionStructure: number[][] = Array.from({ length: n }, (_, i) => [i]);
  
  let stable = false;
  const maxIterations = 100;
  let iteration = 0;
  
  while (!stable && iteration < maxIterations) {
    stable = true;
    
    // Try to find a player who wants to move
    for (let player = 0; player < n; player++) {
      // Find current coalition of the player
      const currentCoalitionIndex = coalitionStructure.findIndex(
        coalition => coalition.includes(player)
      );
      
      if (currentCoalitionIndex === -1) continue;
      
      const currentCoalition = coalitionStructure[currentCoalitionIndex];
      const currentValue = valuationFunction(player, currentCoalition);
      
      // Check if player wants to move to another coalition
      let bestValue = currentValue;
      let bestCoalitionIndex = currentCoalitionIndex;
      
      for (let i = 0; i < coalitionStructure.length; i++) {
        if (i === currentCoalitionIndex) continue;
        
        const potentialCoalition = [...coalitionStructure[i], player];
        const potentialValue = valuationFunction(player, potentialCoalition);
        
        if (potentialValue > bestValue) {
          bestValue = potentialValue;
          bestCoalitionIndex = i;
        }
      }
      
      // Player wants to move
      if (bestCoalitionIndex !== currentCoalitionIndex) {
        stable = false;
        
        // Remove player from current coalition
        coalitionStructure[currentCoalitionIndex] = currentCoalition.filter(p => p !== player);
        
        // Add player to new coalition
        coalitionStructure[bestCoalitionIndex].push(player);
        
        // Remove empty coalitions
        coalitionStructure = coalitionStructure.filter(coalition => coalition.length > 0);
        
        break;
      }
    }
    
    iteration++;
  }
  
  return coalitionStructure;
}

/**
 * Implements the Nash bargaining solution for two players
 * @param disagreementPoint - Utilities if no agreement is reached [u1, u2]
 * @param paretoFrontier - Function that returns the maximum utility of player 2 given utility of player 1
 * @param precision - Precision for numerical search
 * @returns Nash bargaining solution [u1, u2]
 */
export function nashBargainingSolution(
  disagreementPoint: [number, number],
  paretoFrontier: (u1: number) => number,
  precision: number = 0.001
): [number, number] {
  const [d1, d2] = disagreementPoint;
  
  // Find the range of possible utilities for player 1
  let minU1 = d1;
  let maxU1 = d1;
  let step = 1;
  
  // Find upper bound
  while (paretoFrontier(maxU1) > d2) {
    maxU1 += step;
    step *= 2; // Exponential search
  }
  
  // Binary search for Nash bargaining solution
  let left = minU1;
  let right = maxU1;
  
  while (right - left > precision) {
    const mid = (left + right) / 2;
    const u2 = paretoFrontier(mid);
    
    // Calculate derivatives of Nash product
    const epsilon = precision / 10;
    const nashProduct = (u1: number) => (u1 - d1) * (paretoFrontier(u1) - d2);
    
    const leftProduct = nashProduct(mid - epsilon);
    const rightProduct = nashProduct(mid + epsilon);
    
    // Move towards increasing Nash product
    if (rightProduct > leftProduct) {
      left = mid;
    } else {
      right = mid;
    }
  }
  
  const u1 = (left + right) / 2;
  const u2 = paretoFrontier(u1);
  
  return [u1, u2];
}

/**
 * Helper function to generate all possible coalitions of n players
 * @param n - Number of players
 * @returns Array of all possible coalitions
 */
export function generateAllCoalitions(n: number): number[][] {
  const result: number[][] = [];
  
  // Generate all 2^n subsets
  for (let i = 0; i < (1 << n); i++) {
    const coalition: number[] = [];
    
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        coalition.push(j);
      }
    }
    
    result.push(coalition);
  }
  
  return result;
}

/**
 * Helper function to calculate factorial
 * @param n - Input number
 * @returns n!
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/**
 * Helper function to generate a random permutation of n elements
 * @param n - Number of elements
 * @returns Random permutation
 */
function getRandomPermutation(n: number): number[] {
  const array = Array.from({ length: n }, (_, i) => i);
  
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array;
}