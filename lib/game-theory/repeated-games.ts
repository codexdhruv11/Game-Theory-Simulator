/**
 * Repeated Game Theory Implementation
 * 
 * This module provides implementations of various repeated game concepts
 * including folk theorem analysis, reputation effects, and strategy evolution.
 */

/**
 * Represents a stage game in normal form
 */
export interface StageGame {
  players: number;
  strategies: number[];
  payoffs: number[][][];
}

/**
 * Represents a strategy in a repeated game
 */
export interface RepeatedGameStrategy {
  id: string;
  name: string;
  description: string;
  initialAction: number;
  nextAction: (history: number[][], player: number) => number;
}

/**
 * Represents the outcome of a repeated game
 */
export interface RepeatedGameOutcome {
  actions: number[][];
  payoffs: number[][];
  totalPayoffs: number[];
  discountedPayoffs: number[];
  averagePayoffs: number[];
}

/**
 * Classic strategies for repeated games
 */
export const ClassicStrategies = {
  AlwaysCooperate: {
    id: 'always-cooperate',
    name: 'Always Cooperate',
    description: 'Always play the cooperative action regardless of opponent\'s moves',
    initialAction: 0, // Assuming 0 is cooperate
    nextAction: () => 0
  },
  
  AlwaysDefect: {
    id: 'always-defect',
    name: 'Always Defect',
    description: 'Always play the defect action regardless of opponent\'s moves',
    initialAction: 1, // Assuming 1 is defect
    nextAction: () => 1
  },
  
  TitForTat: {
    id: 'tit-for-tat',
    name: 'Tit for Tat',
    description: 'Start with cooperation and then mimic opponent\'s previous move',
    initialAction: 0,
    nextAction: (history, player) => {
      if (history.length === 0) return 0;
      const lastRound = history[history.length - 1];
      const opponent = player === 0 ? 1 : 0;
      return lastRound[opponent];
    }
  },
  
  GrimTrigger: {
    id: 'grim-trigger',
    name: 'Grim Trigger',
    description: 'Start with cooperation but switch to defection forever if opponent ever defects',
    initialAction: 0,
    nextAction: (history, player) => {
      const opponent = player === 0 ? 1 : 0;
      for (const round of history) {
        if (round[opponent] === 1) {
          return 1; // Defect forever after opponent defects once
        }
      }
      return 0; // Otherwise cooperate
    }
  },
  
  GenerousTitForTat: {
    id: 'generous-tit-for-tat',
    name: 'Generous Tit for Tat',
    description: 'Like Tit for Tat, but occasionally forgives defection',
    initialAction: 0,
    nextAction: (history, player) => {
      if (history.length === 0) return 0;
      const lastRound = history[history.length - 1];
      const opponent = player === 0 ? 1 : 0;
      
      if (lastRound[opponent] === 1) {
        // 10% chance to forgive defection
        return Math.random() < 0.1 ? 0 : 1;
      }
      return 0;
    }
  },
  
  Pavlov: {
    id: 'pavlov',
    name: 'Pavlov',
    description: 'Win-stay, lose-shift strategy',
    initialAction: 0,
    nextAction: (history, player) => {
      if (history.length === 0) return 0;
      const lastRound = history[history.length - 1];
      const opponent = player === 0 ? 1 : 0;
      
      // If both players made the same choice, continue with current action
      // Otherwise switch
      return lastRound[player] === lastRound[opponent] ? lastRound[player] : 1 - lastRound[player];
    }
  },
  
  TwoTits: {
    id: 'two-tits',
    name: 'Two Tits for Tat',
    description: 'Like Tit for Tat, but punishes with two defections for each defection',
    initialAction: 0,
    nextAction: (history, player) => {
      if (history.length === 0) return 0;
      const opponent = player === 0 ? 1 : 0;
      
      // Check last two rounds for defection
      if (history.length >= 1 && history[history.length - 1][opponent] === 1) {
        return 1;
      }
      if (history.length >= 2 && history[history.length - 2][opponent] === 1) {
        return 1;
      }
      return 0;
    }
  },
  
  Random: {
    id: 'random',
    name: 'Random',
    description: 'Plays randomly with equal probability',
    initialAction: Math.random() < 0.5 ? 0 : 1,
    nextAction: () => Math.random() < 0.5 ? 0 : 1
  }
};

/**
 * Simulates a finitely repeated game
 * @param game - Stage game
 * @param strategies - Array of strategies for each player
 * @param rounds - Number of rounds to play
 * @param discountFactor - Discount factor for future payoffs
 * @returns Outcome of the repeated game
 */
export function simulateFiniteRepeatedGame(
  game: StageGame,
  strategies: RepeatedGameStrategy[],
  rounds: number,
  discountFactor: number = 1
): RepeatedGameOutcome {
  const { players } = game;
  
  // Initialize history and payoffs
  const actions: number[][] = [];
  const payoffs: number[][] = [];
  const totalPayoffs: number[] = Array(players).fill(0);
  const discountedPayoffs: number[] = Array(players).fill(0);
  
  // Play the game for the specified number of rounds
  for (let round = 0; round < rounds; round++) {
    const roundActions: number[] = [];
    
    // Each player chooses an action based on their strategy
    for (let i = 0; i < players; i++) {
      if (round === 0) {
        roundActions.push(strategies[i].initialAction);
      } else {
        roundActions.push(strategies[i].nextAction(actions, i));
      }
    }
    
    // Calculate payoffs for this round
    const roundPayoffs: number[] = calculatePayoffs(game, roundActions);
    
    // Update history and payoffs
    actions.push(roundActions);
    payoffs.push(roundPayoffs);
    
    // Update total and discounted payoffs
    for (let i = 0; i < players; i++) {
      totalPayoffs[i] += roundPayoffs[i];
      discountedPayoffs[i] += roundPayoffs[i] * Math.pow(discountFactor, round);
    }
  }
  
  // Calculate average payoffs
  const averagePayoffs = totalPayoffs.map(p => p / rounds);
  
  return {
    actions,
    payoffs,
    totalPayoffs,
    discountedPayoffs,
    averagePayoffs
  };
}

/**
 * Simulates an infinitely repeated game using a discount factor
 * @param game - Stage game
 * @param strategies - Array of strategies for each player
 * @param maxRounds - Maximum number of rounds to simulate
 * @param discountFactor - Discount factor for future payoffs
 * @param convergenceThreshold - Threshold for early stopping
 * @returns Outcome of the repeated game
 */
export function simulateInfiniteRepeatedGame(
  game: StageGame,
  strategies: RepeatedGameStrategy[],
  maxRounds: number = 1000,
  discountFactor: number = 0.95,
  convergenceThreshold: number = 1e-6
): RepeatedGameOutcome {
  const { players } = game;
  
  // Initialize history and payoffs
  const actions: number[][] = [];
  const payoffs: number[][] = [];
  const totalPayoffs: number[] = Array(players).fill(0);
  const discountedPayoffs: number[] = Array(players).fill(0);
  
  // Keep track of average payoffs for convergence check
  let prevAveragePayoffs: number[] = Array(players).fill(0);
  
  // Play the game for the specified number of rounds or until convergence
  for (let round = 0; round < maxRounds; round++) {
    const roundActions: number[] = [];
    
    // Each player chooses an action based on their strategy
    for (let i = 0; i < players; i++) {
      if (round === 0) {
        roundActions.push(strategies[i].initialAction);
      } else {
        roundActions.push(strategies[i].nextAction(actions, i));
      }
    }
    
    // Calculate payoffs for this round
    const roundPayoffs: number[] = calculatePayoffs(game, roundActions);
    
    // Update history and payoffs
    actions.push(roundActions);
    payoffs.push(roundPayoffs);
    
    // Update total and discounted payoffs
    for (let i = 0; i < players; i++) {
      totalPayoffs[i] += roundPayoffs[i];
      discountedPayoffs[i] += roundPayoffs[i] * Math.pow(discountFactor, round);
    }
    
    // Check for convergence every 10 rounds
    if (round > 0 && round % 10 === 0) {
      const currentAveragePayoffs = totalPayoffs.map(p => p / (round + 1));
      
      // Check if average payoffs have converged
      const maxDiff = Math.max(...currentAveragePayoffs.map(
        (p, i) => Math.abs(p - prevAveragePayoffs[i])
      ));
      
      if (maxDiff < convergenceThreshold) {
        break;
      }
      
      prevAveragePayoffs = [...currentAveragePayoffs];
    }
  }
  
  // Calculate average payoffs
  const averagePayoffs = totalPayoffs.map(p => p / actions.length);
  
  return {
    actions,
    payoffs,
    totalPayoffs,
    discountedPayoffs,
    averagePayoffs
  };
}

/**
 * Calculates the payoffs for a single round of the game
 * @param game - Stage game
 * @param actions - Array of actions chosen by each player
 * @returns Array of payoffs for each player
 */
function calculatePayoffs(game: StageGame, actions: number[]): number[] {
  const { players, payoffs } = game;
  const roundPayoffs: number[] = Array(players).fill(0);
  
  // For a 2-player game
  if (players === 2) {
    roundPayoffs[0] = payoffs[0][actions[0]][actions[1]];
    roundPayoffs[1] = payoffs[1][actions[0]][actions[1]];
  } else {
    // For games with more players (simplified)
    for (let i = 0; i < players; i++) {
      let payoff = payoffs[i];
      for (let j = 0; j < players; j++) {
        payoff = payoff[actions[j]];
      }
      roundPayoffs[i] = payoff;
    }
  }
  
  return roundPayoffs;
}

/**
 * Calculates the folk theorem bounds for a repeated game
 * @param game - Stage game
 * @returns Bounds for feasible and individually rational payoffs
 */
export function calculateFolkTheoremBounds(
  game: StageGame
): {
  minmax: number[];
  feasibleRegion: { min: number[]; max: number[] };
  individuallyRational: { min: number[]; max: number[] };
} {
  const { players, strategies, payoffs } = game;
  
  // Calculate minmax values for each player
  const minmax: number[] = [];
  
  for (let i = 0; i < players; i++) {
    // Find the minmax value for player i
    let minmaxValue = -Infinity;
    
    // For each mixed strategy profile of other players
    // (simplified: we just check pure strategies for now)
    const otherPlayerActions = generateActionProfiles(
      strategies.filter((_, j) => j !== i)
    );
    
    for (const otherActions of otherPlayerActions) {
      // Find player i's best response
      let bestResponse = -Infinity;
      
      for (let s = 0; s < strategies[i]; s++) {
        // Create full action profile
        const fullActions = [...otherActions];
        fullActions.splice(i, 0, s);
        
        // Calculate payoff
        const payoff = calculatePayoffs(game, fullActions)[i];
        bestResponse = Math.max(bestResponse, payoff);
      }
      
      // Update minmax value
      minmaxValue = Math.max(minmaxValue, bestResponse);
    }
    
    minmax.push(minmaxValue);
  }
  
  // Calculate feasible region
  const allActionProfiles = generateActionProfiles(strategies);
  const allPayoffs = allActionProfiles.map(actions => calculatePayoffs(game, actions));
  
  const feasibleMin = Array(players).fill(Infinity);
  const feasibleMax = Array(players).fill(-Infinity);
  
  for (const payoff of allPayoffs) {
    for (let i = 0; i < players; i++) {
      feasibleMin[i] = Math.min(feasibleMin[i], payoff[i]);
      feasibleMax[i] = Math.max(feasibleMax[i], payoff[i]);
    }
  }
  
  // Calculate individually rational region
  const irMin = minmax.slice();
  const irMax = feasibleMax.slice();
  
  return {
    minmax,
    feasibleRegion: { min: feasibleMin, max: feasibleMax },
    individuallyRational: { min: irMin, max: irMax }
  };
}

/**
 * Checks if a payoff profile is supportable as a subgame perfect equilibrium
 * @param game - Stage game
 * @param targetPayoffs - Target payoff profile
 * @param discountFactor - Discount factor
 * @returns Whether the payoff profile is supportable
 */
export function isPayoffSupportable(
  game: StageGame,
  targetPayoffs: number[],
  discountFactor: number
): boolean {
  // Calculate folk theorem bounds
  const { minmax, feasibleRegion } = calculateFolkTheoremBounds(game);
  
  // Check if target payoffs are in the feasible region
  for (let i = 0; i < game.players; i++) {
    if (targetPayoffs[i] < feasibleRegion.min[i] || targetPayoffs[i] > feasibleRegion.max[i]) {
      return false;
    }
  }
  
  // Check if target payoffs are individually rational
  for (let i = 0; i < game.players; i++) {
    if (targetPayoffs[i] < minmax[i]) {
      return false;
    }
  }
  
  // Check if discount factor is high enough (simplified check)
  // For a more precise check, we would need to calculate the exact threshold
  const maxPayoff = Math.max(...feasibleRegion.max);
  const maxGain = maxPayoff - Math.min(...targetPayoffs);
  
  return discountFactor >= 1 - 1 / (1 + maxGain);
}

/**
 * Runs a tournament between different strategies
 * @param game - Stage game
 * @param strategies - Array of strategies to compete
 * @param rounds - Number of rounds per match
 * @param discountFactor - Discount factor
 * @returns Tournament results
 */
export function runTournament(
  game: StageGame,
  strategies: RepeatedGameStrategy[],
  rounds: number,
  discountFactor: number = 0.95
): {
  scores: { [id: string]: number };
  matches: { strategies: [string, string]; payoffs: [number, number] }[];
  ranking: string[];
} {
  const scores: { [id: string]: number } = {};
  const matches: { strategies: [string, string]; payoffs: [number, number] }[] = [];
  
  // Initialize scores
  strategies.forEach(s => {
    scores[s.id] = 0;
  });
  
  // Run matches between all pairs of strategies
  for (let i = 0; i < strategies.length; i++) {
    for (let j = i; j < strategies.length; j++) {
      // Strategy pair
      const strategy1 = strategies[i];
      const strategy2 = strategies[j];
      
      // Run the match
      const outcome = simulateFiniteRepeatedGame(
        game,
        [strategy1, strategy2],
        rounds,
        discountFactor
      );
      
      // Update scores
      scores[strategy1.id] += outcome.discountedPayoffs[0];
      scores[strategy2.id] += outcome.discountedPayoffs[1];
      
      // Record match result
      matches.push({
        strategies: [strategy1.id, strategy2.id],
        payoffs: [outcome.discountedPayoffs[0], outcome.discountedPayoffs[1]]
      });
    }
  }
  
  // Create ranking
  const ranking = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  
  return { scores, matches, ranking };
}

/**
 * Simulates evolutionary dynamics in a population of strategies
 * @param game - Stage game
 * @param strategies - Array of strategies
 * @param initialPopulation - Initial population shares
 * @param generations - Number of generations
 * @param mutationRate - Rate of random mutation
 * @returns Population dynamics over time
 */
export function simulateEvolutionaryDynamics(
  game: StageGame,
  strategies: RepeatedGameStrategy[],
  initialPopulation: number[],
  generations: number,
  mutationRate: number = 0.01
): {
  populations: number[][];
  averagePayoffs: number[][];
} {
  const numStrategies = strategies.length;
  
  // Initialize populations and payoffs
  const populations: number[][] = [initialPopulation];
  const averagePayoffs: number[][] = [];
  
  // Run for specified number of generations
  for (let gen = 0; gen < generations; gen++) {
    const currentPop = populations[gen];
    
    // Calculate payoff matrix
    const payoffMatrix: number[][] = Array(numStrategies).fill(0).map(() => 
      Array(numStrategies).fill(0)
    );
    
    for (let i = 0; i < numStrategies; i++) {
      for (let j = 0; j < numStrategies; j++) {
        // Run a match between strategies i and j
        const outcome = simulateFiniteRepeatedGame(
          game,
          [strategies[i], strategies[j]],
          50, // Number of rounds for fitness calculation
          0.95 // Discount factor
        );
        
        payoffMatrix[i][j] = outcome.averagePayoffs[0];
      }
    }
    
    // Calculate average payoffs in current population
    const currentPayoffs: number[] = Array(numStrategies).fill(0);
    
    for (let i = 0; i < numStrategies; i++) {
      for (let j = 0; j < numStrategies; j++) {
        currentPayoffs[i] += currentPop[j] * payoffMatrix[i][j];
      }
    }
    
    averagePayoffs.push(currentPayoffs);
    
    // Calculate total payoff
    const totalPayoff = currentPayoffs.reduce(
      (sum, payoff, i) => sum + payoff * currentPop[i],
      0
    );
    
    // Calculate new population using replicator dynamics
    const newPop: number[] = Array(numStrategies).fill(0);
    
    for (let i = 0; i < numStrategies; i++) {
      // Replicator equation
      if (totalPayoff > 0) {
        newPop[i] = currentPop[i] * (currentPayoffs[i] / totalPayoff);
      } else {
        newPop[i] = currentPop[i];
      }
      
      // Apply mutation
      newPop[i] = (1 - mutationRate) * newPop[i] + mutationRate / numStrategies;
    }
    
    // Normalize to ensure population sums to 1
    const popSum = newPop.reduce((sum, p) => sum + p, 0);
    for (let i = 0; i < numStrategies; i++) {
      newPop[i] /= popSum;
    }
    
    // Add new population to history
    populations.push(newPop);
  }
  
  return { populations, averagePayoffs };
}

/**
 * Creates a Prisoner's Dilemma stage game
 * @param r - Reward for mutual cooperation
 * @param p - Punishment for mutual defection
 * @param t - Temptation to defect
 * @param s - Sucker's payoff
 * @returns Stage game representing Prisoner's Dilemma
 */
export function createPrisonersDilemma(
  r: number = 3,
  p: number = 1,
  t: number = 5,
  s: number = 0
): StageGame {
  return {
    players: 2,
    strategies: [2, 2], // Each player has 2 strategies: cooperate (0) or defect (1)
    payoffs: [
      [
        [r, s], // Player 1 cooperates
        [t, p]  // Player 1 defects
      ],
      [
        [r, t], // Player 2 cooperates
        [s, p]  // Player 2 defects
      ]
    ]
  };
}

/**
 * Helper function to generate all possible action profiles
 * @param strategies - Array of strategy counts for each player
 * @returns Array of all possible action profiles
 */
function generateActionProfiles(strategies: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = Array(strategies.length).fill(0);
  
  function generate(player: number): void {
    if (player === strategies.length) {
      result.push([...current]);
      return;
    }
    
    for (let action = 0; action < strategies[player]; action++) {
      current[player] = action;
      generate(player + 1);
    }
  }
  
  generate(0);
  return result;
}

/**
 * Creates a conditional strategy based on a finite state machine
 * @param name - Strategy name
 * @param description - Strategy description
 * @param states - Number of states
 * @param initialState - Initial state
 * @param transitions - State transition function
 * @param outputs - Output function (state -> action)
 * @returns Conditional strategy
 */
export function createConditionalStrategy(
  name: string,
  description: string,
  states: number,
  initialState: number,
  transitions: (state: number, opponentAction: number) => number,
  outputs: (state: number) => number
): RepeatedGameStrategy {
  const id = name.toLowerCase().replace(/\s+/g, '-');
  let currentState = initialState;
  
  return {
    id,
    name,
    description,
    initialAction: outputs(initialState),
    nextAction: (history, player) => {
      if (history.length === 0) return outputs(initialState);
      
      const lastRound = history[history.length - 1];
      const opponent = player === 0 ? 1 : 0;
      const opponentAction = lastRound[opponent];
      
      // Update state based on opponent's action
      currentState = transitions(currentState, opponentAction);
      
      // Return action based on new state
      return outputs(currentState);
    }
  };
}