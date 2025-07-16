/**
 * Network Game Theory Implementation
 * 
 * This module provides implementations of various network game theory concepts
 * including graph generation, coordination games on networks, contagion models,
 * and network formation games.
 */

/**
 * Types of network structures
 */
export enum NetworkType {
  Random = 'random',
  SmallWorld = 'small-world',
  ScaleFree = 'scale-free',
  Regular = 'regular',
  Complete = 'complete',
  Star = 'star',
  Custom = 'custom'
}

/**
 * Node in a network
 */
export interface NetworkNode {
  id: string;
  strategy: number;
  payoff: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  neighbors?: string[];
  centrality?: {
    degree?: number;
    betweenness?: number;
    closeness?: number;
  };
}

/**
 * Edge in a network
 */
export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  id?: string;
}

/**
 * Network structure
 */
export interface Network {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  type: NetworkType;
}

/**
 * Game payoff matrix
 */
export interface PayoffMatrix {
  [strategy1: number]: {
    [strategy2: number]: number;
  };
}

/**
 * Creates a random network using the Erdős–Rényi model
 * @param numNodes - Number of nodes
 * @param probability - Probability of edge creation between any two nodes
 * @returns Random network
 */
export function createRandomNetwork(numNodes: number, probability: number): Network {
  const nodes: NetworkNode[] = Array.from({ length: numNodes }, (_, i) => ({
    id: `node-${i}`,
    strategy: 0,
    payoff: 0
  }));

  const edges: NetworkEdge[] = [];
  
  // Create edges with given probability
  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      if (Math.random() < probability) {
        edges.push({
          source: nodes[i].id,
          target: nodes[j].id,
          weight: 1,
          id: `edge-${i}-${j}`
        });
      }
    }
  }

  return {
    nodes,
    edges,
    type: NetworkType.Random
  };
}

/**
 * Creates a small-world network using the Watts-Strogatz model
 * @param numNodes - Number of nodes
 * @param k - Each node is connected to k nearest neighbors
 * @param beta - Rewiring probability
 * @returns Small-world network
 */
export function createSmallWorldNetwork(numNodes: number, k: number, beta: number): Network {
  // Ensure k is even
  k = k % 2 === 0 ? k : k + 1;
  
  const nodes: NetworkNode[] = Array.from({ length: numNodes }, (_, i) => ({
    id: `node-${i}`,
    strategy: 0,
    payoff: 0
  }));

  // Create a regular ring lattice
  const edges: NetworkEdge[] = [];
  for (let i = 0; i < numNodes; i++) {
    for (let j = 1; j <= k / 2; j++) {
      const target = (i + j) % numNodes;
      edges.push({
        source: nodes[i].id,
        target: nodes[target].id,
        weight: 1,
        id: `edge-${i}-${target}`
      });
    }
  }

  // Rewire edges with probability beta
  for (const edge of edges) {
    if (Math.random() < beta) {
      const sourceId = edge.source;
      let targetId: string;
      
      // Find a new target that is not the source and not already connected
      do {
        const randomNodeIndex = Math.floor(Math.random() * numNodes);
        targetId = nodes[randomNodeIndex].id;
      } while (
        targetId === sourceId ||
        edges.some(e => 
          (e.source === sourceId && e.target === targetId) ||
          (e.source === targetId && e.target === sourceId)
        )
      );
      
      edge.target = targetId;
      edge.id = `edge-${sourceId}-${targetId}`;
    }
  }

  return {
    nodes,
    edges,
    type: NetworkType.SmallWorld
  };
}

/**
 * Creates a scale-free network using the Barabási–Albert model
 * @param numNodes - Number of nodes
 * @param m - Number of edges to attach from a new node to existing nodes
 * @returns Scale-free network
 */
export function createScaleFreeNetwork(numNodes: number, m: number): Network {
  // Start with a complete graph of m nodes
  const nodes: NetworkNode[] = Array.from({ length: m }, (_, i) => ({
    id: `node-${i}`,
    strategy: 0,
    payoff: 0,
    neighbors: []
  }));

  const edges: NetworkEdge[] = [];
  
  // Create initial complete graph
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      edges.push({
        source: nodes[i].id,
        target: nodes[j].id,
        weight: 1,
        id: `edge-${i}-${j}`
      });
      
      // Update neighbors
      nodes[i].neighbors = nodes[i].neighbors || [];
      nodes[j].neighbors = nodes[j].neighbors || [];
      nodes[i].neighbors.push(nodes[j].id);
      nodes[j].neighbors.push(nodes[i].id);
    }
  }

  // Add remaining nodes with preferential attachment
  for (let i = m; i < numNodes; i++) {
    const newNode: NetworkNode = {
      id: `node-${i}`,
      strategy: 0,
      payoff: 0,
      neighbors: []
    };
    nodes.push(newNode);

    // Calculate degree sum for probability distribution
    const degreeSum = edges.length * 2;
    
    // Select m unique existing nodes based on their degree
    const connectedNodes = new Set<string>();
    
    while (connectedNodes.size < m) {
      // Random number between 0 and degreeSum
      const r = Math.random() * degreeSum;
      let cumulativeDegree = 0;
      
      // Find node based on degree probability
      for (let j = 0; j < i; j++) {
        const nodeDegree = nodes[j].neighbors?.length || 0;
        cumulativeDegree += nodeDegree;
        
        if (r <= cumulativeDegree && !connectedNodes.has(nodes[j].id)) {
          connectedNodes.add(nodes[j].id);
          break;
        }
      }
    }
    
    // Create edges to selected nodes
    for (const targetId of connectedNodes) {
      const targetIndex = nodes.findIndex(n => n.id === targetId);
      
      edges.push({
        source: newNode.id,
        target: targetId,
        weight: 1,
        id: `edge-${i}-${targetIndex}`
      });
      
      // Update neighbors
      newNode.neighbors.push(targetId);
      nodes[targetIndex].neighbors = nodes[targetIndex].neighbors || [];
      nodes[targetIndex].neighbors.push(newNode.id);
    }
  }

  return {
    nodes,
    edges,
    type: NetworkType.ScaleFree
  };
}

/**
 * Calculates node centrality measures
 * @param network - Network to analyze
 * @returns Updated network with centrality measures
 */
export function calculateCentrality(network: Network): Network {
  const { nodes, edges } = network;
  const nodeMap = new Map<string, NetworkNode>();
  
  // Create a map for quick node lookup
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, centrality: { degree: 0, betweenness: 0, closeness: 0 } });
  });
  
  // Calculate degree centrality
  edges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (sourceNode && sourceNode.centrality) {
      sourceNode.centrality.degree = (sourceNode.centrality.degree || 0) + 1;
    }
    
    if (targetNode && targetNode.centrality) {
      targetNode.centrality.degree = (targetNode.centrality.degree || 0) + 1;
    }
  });
  
  // Create adjacency matrix for shortest path calculations
  const adjacencyMatrix: { [key: string]: { [key: string]: number } } = {};
  nodes.forEach(node => {
    adjacencyMatrix[node.id] = {};
    nodes.forEach(otherNode => {
      adjacencyMatrix[node.id][otherNode.id] = Infinity;
    });
    adjacencyMatrix[node.id][node.id] = 0;
  });
  
  edges.forEach(edge => {
    adjacencyMatrix[edge.source][edge.target] = edge.weight;
    adjacencyMatrix[edge.target][edge.source] = edge.weight; // Assuming undirected graph
  });
  
  // Floyd-Warshall algorithm for all-pairs shortest paths
  nodes.forEach(k => {
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (
          adjacencyMatrix[i.id][k.id] + adjacencyMatrix[k.id][j.id] < 
          adjacencyMatrix[i.id][j.id]
        ) {
          adjacencyMatrix[i.id][j.id] = 
            adjacencyMatrix[i.id][k.id] + adjacencyMatrix[k.id][j.id];
        }
      });
    });
  });
  
  // Calculate closeness centrality
  nodes.forEach(node => {
    let sum = 0;
    let unreachableNodes = 0;
    
    nodes.forEach(otherNode => {
      if (node.id !== otherNode.id) {
        if (adjacencyMatrix[node.id][otherNode.id] === Infinity) {
          unreachableNodes++;
        } else {
          sum += adjacencyMatrix[node.id][otherNode.id];
        }
      }
    });
    
    const reachableNodes = nodes.length - 1 - unreachableNodes;
    const closeness = reachableNodes > 0 ? reachableNodes / sum : 0;
    
    const nodeWithCentrality = nodeMap.get(node.id);
    if (nodeWithCentrality && nodeWithCentrality.centrality) {
      nodeWithCentrality.centrality.closeness = closeness;
    }
  });
  
  // Update nodes with calculated centrality measures
  const updatedNodes = nodes.map(node => {
    const nodeWithCentrality = nodeMap.get(node.id);
    return nodeWithCentrality || node;
  });
  
  return {
    ...network,
    nodes: updatedNodes
  };
}

/**
 * Updates node strategies based on best response dynamics
 * @param network - Current network state
 * @param payoffMatrix - Game payoff matrix
 * @param updateProbability - Probability of a node updating its strategy
 * @returns Updated network with new strategies
 */
export function updateNetworkStrategies(
  network: Network,
  payoffMatrix: PayoffMatrix,
  updateProbability: number = 1.0
): Network {
  const { nodes, edges } = network;
  
  // Create adjacency list for quick neighbor lookup
  const adjacencyList: { [key: string]: string[] } = {};
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    adjacencyList[edge.target].push(edge.source);
  });
  
  // Calculate current payoffs
  const nodesWithPayoffs = calculatePayoffs(network, payoffMatrix);
  
  // Update strategies based on best response
  const updatedNodes = nodesWithPayoffs.nodes.map(node => {
    // Only update with given probability
    if (Math.random() > updateProbability) {
      return node;
    }
    
    const neighbors = adjacencyList[node.id] || [];
    if (neighbors.length === 0) return node;
    
    // Find neighbor strategies
    const neighborStrategies = neighbors.map(neighborId => {
      const neighbor = nodesWithPayoffs.nodes.find(n => n.id === neighborId);
      return neighbor ? neighbor.strategy : 0;
    });
    
    // Calculate payoff for each possible strategy
    const availableStrategies = Object.keys(payoffMatrix).map(Number);
    let bestStrategy = node.strategy;
    let bestPayoff = -Infinity;
    
    for (const strategy of availableStrategies) {
      let totalPayoff = 0;
      
      // Calculate payoff against each neighbor
      for (const neighborStrategy of neighborStrategies) {
        totalPayoff += payoffMatrix[strategy][neighborStrategy] || 0;
      }
      
      if (totalPayoff > bestPayoff) {
        bestPayoff = totalPayoff;
        bestStrategy = strategy;
      }
    }
    
    return {
      ...node,
      strategy: bestStrategy,
      payoff: bestPayoff
    };
  });
  
  return {
    ...network,
    nodes: updatedNodes
  };
}

/**
 * Calculates payoffs for all nodes based on their strategies and neighbors
 * @param network - Current network state
 * @param payoffMatrix - Game payoff matrix
 * @returns Updated network with calculated payoffs
 */
export function calculatePayoffs(
  network: Network,
  payoffMatrix: PayoffMatrix
): Network {
  const { nodes, edges } = network;
  
  // Create adjacency list for quick neighbor lookup
  const adjacencyList: { [key: string]: string[] } = {};
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    adjacencyList[edge.target].push(edge.source);
  });
  
  // Calculate payoffs
  const updatedNodes = nodes.map(node => {
    const neighbors = adjacencyList[node.id] || [];
    if (neighbors.length === 0) return { ...node, payoff: 0 };
    
    let totalPayoff = 0;
    
    // Calculate payoff against each neighbor
    for (const neighborId of neighbors) {
      const neighbor = nodes.find(n => n.id === neighborId);
      if (neighbor) {
        totalPayoff += payoffMatrix[node.strategy][neighbor.strategy] || 0;
      }
    }
    
    return {
      ...node,
      payoff: totalPayoff
    };
  });
  
  return {
    ...network,
    nodes: updatedNodes
  };
}

/**
 * Creates a coordination game payoff matrix
 * @param a - Payoff for coordinating on strategy 0
 * @param b - Payoff for player 1 choosing 0, player 2 choosing 1
 * @param c - Payoff for player 1 choosing 1, player 2 choosing 0
 * @param d - Payoff for coordinating on strategy 1
 * @returns Payoff matrix for coordination game
 */
export function createCoordinationGame(
  a: number,
  b: number,
  c: number,
  d: number
): PayoffMatrix {
  return {
    0: { 0: a, 1: b },
    1: { 0: c, 1: d }
  };
}

/**
 * Simulates contagion spread through a network
 * @param network - Initial network state
 * @param seedNodes - IDs of initially "infected" nodes
 * @param adoptionThreshold - Fraction of neighbors that must be infected for a node to become infected
 * @param steps - Number of simulation steps
 * @returns Array of networks representing each step of the simulation
 */
export function simulateContagion(
  network: Network,
  seedNodes: string[],
  adoptionThreshold: number,
  steps: number
): Network[] {
  const results: Network[] = [];
  let currentNetwork = { ...network };
  
  // Set initial infected nodes (strategy 1 = infected, strategy 0 = uninfected)
  currentNetwork.nodes = currentNetwork.nodes.map(node => ({
    ...node,
    strategy: seedNodes.includes(node.id) ? 1 : 0
  }));
  
  results.push(currentNetwork);
  
  // Create adjacency list for quick neighbor lookup
  const adjacencyList: { [key: string]: string[] } = {};
  currentNetwork.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  currentNetwork.edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    adjacencyList[edge.target].push(edge.source);
  });
  
  // Run simulation for specified number of steps
  for (let step = 0; step < steps; step++) {
    const nodesToInfect: string[] = [];
    
    // Find nodes that should be infected in this step
    for (const node of currentNetwork.nodes) {
      if (node.strategy === 1) continue; // Already infected
      
      const neighbors = adjacencyList[node.id] || [];
      if (neighbors.length === 0) continue;
      
      // Count infected neighbors
      const infectedNeighbors = neighbors.filter(neighborId => {
        const neighbor = currentNetwork.nodes.find(n => n.id === neighborId);
        return neighbor && neighbor.strategy === 1;
      });
      
      // Check if adoption threshold is met
      if (infectedNeighbors.length / neighbors.length >= adoptionThreshold) {
        nodesToInfect.push(node.id);
      }
    }
    
    // No new infections, simulation has stabilized
    if (nodesToInfect.length === 0) {
      break;
    }
    
    // Update network with new infections
    currentNetwork = {
      ...currentNetwork,
      nodes: currentNetwork.nodes.map(node => ({
        ...node,
        strategy: nodesToInfect.includes(node.id) ? 1 : node.strategy
      }))
    };
    
    results.push(currentNetwork);
  }
  
  return results;
}

/**
 * Calculates network efficiency (average inverse shortest path length)
 * @param network - Network to analyze
 * @returns Efficiency value between 0 and 1
 */
export function calculateNetworkEfficiency(network: Network): number {
  const { nodes, edges } = network;
  
  // Create adjacency matrix for shortest path calculations
  const adjacencyMatrix: { [key: string]: { [key: string]: number } } = {};
  nodes.forEach(node => {
    adjacencyMatrix[node.id] = {};
    nodes.forEach(otherNode => {
      adjacencyMatrix[node.id][otherNode.id] = Infinity;
    });
    adjacencyMatrix[node.id][node.id] = 0;
  });
  
  edges.forEach(edge => {
    adjacencyMatrix[edge.source][edge.target] = edge.weight;
    adjacencyMatrix[edge.target][edge.source] = edge.weight; // Assuming undirected graph
  });
  
  // Floyd-Warshall algorithm for all-pairs shortest paths
  nodes.forEach(k => {
    nodes.forEach(i => {
      nodes.forEach(j => {
        if (
          adjacencyMatrix[i.id][k.id] + adjacencyMatrix[k.id][j.id] < 
          adjacencyMatrix[i.id][j.id]
        ) {
          adjacencyMatrix[i.id][j.id] = 
            adjacencyMatrix[i.id][k.id] + adjacencyMatrix[k.id][j.id];
        }
      });
    });
  });
  
  // Calculate efficiency
  let totalInverseDistance = 0;
  let pairCount = 0;
  
  nodes.forEach(i => {
    nodes.forEach(j => {
      if (i.id !== j.id) {
        const distance = adjacencyMatrix[i.id][j.id];
        if (distance !== Infinity) {
          totalInverseDistance += 1 / distance;
        }
        pairCount++;
      }
    });
  });
  
  return pairCount > 0 ? totalInverseDistance / pairCount : 0;
}