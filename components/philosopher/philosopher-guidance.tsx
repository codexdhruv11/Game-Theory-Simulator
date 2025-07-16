"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Quote, Brain, Star, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'

interface Philosopher {
  name: string
  slug: string
  era: string
  school: string
  avatar: string
  biography: {
    brief: string
  }
  moralAlignment: {
    utilitarian: number
    deontological: number
    virtue: number
    contractual: number
    care: number
  }
  popularity: {
    averageRating: number
    totalRatings: number
  }
}

interface PhilosopherGuidance {
  philosopher: {
    name: string
    slug: string
    avatar: string
  }
  guidance: {
    type: string
    advice?: string
    cooperationAdvice?: string
    defectionAdvice?: string
    generalStrategy?: string
    reasoning: string
    quote?: {
      text: string
      context: string
      source?: string
    }
  }
}

interface PhilosopherGuidanceProps {
  gameType: string
  situation?: string
  onGuidanceReceived?: (guidance: PhilosopherGuidance) => void
}

export function PhilosopherGuidance({ gameType, situation, onGuidanceReceived }: PhilosopherGuidanceProps) {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([])
  const [selectedPhilosopher, setSelectedPhilosopher] = useState<string>('')
  const [guidance, setGuidance] = useState<PhilosopherGuidance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPhilosophers()
  }, [])

  const loadPhilosophers = async () => {
    try {
      const response = await api.get('/philosophers')
      setPhilosophers(response.philosophers)
    } catch (error) {
      console.error('Failed to load philosophers:', error)
      setError('Failed to load philosophers')
    }
  }

  const getGuidance = async () => {
    if (!selectedPhilosopher) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        gameType,
        ...(situation && { situation }),
      })

      const response = await api.get(`/philosophers/${selectedPhilosopher}/guidance?${params}`)
      setGuidance(response)
      
      if (onGuidanceReceived) {
        onGuidanceReceived(response)
      }
    } catch (error) {
      console.error('Failed to get guidance:', error)
      setError('Failed to get philosopher guidance')
    } finally {
      setIsLoading(false)
    }
  }

  const getAlignmentColor = (alignment: string, value: number) => {
    const intensity = Math.abs(value) / 100
    const colors = {
      utilitarian: `hsl(210, 100%, ${100 - intensity * 30}%)`,
      deontological: `hsl(260, 100%, ${100 - intensity * 30}%)`,
      virtue: `hsl(120, 100%, ${100 - intensity * 30}%)`,
      contractual: `hsl(30, 100%, ${100 - intensity * 30}%)`,
      care: `hsl(340, 100%, ${100 - intensity * 30}%)`,
    }
    return colors[alignment as keyof typeof colors] || 'hsl(0, 0%, 50%)'
  }

  const selectedPhil = philosophers.find(p => p.slug === selectedPhilosopher)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Philosopher Guidance
          </CardTitle>
          <CardDescription>
            Get strategic advice from history's greatest moral philosophers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose a Philosopher</label>
            <Select value={selectedPhilosopher} onValueChange={setSelectedPhilosopher}>
              <SelectTrigger>
                <SelectValue placeholder="Select a philosopher for guidance" />
              </SelectTrigger>
              <SelectContent>
                {philosophers.map((philosopher) => (
                  <SelectItem key={philosopher.slug} value={philosopher.slug}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={philosopher.avatar} alt={philosopher.name} />
                        <AvatarFallback>{philosopher.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{philosopher.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {philosopher.era} • {philosopher.school}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPhil && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-muted/50 rounded-lg space-y-3"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPhil.avatar} alt={selectedPhil.name} />
                  <AvatarFallback>{selectedPhil.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{selectedPhil.name}</h3>
                    <Badge variant="outline">{selectedPhil.era}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPhil.biography.brief}
                  </p>
                  {selectedPhil.popularity.totalRatings > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">
                        {selectedPhil.popularity.averageRating.toFixed(1)} 
                        ({selectedPhil.popularity.totalRatings} ratings)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Moral Alignment</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(selectedPhil.moralAlignment).map(([alignment, value]) => (
                    <div key={alignment} className="text-center">
                      <div
                        className="h-2 rounded-full mb-1"
                        style={{
                          backgroundColor: getAlignmentColor(alignment, value),
                          opacity: Math.abs(value) / 100,
                        }}
                      />
                      <div className="text-xs capitalize">{alignment}</div>
                      <div className="text-xs font-mono">{value > 0 ? '+' : ''}{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <Button 
            onClick={getGuidance} 
            disabled={!selectedPhilosopher || isLoading}
            className="w-full"
          >
            {isLoading ? 'Getting Guidance...' : 'Get Philosophical Guidance'}
          </Button>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {guidance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={guidance.philosopher.avatar} alt={guidance.philosopher.name} />
                    <AvatarFallback>{guidance.philosopher.name[0]}</AvatarFallback>
                  </Avatar>
                  Guidance from {guidance.philosopher.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guidance.guidance.cooperationAdvice && guidance.guidance.defectionAdvice ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-600">On Cooperation</h4>
                      <p className="text-sm">{guidance.guidance.cooperationAdvice}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600">On Defection</h4>
                      <p className="text-sm">{guidance.guidance.defectionAdvice}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-medium">Strategic Advice</h4>
                    <p className="text-sm">{guidance.guidance.advice}</p>
                  </div>
                )}

                {guidance.guidance.generalStrategy && (
                  <div className="space-y-2">
                    <h4 className="font-medium">General Strategy</h4>
                    <p className="text-sm">{guidance.guidance.generalStrategy}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Philosophical Reasoning</h4>
                  <p className="text-sm text-muted-foreground">{guidance.guidance.reasoning}</p>
                </div>

                {guidance.guidance.quote && (
                  <div className="border-l-4 border-primary pl-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 mt-1 text-primary" />
                      <div>
                        <p className="text-sm italic">"{guidance.guidance.quote.text}"</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {guidance.guidance.quote.context}
                          {guidance.guidance.quote.source && ` - ${guidance.guidance.quote.source}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}