import { IUser } from '@/models/User';

export interface MoralAnalysis {
  decision: string;
  reasoning: string;
  alignmentImpact: Record<string, number>;
}

export interface AlignmentImpact {
  utilitarian: number;
  deontological: number;
  virtue: number;
  contractual: number;
  care: number;
}

export class MoralAlignmentAnalyzer {
  static async analyzeDecision(
    gameType: string,
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>,
    user: IUser
  ): Promise<MoralAnalysis | null> {
    switch (gameType) {
      case 'prisoners-dilemma':
        return this.analyzePrisonersDilemma(playerChoices, outcomes);
      case 'repeated-games':
        return this.analyzeRepeatedGame(playerChoices, outcomes);
      case 'cooperative-game':
        return this.analyzeCooperativeGame(playerChoices, outcomes);
      case 'voting-theory':
        return this.analyzeVotingDecision(playerChoices, outcomes);
      case 'mechanism-design':
        return this.analyzeMechanismDesign(playerChoices, outcomes);
      default:
        return null;
    }
  }

  private static analyzePrisonersDilemma(
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>
  ): MoralAnalysis {
    const playerChoice = playerChoices.player1 || playerChoices.choice;
    const isCooperation = playerChoice === 'cooperate';

    if (isCooperation) {
      return {
        decision: 'cooperation',
        reasoning: 'Chose to cooperate, prioritizing mutual benefit and trust',
        alignmentImpact: {
          utilitarian: 5, // Good for overall welfare
          deontological: 8, // Follows moral duty
          virtue: 10, // Demonstrates virtue of cooperation
          contractual: 7, // Honors implicit social contract
          care: 9, // Shows care for others
        },
      };
    } else {
      return {
        decision: 'defection',
        reasoning: 'Chose to defect, prioritizing individual gain over cooperation',
        alignmentImpact: {
          utilitarian: -3, // May reduce overall welfare
          deontological: -8, // Violates moral duty
          virtue: -10, // Lacks virtue of cooperation
          contractual: -7, // Breaks implicit social contract
          care: -5, // Shows less care for others
        },
      };
    }
  }

  private static analyzeRepeatedGame(
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>
  ): MoralAnalysis {
    const strategy = playerChoices.strategy;
    const cooperationRate = playerChoices.cooperationRate || 0;

    if (strategy === 'tit-for-tat' || cooperationRate > 0.7) {
      return {
        decision: 'reciprocal_cooperation',
        reasoning: 'Adopted a strategy that promotes long-term cooperation and reciprocity',
        alignmentImpact: {
          utilitarian: 8, // Maximizes long-term welfare
          deontological: 6, // Conditional moral behavior
          virtue: 8, // Shows prudence and justice
          contractual: 10, // Perfect reciprocity
          care: 7, // Balanced care approach
        },
      };
    } else if (strategy === 'always-cooperate' || cooperationRate > 0.9) {
      return {
        decision: 'unconditional_cooperation',
        reasoning: 'Chose unconditional cooperation, demonstrating trust and altruism',
        alignmentImpact: {
          utilitarian: 5, // May be exploited
          deontological: 10, // Pure moral duty
          virtue: 10, // Highest virtue
          contractual: 3, // May enable contract violations
          care: 10, // Maximum care for others
        },
      };
    } else {
      return {
        decision: 'competitive_strategy',
        reasoning: 'Adopted a competitive strategy, prioritizing individual success',
        alignmentImpact: {
          utilitarian: -5, // Reduces overall welfare
          deontological: -6, // Violates moral duty
          virtue: -8, // Lacks cooperative virtue
          contractual: -8, // Breaks social contracts
          care: -7, // Shows less care
        },
      };
    }
  }

  private static analyzeCooperativeGame(
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>
  ): MoralAnalysis {
    const coalitionChoice = playerChoices.coalition;
    const fairnessScore = playerChoices.fairnessScore || 0;

    if (fairnessScore > 0.8) {
      return {
        decision: 'fair_coalition',
        reasoning: 'Formed coalitions based on fairness and equitable distribution',
        alignmentImpact: {
          utilitarian: 9, // Maximizes group welfare
          deontological: 8, // Treats people fairly
          virtue: 9, // Shows justice and fairness
          contractual: 10, // Honors agreements
          care: 8, // Cares for all members
        },
      };
    } else {
      return {
        decision: 'strategic_coalition',
        reasoning: 'Formed coalitions based primarily on strategic advantage',
        alignmentImpact: {
          utilitarian: 3, // Mixed welfare impact
          deontological: -3, // May treat people as means
          virtue: -2, // Less virtuous approach
          contractual: 5, // Honors some agreements
          care: -1, // Less care for excluded members
        },
      };
    }
  }

  private static analyzeVotingDecision(
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>
  ): MoralAnalysis {
    const votingStrategy = playerChoices.strategy;
    const considerationOfMinority = playerChoices.minorityConsideration || false;

    if (considerationOfMinority) {
      return {
        decision: 'inclusive_voting',
        reasoning: 'Considered minority interests and broader social impact in voting decisions',
        alignmentImpact: {
          utilitarian: 8, // Considers all affected parties
          deontological: 9, // Respects everyone\'s dignity
          virtue: 9, // Shows justice and compassion
          contractual: 7, // Balances majority and minority rights
          care: 10, // Cares for vulnerable groups
        },
      };
    } else {
      return {
        decision: 'majority_focused',
        reasoning: 'Focused primarily on majority preferences in voting decisions',
        alignmentImpact: {
          utilitarian: 5, // Good for majority, may harm minority
          deontological: 3, // May not respect minority dignity
          virtue: 4, // Mixed virtue demonstration
          contractual: 8, // Follows democratic contract
          care: 2, // Less care for minority
        },
      };
    }
  }

  private static analyzeMechanismDesign(
    playerChoices: Record<string, any>,
    outcomes: Record<string, any>
  ): MoralAnalysis {
    const mechanismType = playerChoices.mechanism;
    const efficiencyScore = playerChoices.efficiency || 0;
    const fairnessScore = playerChoices.fairness || 0;

    if (fairnessScore > efficiencyScore && fairnessScore > 0.7) {
      return {
        decision: 'fairness_prioritized',
        reasoning: 'Designed mechanisms prioritizing fairness over pure efficiency',
        alignmentImpact: {
          utilitarian: 6, // Balanced approach
          deontological: 10, // Prioritizes treating people fairly
          virtue: 9, // Shows justice
          contractual: 9, // Creates fair agreements
          care: 9, // Cares for all participants
        },
      };
    } else if (efficiencyScore > 0.8) {
      return {
        decision: 'efficiency_prioritized',
        reasoning: 'Designed mechanisms prioritizing overall efficiency and outcomes',
        alignmentImpact: {
          utilitarian: 10, // Maximizes overall welfare
          deontological: 4, // May treat some as means to ends
          virtue: 6, // Shows prudence but may lack justice
          contractual: 7, // Creates effective agreements
          care: 4, // May not care equally for all
        },
      };
    } else {
      return {
        decision: 'balanced_approach',
        reasoning: 'Attempted to balance multiple considerations in mechanism design',
        alignmentImpact: {
          utilitarian: 7, // Reasonable welfare outcomes
          deontological: 7, // Balanced moral approach
          virtue: 7, // Shows practical wisdom
          contractual: 8, // Creates workable agreements
          care: 7, // Balanced care approach
        },
      };
    }
  }

  static async updateUserAlignment(user: IUser, alignmentImpact: Record<string, number>): Promise<void> {
    const decayFactor = 0.95; // Slight decay of existing alignment
    const learningRate = 0.1; // How much new decisions impact alignment

    // Apply decay and new learning
    user.moralAlignment.utilitarian = user.moralAlignment.utilitarian * decayFactor + 
      (alignmentImpact.utilitarian || 0) * learningRate;
    user.moralAlignment.deontological = user.moralAlignment.deontological * decayFactor + 
      (alignmentImpact.deontological || 0) * learningRate;
    user.moralAlignment.virtue = user.moralAlignment.virtue * decayFactor + 
      (alignmentImpact.virtue || 0) * learningRate;
    user.moralAlignment.contractual = user.moralAlignment.contractual * decayFactor + 
      (alignmentImpact.contractual || 0) * learningRate;
    user.moralAlignment.care = user.moralAlignment.care * decayFactor + 
      (alignmentImpact.care || 0) * learningRate;

    // Clamp values to [-100, 100] range
    user.moralAlignment.utilitarian = Math.max(-100, Math.min(100, user.moralAlignment.utilitarian));
    user.moralAlignment.deontological = Math.max(-100, Math.min(100, user.moralAlignment.deontological));
    user.moralAlignment.virtue = Math.max(-100, Math.min(100, user.moralAlignment.virtue));
    user.moralAlignment.contractual = Math.max(-100, Math.min(100, user.moralAlignment.contractual));
    user.moralAlignment.care = Math.max(-100, Math.min(100, user.moralAlignment.care));

    user.moralAlignment.lastUpdated = new Date();
    await user.save();
  }

  static getDominantAlignment(user: IUser): string {
    const alignments = {
      utilitarian: user.moralAlignment.utilitarian,
      deontological: user.moralAlignment.deontological,
      virtue: user.moralAlignment.virtue,
      contractual: user.moralAlignment.contractual,
      care: user.moralAlignment.care,
    };

    return Object.entries(alignments).reduce((a, b) => 
      alignments[a[0] as keyof typeof alignments] > alignments[b[0] as keyof typeof alignments] ? a : b
    )[0];
  }

  static getAlignmentDescription(alignment: string): string {
    const descriptions = {
      utilitarian: 'Focuses on maximizing overall happiness and well-being for the greatest number of people',
      deontological: 'Emphasizes moral duties, rules, and treating people with inherent dignity and respect',
      virtue: 'Prioritizes character traits like courage, honesty, justice, and compassion in decision-making',
      contractual: 'Values fairness, reciprocity, and honoring agreements and social contracts',
      care: 'Emphasizes relationships, empathy, and caring for others, especially the vulnerable',
    };

    return descriptions[alignment as keyof typeof descriptions] || 'Unknown alignment';
  }
}