// Voting Theory Logic

export interface Candidate {
  id: string
  name: string
  position: number // Position on 1D political spectrum
}

export interface Voter {
  id: string
  name: string
  idealPoint: number // Ideal position on political spectrum
  preferences: string[] // Ordered candidate preferences
}

export interface VotingResult {
  winner: string
  votes: Record<string, number>
  method: string
}

export function pluralityVoting(voters: Voter[], candidates: Candidate[]): VotingResult {
  const votes: Record<string, number> = {}
  
  // Initialize vote counts
  candidates.forEach(candidate => {
    votes[candidate.id] = 0
  })
  
  // Count first preferences
  voters.forEach(voter => {
    if (voter.preferences.length > 0) {
      const firstChoice = voter.preferences[0]
      if (votes[firstChoice] !== undefined) {
        votes[firstChoice]++
      }
    }
  })
  
  // Find winner
  const winner = Object.entries(votes).reduce((max, [candidate, count]) => 
    count > votes[max] ? candidate : max
  , candidates[0].id)
  
  return { winner, votes, method: 'Plurality' }
}

export function condorcetVoting(voters: Voter[], candidates: Candidate[]): VotingResult {
  const pairwiseResults: Record<string, Record<string, number>> = {}
  
  // Initialize pairwise comparison matrix
  candidates.forEach(c1 => {
    pairwiseResults[c1.id] = {}
    candidates.forEach(c2 => {
      if (c1.id !== c2.id) {
        pairwiseResults[c1.id][c2.id] = 0
      }
    })
  })
  
  // Count pairwise preferences
  voters.forEach(voter => {
    for (let i = 0; i < voter.preferences.length; i++) {
      for (let j = i + 1; j < voter.preferences.length; j++) {
        const preferred = voter.preferences[i]
        const lessPreferred = voter.preferences[j]
        
        if (pairwiseResults[preferred] && pairwiseResults[preferred][lessPreferred] !== undefined) {
          pairwiseResults[preferred][lessPreferred]++
        }
      }
    }
  })
  
  // Find Condorcet winner (beats all others in pairwise comparisons)
  let condorcetWinner: string | null = null
  
  for (const candidate of candidates) {
    let beatsAll = true
    for (const other of candidates) {
      if (candidate.id !== other.id) {
        const candidateVotes = pairwiseResults[candidate.id][other.id] || 0
        const otherVotes = pairwiseResults[other.id][candidate.id] || 0
        
        if (candidateVotes <= otherVotes) {
          beatsAll = false
          break
        }
      }
    }
    
    if (beatsAll) {
      condorcetWinner = candidate.id
      break
    }
  }
  
  const votes: Record<string, number> = {}
  candidates.forEach(c => {
    votes[c.id] = Object.values(pairwiseResults[c.id] || {}).reduce((sum, v) => sum + v, 0)
  })
  
  return {
    winner: condorcetWinner || candidates[0].id,
    votes,
    method: 'Condorcet'
  }
}

export function bordaCountVoting(voters: Voter[], candidates: Candidate[]): VotingResult {
  const votes: Record<string, number> = {}
  const n = candidates.length
  
  // Initialize vote counts
  candidates.forEach(candidate => {
    votes[candidate.id] = 0
  })
  
  // Calculate Borda scores
  voters.forEach(voter => {
    voter.preferences.forEach((candidateId, rank) => {
      if (votes[candidateId] !== undefined) {
        votes[candidateId] += n - rank - 1 // Higher rank = more points
      }
    })
  })
  
  // Find winner
  const winner = Object.entries(votes).reduce((max, [candidate, count]) => 
    count > votes[max] ? candidate : max
  , candidates[0].id)
  
  return { winner, votes, method: 'Borda Count' }
}

export function instantRunoffVoting(voters: Voter[], candidates: Candidate[]): VotingResult {
  let remainingCandidates = [...candidates]
  const eliminationOrder: string[] = []
  const finalVotes: Record<string, number> = {}
  
  while (remainingCandidates.length > 1) {
    const roundVotes: Record<string, number> = {}
    
    // Initialize vote counts for remaining candidates
    remainingCandidates.forEach(candidate => {
      roundVotes[candidate.id] = 0
    })
    
    // Count first preferences among remaining candidates
    voters.forEach(voter => {
      for (const preference of voter.preferences) {
        if (remainingCandidates.some(c => c.id === preference)) {
          roundVotes[preference]++
          break
        }
      }
    })
    
    // Check if any candidate has majority
    const totalVotes = Object.values(roundVotes).reduce((sum, v) => sum + v, 0)
    const majority = totalVotes / 2
    
    const candidateWithMajority = Object.entries(roundVotes).find(([_, votes]) => votes > majority)
    
    if (candidateWithMajority) {
      Object.assign(finalVotes, roundVotes)
      return {
        winner: candidateWithMajority[0],
        votes: finalVotes,
        method: 'Instant Runoff'
      }
    }
    
    // Eliminate candidate with fewest votes
    const minVotes = Math.min(...Object.values(roundVotes))
    const toEliminate = Object.entries(roundVotes).find(([_, votes]) => votes === minVotes)?.[0]
    
    if (toEliminate) {
      remainingCandidates = remainingCandidates.filter(c => c.id !== toEliminate)
      eliminationOrder.push(toEliminate)
    }
  }
  
  // Last remaining candidate wins
  const winner = remainingCandidates[0]?.id || candidates[0].id
  
  // Final vote count
  remainingCandidates.forEach(candidate => {
    finalVotes[candidate.id] = voters.length // Winner gets all remaining votes
  })
  
  return { winner, votes: finalVotes, method: 'Instant Runoff' }
}

export function generateVoterPreferences(voters: Voter[], candidates: Candidate[]): Voter[] {
  return voters.map(voter => {
    // Generate preferences based on distance from voter's ideal point
    const candidatesWithDistance = candidates.map(candidate => ({
      id: candidate.id,
      distance: Math.abs(voter.idealPoint - candidate.position)
    }))
    
    // Sort by distance (closest first)
    candidatesWithDistance.sort((a, b) => a.distance - b.distance)
    
    return {
      ...voter,
      preferences: candidatesWithDistance.map(c => c.id)
    }
  })
}

export function createSampleElection(): { voters: Voter[]; candidates: Candidate[] } {
  const candidates: Candidate[] = [
    { id: 'A', name: 'Alice (Left)', position: 2 },
    { id: 'B', name: 'Bob (Center)', position: 5 },
    { id: 'C', name: 'Carol (Right)', position: 8 }
  ]
  
  const voters: Voter[] = [
    { id: 'V1', name: 'Voter 1', idealPoint: 1, preferences: [] },
    { id: 'V2', name: 'Voter 2', idealPoint: 3, preferences: [] },
    { id: 'V3', name: 'Voter 3', idealPoint: 4, preferences: [] },
    { id: 'V4', name: 'Voter 4', idealPoint: 6, preferences: [] },
    { id: 'V5', name: 'Voter 5', idealPoint: 7, preferences: [] },
    { id: 'V6', name: 'Voter 6', idealPoint: 9, preferences: [] }
  ]
  
  return {
    voters: generateVoterPreferences(voters, candidates),
    candidates
  }
}