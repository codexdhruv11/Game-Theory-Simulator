"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Users, Brain, AlertTriangle, ChevronRight, ChevronLeft, Info, Award, ArrowRight } from "lucide-react"
import { useEntranceAnimation, createStaggeredDelays } from "@/lib/animation-utils"

interface BasicConceptsProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

export function BasicConcepts({ onComplete, isCompleted }: BasicConceptsProps) {
  const [currentConcept, setCurrentConcept] = useState(0)
  const [conceptsUnderstood, setConceptsUnderstood] = useState<Set<number>>(new Set())
  const [showHint, setShowHint] = useState(false)

  // Create staggered delays for animated elements
  const staggerDelays = createStaggeredDelays(5, 100, 200)

  const concepts = [
    {
      title: "The Setup",
      icon: Users,
      content: (
        <div className="space-y-6">
          <motion.p 
            className="text-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: staggerDelays[0] / 1000 }}
          >
            Two prisoners are arrested and held in separate cells. They cannot communicate with each other.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: staggerDelays[1] / 1000 }}
          >
            Each prisoner has two choices:
          </motion.p>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: staggerDelays[2] / 1000 }}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-800 dark:text-green-200">Cooperate</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300">Stay silent about the crime</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-800 dark:text-red-200">Defect</CardTitle>
                <CardDescription className="text-red-600 dark:text-red-300">Betray your partner</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
          
          <motion.div 
            className="text-center text-sm text-gray-500 dark:text-gray-400 italic mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: staggerDelays[3] / 1000 }}
          >
            The classic scenario from game theory, first formalized by Merrill Flood and Melvin Dresher in 1950
          </motion.div>
        </div>
      )
    },
    {
      title: "The Payoff Matrix",
      icon: Brain,
      content: (
        <div className="space-y-6">
          <motion.p 
            className="text-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: staggerDelays[0] / 1000 }}
          >
            The outcomes depend on what both prisoners choose:
          </motion.p>
          
          <motion.div 
            className="rounded-xl overflow-hidden shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: staggerDelays[1] / 1000 }}
          >
            <Card>
              <CardHeader className="bg-blue-500 dark:bg-blue-600 text-white p-3 text-center">
                <CardTitle>Payoff Matrix (years of freedom)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <table className="w-full text-center border-separate border-spacing-3">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      <th className="p-2 font-bold text-blue-700 dark:text-blue-300">Partner Cooperates</th>
                      <th className="p-2 font-bold text-blue-700 dark:text-blue-300">Partner Defects</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-bold text-blue-700 dark:text-blue-300">You Cooperate</td>
                      <td className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transform transition-all duration-300 hover:scale-105">
                        <div className="font-bold text-2xl text-green-800 dark:text-green-200">3, 3</div>
                        <div className="text-sm mt-1">Both get moderate sentence</div>
                      </td>
                      <td className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transform transition-all duration-300 hover:scale-105">
                        <div className="font-bold text-2xl text-red-800 dark:text-red-200">0, 5</div>
                        <div className="text-sm mt-1">You get harsh, partner goes free</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-700 dark:text-blue-300">You Defect</td>
                      <td className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transform transition-all duration-300 hover:scale-105">
                        <div className="font-bold text-2xl text-red-800 dark:text-red-200">5, 0</div>
                        <div className="text-sm mt-1">You go free, partner gets harsh</div>
                      </td>
                      <td className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 transform transition-all duration-300 hover:scale-105">
                        <div className="font-bold text-2xl text-yellow-800 dark:text-yellow-200">1, 1</div>
                        <div className="text-sm mt-1">Both get harsh sentence</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
              <CardFooter className="text-center text-sm text-gray-600 dark:text-gray-400">
                Numbers represent years of freedom (higher is better)
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: staggerDelays[3] / 1000 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowHint(!showHint)}
            >
              <Info className="w-4 h-4" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Hint:</strong> In each cell, the first number is your payoff and the second is your partner's payoff. 
                      Look at each possible outcome and consider what's best for you individually.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    },
    {
      title: "The Dilemma",
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <motion.p 
            className="text-lg leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: staggerDelays[0] / 1000 }}
          >
            Here's the paradox that makes this game fascinating:
          </motion.p>
          
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: staggerDelays[1] / 1000 }}
            >
              <Card>
                <div className="absolute top-0 left-0 h-full w-1 bg-blue-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Individual Logic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 dark:text-blue-300 font-medium mb-3">
                    "No matter what my partner does, I'm better off defecting."
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-sm">If partner cooperates: I get <span className="font-bold">5</span> (defect) vs <span className="font-bold">3</span> (cooperate)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <p className="text-sm">If partner defects: I get <span className="font-bold">1</span> (defect) vs <span className="font-bold">0</span> (cooperate)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: staggerDelays[2] / 1000 }}
            >
              <Card>
                <div className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collective Logic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600 dark:text-orange-300 font-medium mb-3">
                    "We're both better off if we both cooperate."
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <p className="text-sm">If both cooperate: <span className="font-bold">3 + 3 = 6 total years</span> of freedom</p>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <p className="text-sm">If both defect: <span className="font-bold">1 + 1 = 2 total years</span> of freedom</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: staggerDelays[3] / 1000 }}
          >
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-purple-800 dark:text-purple-200">The Core Dilemma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 dark:text-purple-300">
                  Individual rationality leads to a collectively irrational outcome. This is what makes the 
                  Prisoner's Dilemma such a powerful model for many real-world situations where self-interest 
                  conflicts with group interest.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }
  ]

  const handleConceptUnderstood = (index: number) => {
    setConceptsUnderstood(prev => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
    
    if (index < concepts.length - 1) {
      setCurrentConcept(index + 1)
    } else if (conceptsUnderstood.size === concepts.length - 1) {
      // All concepts understood
      handleComplete()
    }
  }

  const handleComplete = () => {
    onComplete({
      gamesPlayed: 0,
      scoreEarned: 5,
      cooperationRate: 0,
      achievements: ["Learned Prisoner's Dilemma Basics"]
    })
  }

  return (
    <div className="space-y-8 font-ibm-plex-sans">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Concepts Understood</span>
          <span>{conceptsUnderstood.size}/{concepts.length}</span>
        </div>
        <Progress value={(conceptsUnderstood.size / concepts.length) * 100} className="h-2" />
      </div>
      
      {/* Tabs for concepts */}
      <Tabs 
        defaultValue={concepts[currentConcept].title.toLowerCase().replace(/\s+/g, '-')}
        value={concepts[currentConcept].title.toLowerCase().replace(/\s+/g, '-')}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          {concepts.map((concept, index) => (
            <TabsTrigger 
              key={index}
              value={concept.title.toLowerCase().replace(/\s+/g, '-')}
              onClick={() => setCurrentConcept(index)}
              disabled={!conceptsUnderstood.has(index) && index !== currentConcept}
              className="relative"
            >
              {concept.title}
              {conceptsUnderstood.has(index) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {concepts.map((concept, index) => (
          <TabsContent 
            key={index} 
            value={concept.title.toLowerCase().replace(/\s+/g, '-')}
            className="focus-visible:outline-none focus-visible:ring-0"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {React.createElement(concept.icon, { className: "w-6 h-6" })}
                  {concept.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {concept.content}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => currentConcept > 0 && setCurrentConcept(currentConcept - 1)}
                  disabled={currentConcept === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={() => handleConceptUnderstood(index)}
                  disabled={conceptsUnderstood.has(index)}
                >
                  {conceptsUnderstood.has(index) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Understood
                    </>
                  ) : (
                    <>
                      I Understand
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Completion section */}
      {isCompleted && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Award className="w-5 h-5" />
              Section Completed!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300">
              Great job! You've understood the basic concepts of the Prisoner's Dilemma.
              You can now move on to the next section or revisit these concepts anytime.
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
              Achievement: Learned Prisoner's Dilemma Basics
            </Badge>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}