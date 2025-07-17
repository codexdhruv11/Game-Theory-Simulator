import { BentoLayout, BentoItem } from "@/components/bento-layout"
import { NashEquilibrium } from "@/components/nash-equilibrium"
import { GameTheoryIntro } from "@/components/game-theory-intro"
import { ZeroSumGame } from "@/components/zero-sum-game"
import { AuctionSimulator } from "@/components/auction-simulator"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import Link from "next/link"

// Enhanced components
import { EnhancedPrisonersDilemma } from "@/components/enhanced/enhanced-prisoners-dilemma"
import { EnhancedEvolutionaryGame } from "@/components/enhanced/enhanced-evolutionary-game"

// Advanced components
import { NetworkGame } from "@/components/advanced/network-game"
import { CooperativeGame } from "@/components/advanced/cooperative-game"
import { MechanismDesign } from "@/components/advanced/mechanism-design"
import { BehavioralEconomics } from "@/components/advanced/behavioral-economics"
import { SignalingGame } from "@/components/advanced/signaling-game"
import { MatchingTheory } from "@/components/advanced/matching-theory"
import { VotingTheory } from "@/components/advanced/voting-theory"
import { RepeatedGames } from "@/components/advanced/repeated-games"

export default function Home() {
  return (
    <AuthenticatedLayout>
      <main className="min-h-screen bg-background" suppressHydrationWarning data-testid="main-content">
      
      <BentoLayout>
        <BentoItem
          title="Introduction"
          description="Learn the fundamentals of game theory"
          className="md:col-span-2 lg:col-span-1"
        >
          <GameTheoryIntro />
        </BentoItem>
        
        <BentoItem
          title="Prisoner's Dilemma"
          description="Classic cooperation vs. defection scenario"
          className="md:col-span-2 lg:col-span-2"
        >
          <EnhancedPrisonersDilemma />
        </BentoItem>
        
        <BentoItem
          title="Trust Evolution"
          description="Explore how trust and cooperation evolve over time"
          className="md:col-span-2 lg:col-span-3"
        >
          <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">The Evolution of Trust</h3>
            <p className="text-center mb-6">Discover how trust emerges, breaks, and evolves in different environments through interactive simulations.</p>
            <div className="flex gap-3">
              <Link href="/prisoners-dilemma" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm">
                PD Course
              </Link>
              <Link href="/trust-evolution" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm">
                Trust Evolution
              </Link>
            </div>
          </div>
        </BentoItem>
        
        <BentoItem
          title="Nash Equilibrium"
          description="Find equilibrium points in strategic games"
          className="md:col-span-1 lg:col-span-1"
        >
          <NashEquilibrium />
        </BentoItem>
        
        <BentoItem
          title="Zero-Sum Game"
          description="Analyze competitive scenarios"
          className="md:col-span-1 lg:col-span-1"
        >
          <ZeroSumGame />
        </BentoItem>
        
        <BentoItem
          title="Network Game"
          description="Coordination on complex networks"
          className="md:col-span-2 lg:col-span-2"
        >
          <NetworkGame />
        </BentoItem>
        
        <BentoItem
          title="Cooperative Game Theory"
          description="Shapley values and coalition formation"
          className="md:col-span-2 lg:col-span-1"
        >
          <CooperativeGame />
        </BentoItem>
        
        <BentoItem
          title="Mechanism Design"
          description="Auction theory and matching markets"
          className="md:col-span-2 lg:col-span-2"
        >
          <MechanismDesign />
        </BentoItem>
        
        <BentoItem
          title="Behavioral Economics"
          description="Bounded rationality and learning"
          className="md:col-span-1 lg:col-span-1"
        >
          <BehavioralEconomics />
        </BentoItem>
        
        <BentoItem
          title="Signaling Games"
          description="Information transmission and reputation"
          className="md:col-span-1 lg:col-span-1"
        >
          <SignalingGame />
        </BentoItem>
        
        <BentoItem
          title="Matching Theory"
          description="Two-sided markets and stability"
          className="md:col-span-1 lg:col-span-1"
        >
          <MatchingTheory />
        </BentoItem>
        
        <BentoItem
          title="Voting Theory"
          description="Social choice and democratic mechanisms"
          className="md:col-span-2 lg:col-span-2"
        >
          <VotingTheory />
        </BentoItem>
        
        <BentoItem
          title="Repeated Games"
          description="Long-term cooperation and reputation"
          className="md:col-span-2 lg:col-span-2"
        >
          <RepeatedGames />
        </BentoItem>
        
        <BentoItem
          title="Auction Theory"
          description="Simulate different auction mechanisms"
          className="md:col-span-2 lg:col-span-1"
        >
          <AuctionSimulator />
        </BentoItem>
        
        <BentoItem
          title="Evolutionary Game"
          description="Watch strategies evolve over time"
          className="md:col-span-2 lg:col-span-2"
        >
          <EnhancedEvolutionaryGame />
        </BentoItem>
      </BentoLayout>
      </main>
    </AuthenticatedLayout>
  )
}