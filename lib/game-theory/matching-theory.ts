/**
 * Matching Theory Implementation
 * 
 * This module provides implementations of various matching theory concepts
 * including the Gale-Shapley algorithm, stability analysis, and market design.
 */

/**
 * Represents a participant in a matching market
 */
export interface MatchingParticipant {
  id: string;
  preferences: string[];  // Ordered list of preferred partners
  capacity?: number;      // For many-to-one matching (default: 1)
}

/**
 * Represents a matching between two sets of participants
 */
export interface Matching {
  matches: Map<string, string[]>;  // Map from participant ID to array of matched partners
}

/**
 * Represents a blocking pair in a matching
 */
export interface BlockingPair {
  participant1: string;
  participant2: string;
  reason: string;
}

/**
 * Implements the Gale-Shapley algorithm for stable matching
 * @param proposers - Array of participants who will propose
 * @param receivers - Array of participants who will receive proposals
 * @returns Stable matching
 */
export function galeShapleyAlgorithm(
  proposers: MatchingParticipant[],
  receivers: MatchingParticipant[]
): Matching {
  // Create preference maps for faster lookup
  const receiverPrefs: Map<string, Map<string, number>> = new Map();
  
  receivers.forEach(receiver => {
    const prefMap = new Map<string, number>();
    receiver.preferences.forEach((proposerId, index) => {
      prefMap.set(proposerId, index);
    });
    receiverPrefs.set(receiver.id, prefMap);
  });
  
  // Initialize data structures
  const matches = new Map<string, string[]>();
  const receiverMatches = new Map<string, string[]>();
  
  // Initialize empty matches
  proposers.forEach(proposer => {
    matches.set(proposer.id, []);
  });
  
  receivers.forEach(receiver => {
    receiverMatches.set(receiver.id, []);
  });
  
  // Keep track of next proposal for each proposer
  const nextProposalIndex = new Map<string, number>();
  proposers.forEach(proposer => {
    nextProposalIndex.set(proposer.id, 0);
  });
  
  // Keep track of unmatched proposers who still have proposals to make
  let unmatchedProposers = proposers.filter(p => 
    (p.preferences.length > 0) && 
    ((p.capacity || 1) > (matches.get(p.id)?.length || 0))
  );
  
  // Run Gale-Shapley algorithm
  while (unmatchedProposers.length > 0) {
    const proposer = unmatchedProposers[0];
    const proposerId = proposer.id;
    const proposerCapacity = proposer.capacity || 1;
    
    // Check if proposer has any preferences left
    const nextIndex = nextProposalIndex.get(proposerId) || 0;
    if (nextIndex >= proposer.preferences.length) {
      // No more preferences, remove from unmatched list
      unmatchedProposers.shift();
      continue;
    }
    
    // Get next receiver to propose to
    const receiverId = proposer.preferences[nextIndex];
    nextProposalIndex.set(proposerId, nextIndex + 1);
    
    const receiver = receivers.find(r => r.id === receiverId);
    if (!receiver) {
      continue;
    }
    
    const receiverCapacity = receiver.capacity || 1;
    const currentMatches = receiverMatches.get(receiverId) || [];
    
    // If receiver has capacity, accept the proposal
    if (currentMatches.length < receiverCapacity) {
      // Add match
      currentMatches.push(proposerId);
      receiverMatches.set(receiverId, currentMatches);
      
      const proposerMatches = matches.get(proposerId) || [];
      proposerMatches.push(receiverId);
      matches.set(proposerId, proposerMatches);
      
      // Check if proposer is fully matched
      if (proposerMatches.length >= proposerCapacity) {
        unmatchedProposers.shift();
      }
    } else {
      // Receiver is at capacity, check if they prefer this proposer
      const receiverPrefMap = receiverPrefs.get(receiverId);
      
      if (!receiverPrefMap) {
        continue;
      }
      
      // Find worst current match
      let worstMatchIndex = -1;
      let worstMatchRank = -1;
      
      for (let i = 0; i < currentMatches.length; i++) {
        const matchRank = receiverPrefMap.get(currentMatches[i]) || Infinity;
        if (worstMatchRank === -1 || matchRank > worstMatchRank) {
          worstMatchRank = matchRank;
          worstMatchIndex = i;
        }
      }
      
      // Check if receiver prefers new proposer to worst match
      const proposerRank = receiverPrefMap.get(proposerId) || Infinity;
      
      if (proposerRank < worstMatchRank) {
        // Replace worst match with new proposer
        const replacedProposerId = currentMatches[worstMatchIndex];
        currentMatches[worstMatchIndex] = proposerId;
        receiverMatches.set(receiverId, currentMatches);
        
        // Update proposer matches
        const proposerMatches = matches.get(proposerId) || [];
        proposerMatches.push(receiverId);
        matches.set(proposerId, proposerMatches);
        
        // Update replaced proposer's matches
        const replacedProposerMatches = matches.get(replacedProposerId) || [];
        const index = replacedProposerMatches.indexOf(receiverId);
        if (index !== -1) {
          replacedProposerMatches.splice(index, 1);
          matches.set(replacedProposerId, replacedProposerMatches);
        }
        
        // Add replaced proposer back to unmatched list if not already there
        const replacedProposer = proposers.find(p => p.id === replacedProposerId);
        if (replacedProposer && !unmatchedProposers.includes(replacedProposer)) {
          unmatchedProposers.push(replacedProposer);
        }
        
        // Check if proposer is fully matched
        if (proposerMatches.length >= proposerCapacity) {
          unmatchedProposers.shift();
        }
      }
    }
  }
  
  return { matches };
}

/**
 * Checks if a matching is stable
 * @param matching - The matching to check
 * @param group1 - First group of participants
 * @param group2 - Second group of participants
 * @returns Whether the matching is stable and any blocking pairs
 */
export function checkStability(
  matching: Matching,
  group1: MatchingParticipant[],
  group2: MatchingParticipant[]
): { isStable: boolean; blockingPairs: BlockingPair[] } {
  const blockingPairs: BlockingPair[] = [];
  
  // Create preference maps for faster lookup
  const prefMaps = new Map<string, Map<string, number>>();
  
  [...group1, ...group2].forEach(participant => {
    const prefMap = new Map<string, number>();
    participant.preferences.forEach((partnerId, index) => {
      prefMap.set(partnerId, index);
    });
    prefMaps.set(participant.id, prefMap);
  });
  
  // Check for blocking pairs
  for (const participant1 of group1) {
    for (const participant2 of group2) {
      // Check if this pair would prefer each other to current matches
      const participant1Matches = matching.matches.get(participant1.id) || [];
      const participant2Matches = matching.matches.get(participant2.id) || [];
      
      const participant1Prefs = prefMaps.get(participant1.id);
      const participant2Prefs = prefMaps.get(participant2.id);
      
      if (!participant1Prefs || !participant2Prefs) {
        continue;
      }
      
      // Check if participant1 prefers participant2 to any current match
      let participant1Prefers = false;
      
      if (participant1Matches.length < (participant1.capacity || 1)) {
        // Participant1 has capacity, so they would accept participant2
        participant1Prefers = true;
      } else {
        // Check if participant1 prefers participant2 to worst current match
        let worstMatchRank = -1;
        let worstMatchId = '';
        
        for (const matchId of participant1Matches) {
          const rank = participant1Prefs.get(matchId) || Infinity;
          if (worstMatchRank === -1 || rank > worstMatchRank) {
            worstMatchRank = rank;
            worstMatchId = matchId;
          }
        }
        
        const participant2Rank = participant1Prefs.get(participant2.id) || Infinity;
        participant1Prefers = participant2Rank < worstMatchRank;
      }
      
      // Check if participant2 prefers participant1 to any current match
      let participant2Prefers = false;
      
      if (participant2Matches.length < (participant2.capacity || 1)) {
        // Participant2 has capacity, so they would accept participant1
        participant2Prefers = true;
      } else {
        // Check if participant2 prefers participant1 to worst current match
        let worstMatchRank = -1;
        let worstMatchId = '';
        
        for (const matchId of participant2Matches) {
          const rank = participant2Prefs.get(matchId) || Infinity;
          if (worstMatchRank === -1 || rank > worstMatchRank) {
            worstMatchRank = rank;
            worstMatchId = matchId;
          }
        }
        
        const participant1Rank = participant2Prefs.get(participant1.id) || Infinity;
        participant2Prefers = participant1Rank < worstMatchRank;
      }
      
      // If both prefer each other, we have a blocking pair
      if (participant1Prefers && participant2Prefers) {
        blockingPairs.push({
          participant1: participant1.id,
          participant2: participant2.id,
          reason: `Both participants prefer each other to their current matches`
        });
      }
    }
  }
  
  return {
    isStable: blockingPairs.length === 0,
    blockingPairs
  };
}

/**
 * Implements the Top Trading Cycle algorithm for housing allocation
 * @param agents - Array of agents with preferences
 * @param initialEndowments - Map from agent ID to initial house ID
 * @returns Final allocation
 */
export function topTradingCycle(
  agents: MatchingParticipant[],
  initialEndowments: Map<string, string>
): Map<string, string> {
  // Create a map of house IDs to their current owners
  const houseToOwner = new Map<string, string>();
  for (const [agentId, houseId] of initialEndowments.entries()) {
    houseToOwner.set(houseId, agentId);
  }
  
  // Initialize result allocation
  const allocation = new Map<string, string>();
  
  // Keep track of remaining agents and houses
  const remainingAgents = new Set(agents.map(a => a.id));
  const remainingHouses = new Set(initialEndowments.values());
  
  // Run the algorithm until all agents are allocated
  while (remainingAgents.size > 0) {
    // Create a directed graph where agents point to houses and houses point to owners
    const agentToHouse = new Map<string, string>();
    const houseToNextOwner = new Map<string, string>();
    
    // Each agent points to their most preferred remaining house
    for (const agent of agents) {
      if (!remainingAgents.has(agent.id)) continue;
      
      // Find the most preferred remaining house
      for (const houseId of agent.preferences) {
        if (remainingHouses.has(houseId)) {
          agentToHouse.set(agent.id, houseId);
          break;
        }
      }
    }
    
    // Each house points to its owner
    for (const houseId of remainingHouses) {
      const ownerId = houseToOwner.get(houseId);
      if (ownerId && remainingAgents.has(ownerId)) {
        houseToNextOwner.set(houseId, ownerId);
      }
    }
    
    // Find cycles in the graph
    const visited = new Set<string>();
    const cycles: string[][] = [];
    
    for (const agentId of remainingAgents) {
      if (visited.has(agentId)) continue;
      
      const cycle: string[] = [];
      let current = agentId;
      let isAgent = true;
      
      while (!visited.has(current)) {
        visited.add(current);
        cycle.push(current);
        
        if (isAgent) {
          // Agent points to house
          current = agentToHouse.get(current) || '';
          if (!current) break;
        } else {
          // House points to agent
          current = houseToNextOwner.get(current) || '';
          if (!current) break;
        }
        
        isAgent = !isAgent;
        
        // Check if we've found a cycle
        const cycleStartIndex = cycle.indexOf(current);
        if (cycleStartIndex !== -1 && !isAgent) {
          cycles.push(cycle.slice(cycleStartIndex));
          break;
        }
      }
    }
    
    // Process each cycle
    for (const cycle of cycles) {
      // Extract agents and houses from the cycle
      const cycleAgents: string[] = [];
      const cycleHouses: string[] = [];
      
      for (let i = 0; i < cycle.length; i++) {
        if (i % 2 === 0) {
          cycleAgents.push(cycle[i]);
        } else {
          cycleHouses.push(cycle[i]);
        }
      }
      
      // Assign each agent their preferred house
      for (let i = 0; i < cycleAgents.length; i++) {
        const agentId = cycleAgents[i];
        const houseId = cycleHouses[i];
        
        allocation.set(agentId, houseId);
        remainingAgents.delete(agentId);
        remainingHouses.delete(houseId);
      }
    }
  }
  
  return allocation;
}

/**
 * Implements the Deferred Acceptance algorithm for school choice
 * @param students - Array of students with preferences over schools
 * @param schools - Array of schools with priorities over students
 * @param schoolCapacities - Map from school ID to capacity
 * @returns Student-optimal stable matching
 */
export function deferredAcceptanceSchoolChoice(
  students: MatchingParticipant[],
  schools: MatchingParticipant[],
  schoolCapacities: Map<string, number>
): Matching {
  // Create school capacity map
  const schoolsWithCapacity = schools.map(school => ({
    ...school,
    capacity: schoolCapacities.get(school.id) || 1
  }));
  
  // Run Gale-Shapley with students as proposers
  return galeShapleyAlgorithm(students, schoolsWithCapacity);
}

/**
 * Implements the Boston mechanism for school choice
 * @param students - Array of students with preferences over schools
 * @param schools - Array of schools with priorities over students
 * @param schoolCapacities - Map from school ID to capacity
 * @returns Boston mechanism matching
 */
export function bostonMechanism(
  students: MatchingParticipant[],
  schools: MatchingParticipant[],
  schoolCapacities: Map<string, number>
): Matching {
  // Create preference maps for schools
  const schoolPriorities = new Map<string, Map<string, number>>();
  
  schools.forEach(school => {
    const priorityMap = new Map<string, number>();
    school.preferences.forEach((studentId, index) => {
      priorityMap.set(studentId, index);
    });
    schoolPriorities.set(school.id, priorityMap);
  });
  
  // Initialize matches
  const matches = new Map<string, string[]>();
  const schoolMatches = new Map<string, string[]>();
  
  students.forEach(student => {
    matches.set(student.id, []);
  });
  
  schools.forEach(school => {
    schoolMatches.set(school.id, []);
  });
  
  // Track remaining capacity for each school
  const remainingCapacity = new Map<string, number>();
  for (const [schoolId, capacity] of schoolCapacities.entries()) {
    remainingCapacity.set(schoolId, capacity);
  }
  
  // Track unmatched students
  let unmatchedStudents = [...students];
  
  // Process each preference round
  let maxPreferenceLength = 0;
  students.forEach(student => {
    maxPreferenceLength = Math.max(maxPreferenceLength, student.preferences.length);
  });
  
  for (let round = 0; round < maxPreferenceLength; round++) {
    // Each unmatched student applies to their next preferred school
    const applications = new Map<string, MatchingParticipant[]>();
    
    for (const student of unmatchedStudents) {
      if (round < student.preferences.length) {
        const schoolId = student.preferences[round];
        const applicants = applications.get(schoolId) || [];
        applicants.push(student);
        applications.set(schoolId, applicants);
      }
    }
    
    // Schools accept students based on priorities up to capacity
    const newlyMatchedStudents = new Set<string>();
    
    for (const [schoolId, applicants] of applications.entries()) {
      const capacity = remainingCapacity.get(schoolId) || 0;
      if (capacity === 0) continue;
      
      // Sort applicants by priority
      const schoolPriority = schoolPriorities.get(schoolId);
      if (!schoolPriority) continue;
      
      applicants.sort((a, b) => {
        const priorityA = schoolPriority.get(a.id) || Infinity;
        const priorityB = schoolPriority.get(b.id) || Infinity;
        return priorityA - priorityB;
      });
      
      // Accept up to capacity
      const acceptedApplicants = applicants.slice(0, capacity);
      const currentMatches = schoolMatches.get(schoolId) || [];
      
      for (const student of acceptedApplicants) {
        currentMatches.push(student.id);
        const studentMatches = matches.get(student.id) || [];
        studentMatches.push(schoolId);
        matches.set(student.id, studentMatches);
        newlyMatchedStudents.add(student.id);
      }
      
      schoolMatches.set(schoolId, currentMatches);
      remainingCapacity.set(schoolId, capacity - acceptedApplicants.length);
    }
    
    // Update unmatched students
    unmatchedStudents = unmatchedStudents.filter(student => !newlyMatchedStudents.has(student.id));
  }
  
  return { matches };
}

/**
 * Implements a simple kidney exchange algorithm
 * @param patients - Array of patients with preferences over donors
 * @param donors - Array of donors with compatibility information
 * @returns Matching of patients to donors
 */
export function kidneyExchange(
  patients: MatchingParticipant[],
  donors: { id: string; patientId: string; compatibleWith: string[] }[]
): { matches: Map<string, string[]>; cycles: string[][] } {
  // Create compatibility graph
  const graph = new Map<string, string[]>();
  
  // Each patient's donor points to compatible patients
  for (const donor of donors) {
    graph.set(donor.id, donor.compatibleWith);
  }
  
  // Find cycles in the graph
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const currentPath = new Set<string>();
  
  function findCycles(node: string, path: string[] = []): void {
    if (currentPath.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart));
      return;
    }
    
    if (visited.has(node)) return;
    
    visited.add(node);
    currentPath.add(node);
    path.push(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      // Find the donor for this patient
      const neighborDonor = donors.find(d => d.patientId === neighbor)?.id;
      if (neighborDonor) {
        findCycles(neighborDonor, [...path]);
      }
    }
    
    currentPath.delete(node);
  }
  
  // Start DFS from each donor
  for (const donor of donors) {
    if (!visited.has(donor.id)) {
      findCycles(donor.id);
    }
  }
  
  // Create matches based on cycles
  const matches = new Map<string, string[]>();
  
  patients.forEach(patient => {
    matches.set(patient.id, []);
  });
  
  // Process each cycle
  for (const cycle of cycles) {
    for (let i = 0; i < cycle.length; i++) {
      const donorId = cycle[i];
      const donor = donors.find(d => d.id === donorId);
      if (!donor) continue;
      
      const nextIndex = (i + 1) % cycle.length;
      const nextDonorId = cycle[nextIndex];
      const nextDonor = donors.find(d => d.id === nextDonorId);
      if (!nextDonor) continue;
      
      const patientId = nextDonor.patientId;
      const patientMatches = matches.get(patientId) || [];
      patientMatches.push(donorId);
      matches.set(patientId, patientMatches);
    }
  }
  
  return { matches, cycles };
}

/**
 * Calculates the Pareto efficiency of a matching
 * @param matching - The matching to analyze
 * @param participants - Array of participants with preferences
 * @returns Whether the matching is Pareto efficient and any improvements
 */
export function checkParetoEfficiency(
  matching: Matching,
  participants: MatchingParticipant[]
): { isEfficient: boolean; improvements: string[] } {
  // Create preference maps for faster lookup
  const prefMaps = new Map<string, Map<string, number>>();
  
  participants.forEach(participant => {
    const prefMap = new Map<string, number>();
    participant.preferences.forEach((partnerId, index) => {
      prefMap.set(partnerId, index);
    });
    prefMaps.set(participant.id, prefMap);
  });
  
  // Check for Pareto improvements
  const improvements: string[] = [];
  
  // We'll check if there's any other matching that makes someone better off
  // without making anyone worse off
  
  // For simplicity, we'll just check pairwise swaps
  // A full check would require considering all possible matchings
  
  const participantIds = participants.map(p => p.id);
  
  for (let i = 0; i < participantIds.length; i++) {
    for (let j = i + 1; j < participantIds.length; j++) {
      const id1 = participantIds[i];
      const id2 = participantIds[j];
      
      const matches1 = matching.matches.get(id1) || [];
      const matches2 = matching.matches.get(id2) || [];
      
      // Skip if either participant has no matches
      if (matches1.length === 0 || matches2.length === 0) continue;
      
      const prefs1 = prefMaps.get(id1);
      const prefs2 = prefMaps.get(id2);
      
      if (!prefs1 || !prefs2) continue;
      
      // Check if swapping would make both better off
      for (const match1 of matches1) {
        for (const match2 of matches2) {
          const rank1Current = prefs1.get(match1) || Infinity;
          const rank1New = prefs1.get(match2) || Infinity;
          
          const rank2Current = prefs2.get(match2) || Infinity;
          const rank2New = prefs2.get(match1) || Infinity;
          
          if (rank1New < rank1Current && rank2New < rank2Current) {
            improvements.push(
              `Participants ${id1} and ${id2} can swap matches ${match1} and ${match2} to both be better off`
            );
          }
        }
      }
    }
  }
  
  return {
    isEfficient: improvements.length === 0,
    improvements
  };
}

/**
 * Checks if a matching mechanism is strategy-proof
 * @param mechanism - Function that takes participants and returns a matching
 * @param participants - Array of participants with true preferences
 * @param manipulatedIndex - Index of participant who might manipulate
 * @returns Whether the mechanism is strategy-proof for the given participant
 */
export function checkStrategyProofness(
  mechanism: (participants: MatchingParticipant[]) => Matching,
  participants: MatchingParticipant[],
  manipulatedIndex: number
): { isStrategyProof: boolean; manipulation?: string } {
  // Get the participant who might manipulate
  const manipulator = participants[manipulatedIndex];
  if (!manipulator) {
    return { isStrategyProof: true };
  }
  
  // Get the true preferences
  const truePreferences = manipulator.preferences;
  
  // Run the mechanism with true preferences
  const truthfulMatching = mechanism(participants);
  const truthfulMatches = truthfulMatching.matches.get(manipulator.id) || [];
  
  // Try all possible preference manipulations
  // For simplicity, we'll just try swapping adjacent preferences
  for (let i = 0; i < truePreferences.length - 1; i++) {
    // Create manipulated preferences by swapping
    const manipulatedPreferences = [...truePreferences];
    [manipulatedPreferences[i], manipulatedPreferences[i + 1]] = 
      [manipulatedPreferences[i + 1], manipulatedPreferences[i]];
    
    // Create manipulated participant
    const manipulatedParticipant: MatchingParticipant = {
      ...manipulator,
      preferences: manipulatedPreferences
    };
    
    // Create new participant list
    const manipulatedParticipants = [...participants];
    manipulatedParticipants[manipulatedIndex] = manipulatedParticipant;
    
    // Run the mechanism with manipulated preferences
    const manipulatedMatching = mechanism(manipulatedParticipants);
    const manipulatedMatches = manipulatedMatching.matches.get(manipulator.id) || [];
    
    // Check if manipulation leads to better outcome according to true preferences
    if (isBetterMatch(manipulatedMatches, truthfulMatches, truePreferences)) {
      return {
        isStrategyProof: false,
        manipulation: `Participant ${manipulator.id} can benefit by swapping preferences ${truePreferences[i]} and ${truePreferences[i + 1]}`
      };
    }
  }
  
  return { isStrategyProof: true };
}

/**
 * Checks if one match is better than another according to preferences
 * @param match1 - First match
 * @param match2 - Second match
 * @param preferences - Preference order
 * @returns Whether match1 is better than match2
 */
function isBetterMatch(
  match1: string[],
  match2: string[],
  preferences: string[]
): boolean {
  // Create preference map for faster lookup
  const prefMap = new Map<string, number>();
  preferences.forEach((id, index) => {
    prefMap.set(id, index);
  });
  
  // Find best match in each set
  let bestRank1 = Infinity;
  for (const id of match1) {
    const rank = prefMap.get(id) || Infinity;
    bestRank1 = Math.min(bestRank1, rank);
  }
  
  let bestRank2 = Infinity;
  for (const id of match2) {
    const rank = prefMap.get(id) || Infinity;
    bestRank2 = Math.min(bestRank2, rank);
  }
  
  return bestRank1 < bestRank2;
}