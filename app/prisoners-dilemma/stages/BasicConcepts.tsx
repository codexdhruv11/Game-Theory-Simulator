"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Users, Brain, AlertTriangle, ChevronRight, ChevronLeft, Info } from "lucide-react"
import { useEntranceAnimation, createStaggeredDelays } from "@/lib/animation-utils"

interface BasicConceptsProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

export function BasicConcepts({ onComplete, isCompleted }: BasicConceptsProps) {
  const [currentConcept, setCurrentConcept] = useState(0)
  const [conceptsUnderstood, setConceptsUnderstood] = useState<Set<number>>(new Set())
  const [headerRef, headerVisible] = useEntranceAnimation()
  const [contentRef, contentVisible] = useEntranceAnimation({ threshold: 0.1 })
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
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-green-200 dark:border-green-800 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-105">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold text-xl text-green-800 dark:text-green-200 mb-2">Cooperate</h4>
                <p className="text-green-600 dark:text-green-300">Stay silent about the crime</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-red-200 dark:border-red-800 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-105">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-bold text-xl text-red-800 dark:text-red-200 mb-2">Defect</h4>
                <p className="text-red-600 dark:text-red-300">Betray your partner</p>
              </CardContent>
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
            <div className="bg-blue-500 dark:bg-blue-600 text-white p-3 text-center font-medium">
              Payoff Matrix (years of freedom)
            </div>
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-b-lg">
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
            </div>
          </motion.div>
          
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: staggerDelays[2] / 1000 }}
          >
            Numbers represent years of freedom (higher is better)
          </motion.p>
          
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
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Hint:</strong> In each cell, the first number is your payoff and the second is your partner's payoff. 
                  Look at each possible outcome and consider what's best for you individually.
                </p>
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
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800 overflow-hidden">
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
              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200 dark:border-orange-800 overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Collective Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-600 dark:text-orange-300 font-medium mb-3">
                    When both follow individual logic, both get 1 point instead of the possible 3 each.
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="font-bold text-xl text-orange-800 dark:text-orange-200">1 + 1 = 2</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Mutual Defection</div>
                      </div>
                      <div>
                        <div className="font-bold text-xl text-green-600 dark:text-green-400">3 + 3 = 6</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Mutual Cooperation</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: staggerDelays[3] / 1000 }}
          >
            <p className="font-bold text-lg text-purple-800 dark:text-purple-200">
              Rational self-interest leads to an irrational collective outcome!
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
              This is the fundamental paradox of the Prisoner's Dilemma
            </p>
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
    }
  }

  const handleComplete = () => {
    onComplete({
      conceptsLearned: concepts.length,
      achievements: ["First Steps"]
    })
  }

  const allConceptsUnderstood = conceptsUnderstood.size === concepts.length
  const progress = (conceptsUnderstood.size / concepts.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <motion.div 
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={headerVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{conceptsUnderstood.size}/{concepts.length} concepts</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-center mt-4 gap-2">
          {concepts.map((concept, index) => {
            const Icon = concept.icon
            const isCompleted = conceptsUnderstood.has(index)
            const isCurrent = index === currentConcept
            
            return (
              <Tooltip key={index} content={concept.title}>
                <Button
                  variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                  size="icon"
                  className={`w-8 h-8 rounded-full relative ${
                    isCurrent ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setCurrentConcept(index)}
                >
                  <Icon className="w-4 h-4" />
                  {isCompleted && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    />
                  )}
                </Button>
              </Tooltip>
            )
          })}
        </div>
      </motion.div>

      {/* Current Concept */}
      <motion.div
        ref={contentRef}
        key={currentConcept}
        initial={{ opacity: 0, y: 20 }}
        animate={contentVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center`}>
                {React.createElement(concepts[currentConcept].icon, {
                  className: "w-6 h-6 text-blue-600 dark:text-blue-400"
                })}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{concepts[currentConcept].title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Concept {currentConcept + 1} of {concepts.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {concepts[currentConcept].content}
          </CardContent>
          <CardFooter className="flex justify-between pt-2 pb-4 px-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentConcept(Math.max(0, currentConcept - 1))}
              disabled={currentConcept === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {!conceptsUnderstood.has(currentConcept) ? (
              <Button
                onClick={() => handleConceptUnderstood(currentConcept)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                I Understand
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                Understood
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setCurrentConcept(Math.min(concepts.length - 1, currentConcept + 1))}
              disabled={currentConcept === concepts.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Completion */}
      {allConceptsUnderstood && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 overflow-hidden shadow-lg">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-green-400/10 blur-2xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl" />
            </div>
            <CardContent className="p-8 relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-800/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Concepts Mastered!
              </motion.h3>
              <motion.p 
                className="text-green-600 dark:text-green-300 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                You now understand the basic structure of the Prisoner's Dilemma.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button 
                  onClick={handleComplete} 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  size="lg"
                >
                  Continue to One-Off Game
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isCompleted && (
        <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Stage completed!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}