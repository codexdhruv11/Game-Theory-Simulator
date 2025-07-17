"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ConclusionProps {
  onComplete: () => void
}

export function Conclusion({ onComplete }: ConclusionProps) {
  const [activeInsight, setActiveInsight] = useState(0)
  
  const insights = [
    {
      title: "Trust Requires the Right Conditions",
      content: "Trust doesn't emerge in all environments. It requires specific conditions: repeated interactions, clear communication, and the right incentives. In one-off interactions, defection is often the rational choice, but repeated interactions make cooperation viable.",
      badge: "Game Theory",
      color: "#3b82f6"
    },
    {
      title: "Simple Strategies Often Win",
      content: "Tit for Tat's success in Axelrod's tournaments demonstrated that simple, clear strategies often outperform complex ones. Being nice (never defecting first), retaliatory (responding to defection), forgiving (returning to cooperation), and clear (being predictable) are key traits of successful strategies.",
      badge: "Strategy",
      color: "#8b5cf6"
    },
    {
      title: "Forgiveness Is Crucial in Noisy Environments",
      content: "In real-world scenarios with miscommunication and mistakes, unforgiving strategies break down quickly. Strategies that incorporate some level of forgiveness (like Generous Tit for Tat) perform better in noisy environments by preventing endless cycles of retaliation.",
      badge: "Noise",
      color: "#10b981"
    },
    {
      title: "Evolution Favors Cooperation Under the Right Conditions",
      content: "While defection dominates in one-off games, evolution can favor cooperative strategies in repeated interactions with the right parameters. The emergence of cooperation depends on factors like population structure, selection pressure, and the shadow of the future.",
      badge: "Evolution",
      color: "#f59e0b"
    },
    {
      title: "Trust Is Fragile but Recoverable",
      content: "Trust is easily broken but can be rebuilt through consistent cooperative behavior. The mathematical models show that after defection, it takes multiple rounds of cooperation to restore trust, highlighting the asymmetry between building and destroying trust.",
      badge: "Psychology",
      color: "#ec4899"
    }
  ]

  const references = [
    {
      title: "The Evolution of Cooperation",
      author: "Robert Axelrod",
      year: "1984",
      description: "Foundational work on the emergence of cooperation through repeated Prisoner's Dilemma games."
    },
    {
      title: "The Complexity of Cooperation",
      author: "Robert Axelrod",
      year: "1997",
      description: "Explores more advanced models of cooperation including noise and evolutionary dynamics."
    },
    {
      title: "Game Theory and the Evolution of Trust",
      author: "Martin Nowak",
      year: "2006",
      description: "Mathematical analysis of how cooperation can evolve in different population structures."
    },
    {
      title: "The Evolution of Trust",
      author: "Nicky Case",
      year: "2017",
      description: "Interactive guide that inspired this simulation."
    }
  ]

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Conclusion: The Mathematics of Trust</CardTitle>
        <p className="text-muted-foreground">
          Reflecting on what we've learned about game theory, cooperation, and trust
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-muted/30 p-6 rounded-lg border border-muted">
          <h3 className="text-xl font-bold mb-4">Key Insights</h3>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {insights.map((insight, index) => (
                <Badge 
                  key={index}
                  variant={activeInsight === index ? "default" : "outline"}
                  className="px-3 py-1 text-sm cursor-pointer"
                  style={{ 
                    borderColor: insight.color,
                    backgroundColor: activeInsight === index ? insight.color : undefined
                  }}
                  onClick={() => setActiveInsight(index)}
                >
                  {insight.title}
                </Badge>
              ))}
            </div>
            
            <Card className="border-2" style={{ borderColor: insights[activeInsight].color }}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{insights[activeInsight].title}</h3>
                    <Badge variant="outline">{insights[activeInsight].badge}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {insights[activeInsight].content}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mathematical Foundations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The mathematics behind trust and cooperation reveals that even simple rules can lead to complex emergent behaviors:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Nash Equilibrium:</span> In one-off games, mutual defection is the only Nash equilibrium, making trust impossible.
                </li>
                <li>
                  <span className="font-semibold">Folk Theorem:</span> In repeated games with sufficient "shadow of the future," cooperation becomes possible as one of many equilibria.
                </li>
                <li>
                  <span className="font-semibold">Replicator Dynamics:</span> The equation ẋᵢ = xᵢ(fᵢ(x) - f̄(x)) describes how strategy frequencies change over time in evolutionary settings.
                </li>
                <li>
                  <span className="font-semibold">Noise Threshold:</span> For strategies to maintain cooperation under noise, forgiveness rate should be proportional to noise levels.
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-World Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The principles we've explored apply to many real-world scenarios:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold">Business:</span> Repeated interactions between companies foster trust and cooperation, while one-off transactions often lead to opportunistic behavior.
                </li>
                <li>
                  <span className="font-semibold">International Relations:</span> Nations develop trust through repeated diplomatic exchanges and clear communication channels.
                </li>
                <li>
                  <span className="font-semibold">Social Media:</span> Online platforms with reputation systems encourage cooperative behavior by creating a "shadow of the future."
                </li>
                <li>
                  <span className="font-semibold">Climate Change:</span> Global cooperation requires addressing the tragedy of the commons through repeated interactions and clear agreements.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Further Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {references.map((ref, index) => (
                <div key={index} className="border p-3 rounded-md">
                  <h4 className="font-semibold">{ref.title}</h4>
                  <p className="text-sm text-muted-foreground">{ref.author} ({ref.year})</p>
                  <p className="text-sm mt-1">{ref.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Your Journey Is Complete!</h3>
              <p>
                You've explored the fascinating mathematics of trust, from simple one-off games to complex evolutionary dynamics.
              </p>
              <p className="text-muted-foreground">
                Remember: Trust isn't just about being nice—it's about creating the right conditions where cooperation can flourish.
              </p>
              
              <div className="pt-4 flex justify-center">
                <Button onClick={onComplete} size="lg">
                  Complete the Experience
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This simulation was inspired by Nicky Case's "The Evolution of Trust" and the academic work of Robert Axelrod, Martin Nowak, and many other game theorists.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 