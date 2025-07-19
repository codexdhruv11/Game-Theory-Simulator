import { BentoLayout, BentoItem } from "@/components/bento-layout"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import Link from "next/link"
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Scale, 
  Award,
  Network,
  Coins,
  Vote,
  Handshake,
  LineChart,
  Trophy,
  Zap,
  Target,
  Lightbulb,
  ArrowRight,
  PlayCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <AuthenticatedLayout>
      <main className="min-h-screen bg-background px-4 md:px-8 py-12">
        <BentoLayout>
          <BentoItem
            title="Introduction"
            description="Learn the fundamentals of game theory"
            variant="feature"
            icon={Brain}
          >
            <div className="flex justify-between items-center">
              <div>
                <p>Kickstart your journey in Game Theory with this module.</p>
                <Link href="/intro" className="inline-flex items-center text-primary hover:underline mt-3">
                  Start Now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <PlayCircle className="h-12 w-12 text-primary" />
            </div>
          </BentoItem>

          <BentoItem
            title="Prisoner's Dilemma"
            description="Interactive simulation of cooperation vs. defection"
            variant="hero"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            icon={Users}
            className="md:col-span-2"
          >
            <div className="flex flex-col gap-4">
              <Link href="/prisoners-dilemma">
                <Button variant="secondary" size="lg" className="w-full md:w-auto">
                  Start Interactive Demo
                </Button>
              </Link>
            </div>
          </BentoItem>

          <BentoItem
            title="Trust Evolution"
            description="Study the development of trust in strategic settings"
            variant="feature"
            icon={Handshake}
          >
            <p>Engage in experiments that show how trust forms and evolves.</p>
            <Link href="/trust-evolution" className="inline-flex items-center text-primary hover:underline mt-3">
              View More <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Game Theory Stats"
            description="Consolidated statistics of game outcomes"
            variant="stat"
            icon={LineChart}
          >
            <p>Detailed insights and statistics for all simulations conducted.</p>
            <Link href="/stats" className="inline-flex items-center text-primary hover:underline mt-3">
              Analyze <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Winning Strategies"
            description="Learn strategies that lead to optimal outcomes"
            variant="feature"
            icon={Target}
          >
            <p>Approach each game with a strategy that maximizes your success.</p>
            <Link href="/strategies" className="inline-flex items-center text-primary hover:underline mt-3">
              Discover More <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Mechanism Design"
            description="Designing rule sets for achieving desired objectives"
            variant="hero"
            gradient="linear-gradient(to br, var(--tw-gradient-from), var(--tw-gradient-to))"
            icon={Scale}
          >
            <div className="flex justify-between mt-6">
              <Button variant="outline" className="text-accent-foreground">
                Design Now
              </Button>
              <span className="font-bold text-accent text-2xl">Craft the Rules</span>
            </div>
          </BentoItem>

          <BentoItem
            title="Network Games"
            description="Explore cooperation on networks"
            variant="feature"
            icon={Network}
          >
            <p>Investigate how networks affect strategic decisions.</p>
            <Link href="/network-games" className="inline-flex items-center text-primary hover:underline mt-3">
              Learn More <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Introduction to Auctions"
            description="Dive into different auction formats and strategies"
            variant="stat"
            icon={Coins}
          >
            <p>Simulate various auction models and uncover effective bids.</p>
            <Link href="/auctions" className="inline-flex items-center text-primary hover:underline mt-3">
              Explore Auctions <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Behavioral Insights"
            description="Incorporating behavioral aspects into games"
            variant="action"
            icon={Award}
          >
            <p>Discover how human behavior impacts strategic decisions.</p>
            <Link href="/behavioral" className="inline-flex items-center text-primary hover:underline mt-3">
              Dive In <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Voting Systems"
            description="Understand decision-making in groups"
            variant="hero"
            gradient="linear-gradient(to br, var(--tw-gradient-from), var(--tw-gradient-to))"
            icon={Vote}
          >
            <div className="flex justify-between mt-6">
              <Button variant="outline" className="text-accent-foreground">
                Explore
              </Button>
              <span className="font-bold text-accent text-2xl">Participate in Democracy</span>
            </div>
          </BentoItem>

          <BentoItem
            title="Competitive Strategy"
            description="Strategies to outperform opponents"
            variant="feature"
            icon={Zap}
          >
            <p>Assess what strategies lead to the best outcomes in competition.</p>
            <Link href="/competitive" className="inline-flex items-center text-primary hover:underline mt-3">
              Get Strategic <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>

          <BentoItem
            title="Tournament Outcomes"
            description="Results from strategic tournaments"
            variant="stat"
            icon={Trophy}
          >
            <p>Examine how various strategies performed in tournaments.</p>
            <Link href="/tournaments" className="inline-flex items-center text-primary hover:underline mt-3">
              View Results <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BentoItem>
        </BentoLayout>
      </main>
    </AuthenticatedLayout>
  )
}
