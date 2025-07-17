"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { GraduationCap, CheckCircle, Trophy, BookOpen, Share2, Download } from "lucide-react"

interface ConclusionProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

export function Conclusion({ onComplete, isCompleted, userProgress }: ConclusionProps) {
  const [reflectionComplete, setReflectionComplete] = useState(false)
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set())

  const keyInsights = [
    {
      id: "cooperation-emergence",
      title: "Cooperation Can Emerge",
      description: "Even in competitive situations, cooperation can evolve through reciprocity and reputation.",
      icon: "🤝"
    },
    {
      id: "repetition-matters",
      title: "The Shadow of the Future",
      description: "When interactions repeat, the possibility of future retaliation enables cooperation.",
      icon: "🔄"
    },
    {
      id: "forgiveness-important",
      title: "Forgiveness is Crucial",
      description: "In noisy environments, the ability to forgive mistakes maintains cooperation.",
      icon: "💙"
    },
    {
      id: "nice-strategies-win",
      title: "Nice Strategies Often Win",
      description: "Strategies that never defect first tend to perform well in tournaments.",
      icon: "😊"
    },
    {
      id: "context-dependent",
      title: "Context Matters",
      description: "The best strategy depends on the environment, opponents, and noise level.",
      icon: "🎯"
    },
    {
      id: "evolution-complex",
      title: "Evolution is Complex",
      description: "Population dynamics can lead to surprising outcomes and strategy cycles.",
      icon: "🧬"
    }
  ]

  const realWorldApplications = [
    {
      title: "International Relations",
      description: "Trade agreements, arms control, and diplomatic protocols",
      examples: ["NATO mutual defense", "Climate change agreements", "Trade partnerships"]
    },
    {
      title: "Business Strategy",
      description: "Competitive dynamics, partnerships, and market behavior",
      examples: ["Price competition", "Strategic alliances", "Supply chain cooperation"]
    },
    {
      title: "Social Cooperation",
      description: "Community building, social norms, and collective action",
      examples: ["Neighborhood watch", "Open source software", "Environmental conservation"]
    },
    {
      title: "Technology Design",
      description: "Network protocols, distributed systems, and AI cooperation",
      examples: ["Internet protocols", "Blockchain consensus", "Multi-agent systems"]
    }
  ]

  const toggleInsight = (insightId: string) => {
    const newSelected = new Set(selectedInsights)
    if (newSelected.has(insightId)) {
      newSelected.delete(insightId)
    } else {
      newSelected.add(insightId)
    }
    setSelectedInsights(newSelected)
  }

  const completeReflection = () => {
    setReflectionComplete(true)
  }

  const handleComplete = () => {
    onComplete({
      insightsSelected: selectedInsights.size,
      achievements: ["Journey Complete", "Game Theory Graduate"]
    })
  }

  const generateCertificate = () => {
    // This would generate a downloadable certificate
    alert("Certificate generation would be implemented here!")
  }

  const shareProgress = () => {
    // This would share progress on social media
    alert("Social sharing would be implemented here!")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-purple-800 dark:text-purple-200">
            Congratulations!
          </CardTitle>
          <p className="text-lg text-purple-600 dark:text-purple-300">
            You've completed your journey through the Prisoner's Dilemma
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {userProgress.totalGames}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Games Played</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {userProgress.totalScore}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Total Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {(userProgress.cooperationRate * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Cooperation Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {userProgress.achievements.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Key Insights from Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Reflect on what you've learned. Select the insights that resonated most with you:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {keyInsights.map((insight) => (
              <Card 
                key={insight.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedInsights.has(insight.id) 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                }`}
                onClick={() => toggleInsight(insight.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                    </div>
                    {selectedInsights.has(insight.id) && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedInsights.size > 0 && !reflectionComplete && (
            <div className="text-center">
              <Button onClick={completeReflection} size="lg">
                Complete Reflection ({selectedInsights.size} insights selected)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-World Applications */}
      {reflectionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Real-World Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The principles you've learned apply far beyond game theory:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {realWorldApplications.map((application, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{application.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {application.description}
                      </p>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Examples:
                        </div>
                        {application.examples.map((example, exIndex) => (
                          <Badge key={exIndex} variant="secondary" className="text-xs mr-1">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Achievements */}
      {reflectionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userProgress.achievements.map((achievement: string, index: number) => (
                  <div key={index} className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <div className="font-semibold text-yellow-800 dark:text-yellow-200">
                      {achievement}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Next Steps */}
      {reflectionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                Continue Your Learning Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Explore More Games
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                    Try other game theory scenarios like Nash Equilibrium, Auction Theory, and more.
                  </p>
                  <Button variant="outline" size="sm">
                    Browse Games
                  </Button>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Read Further
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                    Dive deeper with recommended books and research papers on game theory.
                  </p>
                  <Button variant="outline" size="sm">
                    Reading List
                  </Button>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Join Community
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                    Connect with other learners and discuss game theory applications.
                  </p>
                  <Button variant="outline" size="sm">
                    Join Forum
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      {reflectionComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button onClick={generateCertificate} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button onClick={shareProgress} variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Progress
          </Button>
          {!isCompleted && (
            <Button onClick={handleComplete} size="lg" className="bg-purple-600 hover:bg-purple-700">
              Complete Journey
            </Button>
          )}
        </motion.div>
      )}

      {/* Final Message */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">
                Journey Complete! 🎉
              </h3>
              <p className="text-lg text-purple-600 dark:text-purple-300 mb-6">
                You've mastered the Prisoner's Dilemma and discovered the fascinating world 
                of cooperation, competition, and strategic thinking.
              </p>
              <p className="text-purple-600 dark:text-purple-300">
                Remember: In a world full of dilemmas, choose cooperation wisely, 
                forgive mistakes, and always consider the shadow of the future.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}