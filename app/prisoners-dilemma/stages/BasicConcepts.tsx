"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { CheckCircle, Users, Brain, AlertTriangle } from "lucide-react"

interface BasicConceptsProps {
  onComplete: (data?: any) => void
  isCompleted: boolean
  userProgress: any
}

export function BasicConcepts({ onComplete, isCompleted }: BasicConceptsProps) {
  const [currentConcept, setCurrentConcept] = useState(0)
  const [conceptsUnderstood, setConceptsUnderstood] = useState<Set<number>>(new Set())

  const concepts = [
    {
      title: "The Setup",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Two prisoners are arrested and held in separate cells. They cannot communicate with each other.
          </p>
          <p>
            Each prisoner has two choices:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-green-800 dark:text-green-200">Cooperate</h4>
                <p className="text-sm text-green-600 dark:text-green-300">Stay silent</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold text-red-800 dark:text-red-200">Defect</h4>
                <p className="text-sm text-red-600 dark:text-red-300">Betray partner</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "The Payoff Matrix",
      icon: Brain,
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            The outcomes depend on what both prisoners choose:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <table className="w-full text-center">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  <th className="p-2 font-semibold">Partner Cooperates</th>
                  <th className="p-2 font-semibold">Partner Defects</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-semibold">You Cooperate</td>
                  <td className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                    <div className="font-bold text-green-800 dark:text-green-200">3, 3</div>
                    <div className="text-xs">Both get moderate sentence</div>
                  </td>
                  <td className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                    <div className="font-bold text-red-800 dark:text-red-200">0, 5</div>
                    <div className="text-xs">You get harsh, partner goes free</div>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">You Defect</td>
                  <td className="p-2 bg-red-100 dark:bg-red-900/30 rounded">
                    <div className="font-bold text-red-800 dark:text-red-200">5, 0</div>
                    <div className="text-xs">You go free, partner gets harsh</div>
                  </td>
                  <td className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    <div className="font-bold text-yellow-800 dark:text-yellow-200">1, 1</div>
                    <div className="text-xs">Both get harsh sentence</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Numbers represent years of freedom (higher is better)
          </p>
        </div>
      )
    },
    {
      title: "The Dilemma",
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            Here's the paradox that makes this game fascinating:
          </p>
          <div className="space-y-3">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Individual Logic</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  "No matter what my partner does, I'm better off defecting."
                </p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• If partner cooperates: I get 5 (defect) vs 3 (cooperate)</li>
                  <li>• If partner defects: I get 1 (defect) vs 0 (cooperate)</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Collective Outcome</h4>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  When both follow individual logic, both get 1 point instead of the possible 3 each.
                </p>
              </CardContent>
            </Card>
          </div>
          <p className="text-center font-semibold text-gray-700 dark:text-gray-300">
            Rational self-interest leads to an irrational outcome!
          </p>
        </div>
      )
    }
  ]

  const handleConceptUnderstood = (index: number) => {
    setConceptsUnderstood(prev => new Set([...prev, index]))
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-center space-x-2 mb-6">
        {concepts.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              conceptsUnderstood.has(index)
                ? "bg-green-500"
                : index === currentConcept
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Current Concept */}
      <motion.div
        key={currentConcept}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              {React.createElement(concepts[currentConcept].icon, {
                className: "w-8 h-8 text-blue-600 dark:text-blue-400"
              })}
              <div>
                <CardTitle className="text-2xl">{concepts[currentConcept].title}</CardTitle>
                <Badge variant="secondary">
                  Concept {currentConcept + 1} of {concepts.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {concepts[currentConcept].content}
            
            <div className="mt-6 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentConcept(Math.max(0, currentConcept - 1))}
                disabled={currentConcept === 0}
              >
                Previous
              </Button>
              
              {!conceptsUnderstood.has(currentConcept) ? (
                <Button
                  onClick={() => handleConceptUnderstood(currentConcept)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  I Understand
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Understood
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setCurrentConcept(Math.min(concepts.length - 1, currentConcept + 1))}
                disabled={currentConcept === concepts.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Completion */}
      {allConceptsUnderstood && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                Concepts Mastered!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-4">
                You now understand the basic structure of the Prisoner's Dilemma.
              </p>
              <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                Continue to One-Off Game
              </Button>
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