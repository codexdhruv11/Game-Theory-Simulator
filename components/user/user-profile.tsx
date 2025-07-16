"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Trophy, 
  Target, 
  Brain, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface UserStats {
  totalGamesPlayed: number
  gamesByType: Record<string, number>
  totalScore: number
  averageScore: number
  winRate: number
  favoriteGame: string
  totalPlayTime: number
  averageGameDuration: number
  achievements: string[]
  recentGames: Array<{
    gameType: string
    score: number
    winner: boolean
    completedAt: string
  }>
}

interface MoralAlignment {
  utilitarian: number
  deontological: number
  virtue: number
  contractual: number
  care: number
  lastUpdated: string
}

interface UserProgress {
  level: number
  experience: number
  unlockedFeatures: string[]
  completedTutorials: string[]
}

export function UserProfile() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [alignment, setAlignment] = useState<MoralAlignment | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [progressData, alignmentData] = await Promise.all([
        api.get('/users/progress'),
        api.get('/moral/alignment')
      ])

      setStats(progressData.gameStats)
      setAlignment(alignmentData.alignment)
      setProgress(progressData.progress)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDominantAlignment = (alignment: MoralAlignment) => {
    const alignments = {
      utilitarian: alignment.utilitarian,
      deontological: alignment.deontological,
      virtue: alignment.virtue,
      contractual: alignment.contractual,
      care: alignment.care,
    }

    return Object.entries(alignments).reduce((a, b) => 
      alignments[a[0] as keyof typeof alignments] > alignments[b[0] as keyof typeof alignments] ? a : b
    )[0]
  }

  const getAlignmentColor = (type: string) => {
    const colors = {
      utilitarian: 'bg-blue-500',
      deontological: 'bg-purple-500',
      virtue: 'bg-green-500',
      contractual: 'bg-orange-500',
      care: 'bg-pink-500',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-500'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please log in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading profile...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.profile.displayName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
              {user.isGuest && (
                <Badge variant="secondary" className="mt-1">Guest User</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Level {progress?.level || 1}</div>
              <div className="text-sm text-muted-foreground">
                {progress?.experience || 0} XP
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="alignment">Moral Alignment</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="recent">Recent Games</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Games Played
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalGamesPlayed || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.winRate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Total Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalScore || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Play Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(stats?.totalPlayTime || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {stats?.gamesByType && (
            <Card>
              <CardHeader>
                <CardTitle>Games by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.gamesByType).map(([gameType, count]) => (
                    <div key={gameType} className="flex justify-between items-center">
                      <span className="capitalize">{gameType.replace('-', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alignment" className="space-y-4">
          {alignment && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Moral Alignment Profile
                  </CardTitle>
                  <CardDescription>
                    Your moral alignment based on game decisions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-lg font-semibold">Dominant Alignment</div>
                    <div className="text-2xl font-bold capitalize text-primary">
                      {getDominantAlignment(alignment)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(alignment).filter(([key]) => key !== 'lastUpdated').map(([type, value]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{type}</span>
                          <span>{value > 0 ? '+' : ''}{value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getAlignmentColor(type)}`}
                            style={{ width: `${Math.abs(value)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Achievements
              </CardTitle>
              <CardDescription>
                Unlock achievements by playing games and making moral choices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.achievements && stats.achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <div className="font-medium capitalize">
                          {achievement.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Achievement unlocked!
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements yet. Keep playing to unlock them!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentGames && stats.recentGames.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentGames.map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium capitalize">
                          {game.gameType.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(game.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{game.score}</div>
                        <Badge variant={game.winner ? "default" : "secondary"}>
                          {game.winner ? "Won" : "Lost"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent games. Start playing to see your history!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}