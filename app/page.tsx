import { BentoLayout, BentoItem } from "@/components/bento-layout"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NashEquilibrium } from "@/components/nash-equilibrium"
import { GameTheoryIntro } from "@/components/game-theory-intro"
import { ZeroSumGame } from "@/components/zero-sum-game"
import { AuctionSimulator } from "@/components/auction-simulator"

// Enhanced components
import { EnhancedPrisonersDilemma } from "@/components/enhanced/enhanced-prisoners-dilemma"
import { EnhancedEvolutionaryGame } from "@/components/enhanced/enhanced-evolutionary-game"

// Advanced components - temporarily commented out due to missing exports
// import { NetworkGame } from "@/components/advanced/network-game"
// import { CooperativeGame } from "@/components/advanced/cooperative-game"
// import { MechanismDesign } from "@/components/advanced/mechanism-design"
// import { BehavioralEconomics } from "@/components/advanced/behavioral-economics"
// import { SignalingGame } from "@/components/advanced/signaling-game"
// import { MatchingTheory } from "@/components/advanced/matching-theory"
// import { VotingTheory } from "@/components/advanced/voting-theory"
// import { RepeatedGames } from "@/components/advanced/repeated-games"

export default function Home() {
  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning data-testid="main-content">
      <header className="flex justify-between items-center p-6 border-b" suppressHydrationWarning data-testid="main-header">
        <div suppressHydrationWarning>
          <h1 className="text-3xl font-bold">Game Theory Simulator</h1>
          <p className="text-muted-foreground">Interactive simulations and analysis</p>
        </div>
        <ThemeSwitcher />
      </header>
      
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
        
        {/* Advanced components temporarily commented out
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
        */}
        
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
          className="md:col-span-2 lg:col-span-3"
        >
          <EnhancedEvolutionaryGame />
        </BentoItem>
      </BentoLayout>
    </main>
  )
}