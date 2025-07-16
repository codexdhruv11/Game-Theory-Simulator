/**
 * Mechanism Design and Auction Theory Implementation
 * 
 * This module provides implementations of various mechanism design concepts
 * including VCG mechanism, auction formats, and matching mechanisms.
 */

/**
 * Represents a bidder in an auction
 */
export interface Bidder {
  id: string;
  valuations: number[];  // Valuation for each item
  budget?: number;       // Optional budget constraint
  risk?: number;         // Risk aversion parameter (0 = risk neutral, > 0 = risk averse)
}

/**
 * Represents an item in an auction
 */
export interface Item {
  id: string;
  name: string;
  reservePrice?: number; // Minimum price seller is willing to accept
}

/**
 * Represents the outcome of an auction
 */
export interface AuctionOutcome {
  allocations: { [bidderId: string]: string[] }; // Mapping of bidders to items they won
  payments: { [bidderId: string]: number };      // Mapping of bidders to their payments
  revenue: number;                               // Total revenue for the seller
  welfare: number;                               // Total social welfare
  isEfficient: boolean;                          // Whether allocation maximizes social welfare
}

/**
 * Represents a participant in a matching market
 */
export interface MatchingParticipant {
  id: string;
  preferences: string[];  // Ordered list of preferred partners
}

/**
 * Represents the outcome of a matching mechanism
 */
export interface MatchingOutcome {
  matches: [string, string][];  // Pairs of matched participants
  isStable: boolean;            // Whether the matching is stable
  isParticipantOptimal: boolean;// Whether the matching is optimal for participants
}

/**
 * Implements the Vickrey-Clarke-Groves (VCG) mechanism for efficient allocation
 * @param bidders - Array of bidders with their valuations
 * @param items - Array of items to be allocated
 * @returns Auction outcome with VCG allocations and payments
 */
export function runVCGMechanism(bidders: Bidder[], items: Item[]): AuctionOutcome {
  // Find efficient allocation (maximizing total value)
  const efficientAllocation = findEfficientAllocation(bidders, items);
  
  // Calculate VCG payments
  const payments: { [bidderId: string]: number } = {};
  let totalRevenue = 0;
  
  bidders.forEach(bidder => {
    // Default payment is 0
    payments[bidder.id] = 0;
    
    // If bidder won nothing, no payment needed
    const wonItems = efficientAllocation.allocations[bidder.id] || [];
    if (wonItems.length === 0) return;
    
    // Calculate allocation without this bidder
    const otherBidders = bidders.filter(b => b.id !== bidder.id);
    const allocationWithoutBidder = findEfficientAllocation(otherBidders, items);
    
    // Calculate externality imposed by this bidder
    const welfareWithoutBidder = allocationWithoutBidder.welfare;
    
    // Calculate welfare of others with this bidder
    let welfareOfOthersWithBidder = 0;
    bidders.forEach(otherBidder => {
      if (otherBidder.id !== bidder.id) {
        const otherBidderItems = efficientAllocation.allocations[otherBidder.id] || [];
        welfareOfOthersWithBidder += calculateTotalValue(otherBidder, otherBidderItems, items);
      }
    });
    
    // VCG payment is the difference in others' welfare
    const payment = welfareWithoutBidder - welfareOfOthersWithBidder;
    payments[bidder.id] = Math.max(0, payment); // Ensure non-negative payment
    totalRevenue += payments[bidder.id];
  });
  
  return {
    allocations: efficientAllocation.allocations,
    payments,
    revenue: totalRevenue,
    welfare: efficientAllocation.welfare,
    isEfficient: true // VCG always produces efficient allocations
  };
}

/**
 * Finds the efficient (welfare-maximizing) allocation of items to bidders
 * Uses a greedy algorithm for single-unit auctions and a simplified approach for multi-unit
 * For complex cases, this should be replaced with combinatorial optimization
 * @param bidders - Array of bidders with their valuations
 * @param items - Array of items to be allocated
 * @returns Efficient allocation and total welfare
 */
export function findEfficientAllocation(bidders: Bidder[], items: Item[]): {
  allocations: { [bidderId: string]: string[] };
  welfare: number;
} {
  // For simplicity, we'll use a greedy approach that works well for single-unit auctions
  // For multi-unit or combinatorial auctions, more sophisticated algorithms are needed
  
  const allocations: { [bidderId: string]: string[] } = {};
  bidders.forEach(bidder => { allocations[bidder.id] = []; });
  
  let welfare = 0;
  
  // Create valuation entries for each (bidder, item) pair
  const valuationEntries: {
    bidderId: string;
    itemId: string;
    value: number;
  }[] = [];
  
  bidders.forEach(bidder => {
    items.forEach((item, index) => {
      valuationEntries.push({
        bidderId: bidder.id,
        itemId: item.id,
        value: bidder.valuations[index] || 0
      });
    });
  });
  
  // Sort by value in descending order
  valuationEntries.sort((a, b) => b.value - a.value);
  
  // Allocate items greedily
  const allocatedItems = new Set<string>();
  
  for (const entry of valuationEntries) {
    // Skip if item is already allocated or value is below reserve price
    if (allocatedItems.has(entry.itemId)) continue;
    
    const item = items.find(i => i.id === entry.itemId);
    if (!item) continue;
    
    if (item.reservePrice !== undefined && entry.value < item.reservePrice) continue;
    
    // Allocate item to bidder
    allocations[entry.bidderId].push(entry.itemId);
    allocatedItems.add(entry.itemId);
    welfare += entry.value;
  }
  
  return { allocations, welfare };
}

/**
 * Runs a second-price (Vickrey) auction for a single item
 * @param bidders - Array of bidders with their valuations
 * @param item - Item to be auctioned
 * @returns Auction outcome
 */
export function runSecondPriceAuction(bidders: Bidder[], item: Item): AuctionOutcome {
  // Extract bids for this item
  const bids = bidders.map((bidder, index) => ({
    bidderId: bidder.id,
    value: bidder.valuations[0] || 0
  }));
  
  // Sort bids in descending order
  bids.sort((a, b) => b.value - a.value);
  
  // Check if highest bid meets reserve price
  const reservePrice = item.reservePrice || 0;
  if (bids.length === 0 || bids[0].value < reservePrice) {
    // No allocation if no valid bids
    return {
      allocations: {},
      payments: {},
      revenue: 0,
      welfare: 0,
      isEfficient: true
    };
  }
  
  // Winner is highest bidder
  const winner = bids[0].bidderId;
  
  // Payment is second-highest bid or reserve price, whichever is higher
  const secondPrice = bids.length > 1 ? bids[1].value : 0;
  const payment = Math.max(secondPrice, reservePrice);
  
  // Create outcome
  const allocations: { [bidderId: string]: string[] } = {};
  const payments: { [bidderId: string]: number } = {};
  
  allocations[winner] = [item.id];
  payments[winner] = payment;
  
  return {
    allocations,
    payments,
    revenue: payment,
    welfare: bids[0].value,
    isEfficient: true // Second-price auctions are efficient
  };
}

/**
 * Runs a first-price sealed-bid auction for a single item
 * @param bidders - Array of bidders with their valuations
 * @param item - Item to be auctioned
 * @returns Auction outcome
 */
export function runFirstPriceAuction(bidders: Bidder[], item: Item): AuctionOutcome {
  // Extract bids for this item
  const bids = bidders.map((bidder) => ({
    bidderId: bidder.id,
    value: bidder.valuations[0] || 0,
    // In a real first-price auction, strategic bidders would shade their bids
    // This is a simplified model where we assume bid = value * (n-1)/n
    // where n is the number of bidders (a simple Bayesian Nash equilibrium)
    bid: (bidder.valuations[0] || 0) * ((bidders.length - 1) / bidders.length)
  }));
  
  // Sort bids in descending order
  bids.sort((a, b) => b.bid - a.bid);
  
  // Check if highest bid meets reserve price
  const reservePrice = item.reservePrice || 0;
  if (bids.length === 0 || bids[0].bid < reservePrice) {
    // No allocation if no valid bids
    return {
      allocations: {},
      payments: {},
      revenue: 0,
      welfare: 0,
      isEfficient: true
    };
  }
  
  // Winner is highest bidder
  const winner = bids[0].bidderId;
  const winnerValue = bids[0].value;
  
  // Payment is the bid
  const payment = bids[0].bid;
  
  // Create outcome
  const allocations: { [bidderId: string]: string[] } = {};
  const payments: { [bidderId: string]: number } = {};
  
  allocations[winner] = [item.id];
  payments[winner] = payment;
  
  return {
    allocations,
    payments,
    revenue: payment,
    welfare: winnerValue,
    isEfficient: true // With symmetric bidders, first-price is also efficient
  };
}

/**
 * Runs an English (ascending) auction for a single item
 * @param bidders - Array of bidders with their valuations
 * @param item - Item to be auctioned
 * @param increment - Bid increment
 * @returns Auction outcome
 */
export function runEnglishAuction(
  bidders: Bidder[],
  item: Item,
  increment: number = 1
): AuctionOutcome {
  // In an English auction, the price rises until only one bidder remains
  // This is strategically equivalent to a second-price auction under private values
  
  // Sort bidders by valuation in descending order
  const sortedBidders = [...bidders].sort(
    (a, b) => (b.valuations[0] || 0) - (a.valuations[0] || 0)
  );
  
  // Check if highest valuation meets reserve price
  const reservePrice = item.reservePrice || 0;
  if (sortedBidders.length === 0 || (sortedBidders[0].valuations[0] || 0) < reservePrice) {
    // No allocation if no valid bids
    return {
      allocations: {},
      payments: {},
      revenue: 0,
      welfare: 0,
      isEfficient: true
    };
  }
  
  // Winner is highest valuation bidder
  const winner = sortedBidders[0].id;
  const winnerValue = sortedBidders[0].valuations[0] || 0;
  
  // Payment is second-highest valuation plus increment, or reserve price
  let payment = reservePrice;
  if (sortedBidders.length > 1) {
    const secondValue = sortedBidders[1].valuations[0] || 0;
    payment = Math.max(reservePrice, Math.min(winnerValue, secondValue + increment));
  }
  
  // Create outcome
  const allocations: { [bidderId: string]: string[] } = {};
  const payments: { [bidderId: string]: number } = {};
  
  allocations[winner] = [item.id];
  payments[winner] = payment;
  
  return {
    allocations,
    payments,
    revenue: payment,
    welfare: winnerValue,
    isEfficient: true // English auctions are efficient
  };
}

/**
 * Runs a Dutch (descending) auction for a single item
 * @param bidders - Array of bidders with their valuations
 * @param item - Item to be auctioned
 * @param startPrice - Starting price
 * @param decrement - Price decrement
 * @returns Auction outcome
 */
export function runDutchAuction(
  bidders: Bidder[],
  item: Item,
  startPrice: number,
  decrement: number = 1
): AuctionOutcome {
  // In a Dutch auction, the price decreases until a bidder accepts it
  // This is strategically equivalent to a first-price auction under private values
  
  // Sort bidders by valuation in descending order
  const sortedBidders = [...bidders].sort(
    (a, b) => (b.valuations[0] || 0) - (a.valuations[0] || 0)
  );
  
  // Check if highest valuation meets reserve price
  const reservePrice = item.reservePrice || 0;
  if (sortedBidders.length === 0 || (sortedBidders[0].valuations[0] || 0) < reservePrice) {
    // No allocation if no valid bids
    return {
      allocations: {},
      payments: {},
      revenue: 0,
      welfare: 0,
      isEfficient: true
    };
  }
  
  // Simulate the Dutch auction
  let currentPrice = startPrice;
  let winner: string | null = null;
  let payment = 0;
  
  while (currentPrice >= reservePrice && winner === null) {
    // Check if any bidder is willing to accept the current price
    for (const bidder of sortedBidders) {
      // In a real Dutch auction, strategic bidders would have a threshold price
      // This is a simplified model where we assume threshold = value * (n-1)/n
      const threshold = (bidder.valuations[0] || 0) * ((bidders.length - 1) / bidders.length);
      
      if (currentPrice <= threshold) {
        winner = bidder.id;
        payment = currentPrice;
        break;
      }
    }
    
    currentPrice -= decrement;
  }
  
  // If no winner was found, no allocation
  if (winner === null) {
    return {
      allocations: {},
      payments: {},
      revenue: 0,
      welfare: 0,
      isEfficient: true
    };
  }
  
  // Create outcome
  const allocations: { [bidderId: string]: string[] } = {};
  const payments: { [bidderId: string]: number } = {};
  
  const winnerBidder = bidders.find(b => b.id === winner);
  const winnerValue = winnerBidder ? (winnerBidder.valuations[0] || 0) : 0;
  
  allocations[winner] = [item.id];
  payments[winner] = payment;
  
  return {
    allocations,
    payments,
    revenue: payment,
    welfare: winnerValue,
    isEfficient: true // With symmetric bidders, Dutch auction is also efficient
  };
}

/**
 * Implements the Gale-Shapley algorithm for stable matching
 * @param proposers - Array of participants who will propose
 * @param receivers - Array of participants who will receive proposals
 * @returns Stable matching outcome
 */
export function runGaleShapleyMatching(
  proposers: MatchingParticipant[],
  receivers: MatchingParticipant[]
): MatchingOutcome {
  // Create preference maps for faster lookup
  const proposerPrefs: { [id: string]: { [partner: string]: number } } = {};
  const receiverPrefs: { [id: string]: { [partner: string]: number } } = {};
  
  proposers.forEach(proposer => {
    proposerPrefs[proposer.id] = {};
    proposer.preferences.forEach((partner, index) => {
      proposerPrefs[proposer.id][partner] = index;
    });
  });
  
  receivers.forEach(receiver => {
    receiverPrefs[receiver.id] = {};
    receiver.preferences.forEach((partner, index) => {
      receiverPrefs[receiver.id][partner] = index;
    });
  });
  
  // Initialize data structures
  const matches: { [receiverId: string]: string } = {}; // Current matches
  const nextProposal: { [proposerId: string]: number } = {}; // Next preference index to propose to
  
  proposers.forEach(proposer => {
    nextProposal[proposer.id] = 0;
  });
  
  // Run Gale-Shapley algorithm
  let unmatched = [...proposers.map(p => p.id)];
  
  while (unmatched.length > 0) {
    const proposerId = unmatched[0];
    const proposer = proposers.find(p => p.id === proposerId);
    
    if (!proposer || nextProposal[proposerId] >= proposer.preferences.length) {
      // No more preferences to propose to
      unmatched.shift();
      continue;
    }
    
    const receiverId = proposer.preferences[nextProposal[proposerId]];
    nextProposal[proposerId]++;
    
    if (matches[receiverId] === undefined) {
      // Receiver is unmatched, accept proposal
      matches[receiverId] = proposerId;
      unmatched.shift();
    } else {
      // Receiver is already matched, check if they prefer new proposer
      const currentMatch = matches[receiverId];
      
      if (receiverPrefs[receiverId][proposerId] < receiverPrefs[receiverId][currentMatch]) {
        // Receiver prefers new proposer
        matches[receiverId] = proposerId;
        unmatched.shift();
        unmatched.push(currentMatch);
      }
    }
  }
  
  // Convert matches to pairs
  const matchPairs: [string, string][] = Object.entries(matches).map(
    ([receiverId, proposerId]) => [proposerId, receiverId]
  );
  
  return {
    matches: matchPairs,
    isStable: true, // Gale-Shapley algorithm guarantees stability
    isParticipantOptimal: true // Optimal for proposers
  };
}

/**
 * Calculates the total value of a set of items for a bidder
 * @param bidder - Bidder
 * @param itemIds - Array of item IDs
 * @param allItems - All available items
 * @returns Total value
 */
function calculateTotalValue(bidder: Bidder, itemIds: string[], allItems: Item[]): number {
  let totalValue = 0;
  
  itemIds.forEach(itemId => {
    const itemIndex = allItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      totalValue += bidder.valuations[itemIndex] || 0;
    }
  });
  
  return totalValue;
}

/**
 * Calculates the optimal reserve price for a single-item auction
 * @param bidders - Array of bidders with their valuations
 * @param sellerValue - Seller's value for the item
 * @returns Optimal reserve price
 */
export function calculateOptimalReservePrice(
  bidders: Bidder[],
  sellerValue: number
): number {
  // For simplicity, we assume bidder valuations are drawn from a uniform distribution
  // In a more realistic scenario, we would use the actual distribution of valuations
  
  // Extract all valuations
  const valuations = bidders.map(bidder => bidder.valuations[0] || 0);
  
  // Sort valuations in ascending order
  valuations.sort((a, b) => a - b);
  
  // Try different reserve prices and calculate expected revenue
  let bestReservePrice = sellerValue;
  let bestRevenue = sellerValue; // If no sale, revenue is seller's value
  
  for (let i = 0; i < valuations.length; i++) {
    const reservePrice = valuations[i];
    
    // Calculate expected revenue with this reserve price
    let revenue = 0;
    
    // Probability of sale is (n-i)/n
    const probSale = (valuations.length - i) / valuations.length;
    
    if (probSale > 0) {
      // Expected second highest bid among bidders with valuation >= reservePrice
      let expectedSecondPrice = 0;
      
      if (i < valuations.length - 1) {
        // Average of all valuations >= reservePrice except the highest
        let sum = 0;
        for (let j = i; j < valuations.length - 1; j++) {
          sum += valuations[j];
        }
        expectedSecondPrice = sum / (valuations.length - i - 1);
      }
      
      // Expected revenue is max(reservePrice, expectedSecondPrice) * probSale
      revenue = Math.max(reservePrice, expectedSecondPrice) * probSale;
    }
    
    // If no sale, seller keeps the item (worth sellerValue)
    revenue += sellerValue * (1 - probSale);
    
    if (revenue > bestRevenue) {
      bestRevenue = revenue;
      bestReservePrice = reservePrice;
    }
  }
  
  return bestReservePrice;
}

/**
 * Implements a simple public goods mechanism with voluntary contributions
 * @param players - Array of player valuations for the public good
 * @param cost - Cost of providing the public good
 * @param contributionRule - Function that determines contributions based on valuations
 * @returns Outcome of the mechanism
 */
export function publicGoodsMechanism(
  players: number[],
  cost: number,
  contributionRule: (valuations: number[], cost: number) => number[]
): {
  provided: boolean;
  contributions: number[];
  welfare: number;
} {
  // Calculate contributions based on the rule
  const contributions = contributionRule(players, cost);
  
  // Sum contributions
  const totalContribution = contributions.reduce((sum, c) => sum + c, 0);
  
  // Check if public good is provided
  const provided = totalContribution >= cost;
  
  // Calculate welfare
  let welfare = 0;
  
  if (provided) {
    // Each player gets their value minus their contribution
    welfare = players.reduce((sum, value, i) => sum + value - contributions[i], 0);
  }
  
  return {
    provided,
    contributions,
    welfare
  };
}