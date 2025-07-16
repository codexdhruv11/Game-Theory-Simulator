"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Target,
  Clock,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface LeaderboardEntry {
  username: string
  profile: {
    displayName: string
    avatar?: string
  }
  totalScore?: number
  gamesPlayed?: number
  winRate?: number
  level?: number
  experience?: number
  cooperationRate?: number
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  category: string
  gameType: string
  timeframe: string
}

const categories = [
  { value: 'totalScore', label: 'Total Score', icon: Trophy },
  { value: 'winRate', label: 'Win Rate', icon: Target },
  { value: 'gamesPlayed', label: 'Games Played', icon: Users },
  { value: 'level', label: 'Level', icon: Crown },
  { value: 'cooperation', label: 'Cooperation Rate', icon: Award },
]

const gameTypes = [
  { value: 'all', label: 'All Games' },
  { value: 'prisoners-dilemma', label: 'Prisoner\'s Dilemma' },
  { value: 'nash-equilibrium', label: 'Nash Equilibrium' },
  { value: 'zero-sum-game', label: 'Zero-Sum Game' },
  { value: 'auction-simulator', label: 'Auction Theory' },
  { value: 'evolutionary-game', label: 'Evolutionary Game' },
]

const timeframes = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

export function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('totalScore')
  const [gameType, setGameType] = useState('all')
  const [timeframe, setTimeframe] = useState('all')
  const [userRanking, setUserRanking] = useState<any>(null)

  useEffect(() => {
    loadLeaderboard()
    if (user && !user.isGuest) {
      loadUserRanking()
    }
  }, [category, gameType, timeframe, user])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        category,
        timeframe,
        limit: '20',
      })
      
      if (gameType !== 'all') {
        params.append('gameType', gameType)
      }

      const response = await api.get(`/leaderboards/global?${params}`)
      setData(response)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRanking = async () => {
    try {
      const params = new URLSearchParams({ category })
      if (gameType !== 'all') {
        params.append('gameType', gameType)
      }

      const response = await api.get(`/leaderboards/my-ranking?${params}`)
      setUserRanking(response.ranking)
    } catch (error) {
      console.error('Failed to load user ranking:', error)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>
    }
  }

  const getValueDisplay = (entry: LeaderboardEntry, category: string) => {
    switch (category) {
      case 'totalScore':
        return entry.totalScore?.toLocaleString() || '0'
      case 'winRate':
        return `${entry.winRate?.toFixed(1) || '0'}%`
      case 'gamesPlayed':
        return entry.gamesPlayed?.toLocaleString() || '0'
      case 'level':
        return `Level ${entry.level || 1}`
      case 'cooperation':
        return `${entry.cooperationRate?.toFixed(1) || '0'}%`
      default:
        return '0'
    }
  }

  const selectedCategory = categories.find(cat => cat.value === category)
  const CategoryIcon = selectedCategory?.icon || Trophy

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Leaderboards
          </CardTitle>
          <CardDescription>
            Compete with players worldwide across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center">
                        <cat.icon className="w-4 h-4 mr-2" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Game Type</label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((frame) => (
                    <SelectItem key={frame.value} value={frame.value}>
                      {frame.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Ranking */}
      {user && !user.isGuest && userRanking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold">#{userRanking.rank}</div>
                <div>
                  <div className="font-medium">{user.profile.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    Top {userRanking.percentile}% of players
                  </div>
                </div>
              </div>
              <Badge variant="outline">
                {userRanking.rank} of {userRanking.total}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CategoryIcon className="w-5 h-5 mr-2" />
            {selectedCategory?.label} Leaderboard
          </CardTitle>
          <CardDescription>
            {gameType === 'all' ? 'All Games' : gameTypes.find(t => t.value === gameType)?.label} • {timeframes.find(t => t.value === timeframe)?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          ) : data?.leaderboard && data.leaderboard.length > 0 ? (
            <div className="space-y-2">
              {data.leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                    user?.username === entry.username 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {entry.profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{entry.profile.displayName}</div>
                    <div className="text-sm text-muted-foreground">@{entry.username}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">{getValueDisplay(entry, category)}</div>
                    {entry.gamesPlayed && (
                      <div className="text-xs text-muted-foreground">
                        {entry.gamesPlayed} games
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No leaderboard data available for this category.</p>
              <p className="text-sm">Be the first to play and claim the top spot!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}