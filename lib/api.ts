const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Type definitions
export interface User {
  _id: string
  username: string
  email?: string
  isGuest: boolean
  profile: {
    displayName: string
    avatar?: string
    bio?: string
    favoritePhilosopher?: string
    joinDate: string
    lastActive: string
  }
  gameStats: {
    totalGamesPlayed: number
    totalScore: number
    winRate: number
    favoriteGame?: string
    achievements: string[]
  }
  moralAlignment: {
    utilitarian: number
    deontological: number
    virtue: number
    contractual: number
    care: number
    lastUpdated: string
  }
  preferences: {
    theme: string
    notifications: boolean
    privacy: {
      showProfile: boolean
      showStats: boolean
      showAlignment: boolean
    }
  }
  progress: {
    level: number
    experience: number
    unlockedFeatures: string[]
    completedTutorials: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error')
  }
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; username: string; password: string; displayName: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  loginAsGuest: (username?: string) =>
    apiRequest('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  me: () => apiRequest('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
}

// Game API
export const gameApi = {
  startSession: (gameType: string, gameSettings?: any) =>
    apiRequest('/games/sessions', {
      method: 'POST',
      body: JSON.stringify({ gameType, gameSettings }),
    }),

  submitRound: (sessionId: string, roundData: any) =>
    apiRequest(`/games/sessions/${sessionId}/rounds`, {
      method: 'POST',
      body: JSON.stringify(roundData),
    }),

  completeSession: (sessionId: string, finalData: any) =>
    apiRequest(`/games/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify(finalData),
    }),

  getSession: (sessionId: string) =>
    apiRequest(`/games/sessions/${sessionId}`),

  getHistory: (params?: { gameType?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.gameType) searchParams.append('gameType', params.gameType)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    return apiRequest(`/games/history?${searchParams.toString()}`)
  },

  getStats: () => apiRequest('/games/stats'),
}

// User API
export const userApi = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (profileData: any) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  updatePreferences: (preferences: any) =>
    apiRequest('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),

  getProgress: () => apiRequest('/users/progress'),

  getAchievements: () => apiRequest('/users/achievements'),

  deleteAccount: () =>
    apiRequest('/users/account', {
      method: 'DELETE',
    }),
}

// Philosopher API
export const philosopherApi = {
  getAll: (params?: { era?: string; school?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.era) searchParams.append('era', params.era)
    if (params?.school) searchParams.append('school', params.school)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    return apiRequest(`/philosophers?${searchParams.toString()}`)
  },

  getBySlug: (slug: string) => apiRequest(`/philosophers/${slug}`),

  getGuidance: (slug: string, gameType: string, situation?: string) => {
    const searchParams = new URLSearchParams({ gameType })
    if (situation) searchParams.append('situation', situation)
    
    return apiRequest(`/philosophers/${slug}/guidance?${searchParams.toString()}`)
  },

  rate: (slug: string, rating: number) =>
    apiRequest(`/philosophers/${slug}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),
}

// Leaderboard API
export const leaderboardApi = {
  getGlobal: (params?: {
    category?: string
    gameType?: string
    timeframe?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append('category', params.category)
    if (params?.gameType) searchParams.append('gameType', params.gameType)
    if (params?.timeframe) searchParams.append('timeframe', params.timeframe)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    return apiRequest(`/leaderboards/global?${searchParams.toString()}`)
  },

  getMyRanking: (params?: { category?: string; gameType?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append('category', params.category)
    if (params?.gameType) searchParams.append('gameType', params.gameType)
    
    return apiRequest(`/leaderboards/my-ranking?${searchParams.toString()}`)
  },
}

// Statistics API
export const statisticsApi = {
  getGlobal: () => apiRequest('/statistics/global'),
}

// Moral Alignment API
export const moralApi = {
  getAlignment: () => apiRequest('/moral/alignment'),
  getAnalysis: () => apiRequest('/moral/analysis'),
}

export { ApiError }

// Export the api object
export const api = {
  // Auth endpoints
  auth: {
    register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    loginGuest: (data?: any) => apiRequest('/auth/guest', { method: 'POST', body: JSON.stringify(data || {}) }),
    refreshToken: (refreshToken: string) => apiRequest('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    me: () => apiRequest('/auth/me'),
    convertGuest: (data: any) => apiRequest('/auth/convert-guest', { method: 'POST', body: JSON.stringify(data) }),
  },

  // User endpoints
  users: {
    getProfile: () => apiRequest('/users/profile'),
    updateProfile: (data: any) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    updatePreferences: (data: any) => apiRequest('/users/preferences', { method: 'PUT', body: JSON.stringify(data) }),
    getProgress: () => apiRequest('/users/progress'),
    getAchievements: () => apiRequest('/users/achievements'),
    deleteAccount: () => apiRequest('/users/account', { method: 'DELETE' }),
  },

  // Game endpoints
  games: {
    startSession: (data: any) => apiRequest('/games/sessions', { method: 'POST', body: JSON.stringify(data) }),
    submitRound: (sessionId: string, data: any) => apiRequest(`/games/sessions/${sessionId}/rounds`, { method: 'POST', body: JSON.stringify(data) }),
    completeSession: (sessionId: string, data: any) => apiRequest(`/games/sessions/${sessionId}/complete`, { method: 'POST', body: JSON.stringify(data) }),
    getSession: (sessionId: string) => apiRequest(`/games/sessions/${sessionId}`),
    getHistory: (params?: any) => apiRequest(`/games/history${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    getStats: () => apiRequest('/games/stats'),
  },

  // Philosopher endpoints
  philosophers: {
    getAll: (params?: any) => apiRequest(`/philosophers${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    get: (slug: string) => apiRequest(`/philosophers/${slug}`),
    getGuidance: (slug: string, params: any) => apiRequest(`/philosophers/${slug}/guidance?${new URLSearchParams(params).toString()}`),
    rate: (slug: string, rating: number) => apiRequest(`/philosophers/${slug}/rate`, { method: 'POST', body: JSON.stringify({ rating }) }),
  },

  // Leaderboard endpoints
  leaderboards: {
    getGlobal: (params?: any) => apiRequest(`/leaderboards/global${params ? '?' + new URLSearchParams(params).toString() : ''}`),
    getMyRanking: (params?: any) => apiRequest(`/leaderboards/my-ranking${params ? '?' + new URLSearchParams(params).toString() : ''}`),
  },

  // Statistics endpoints
  statistics: {
    getGlobal: () => apiRequest('/statistics/global'),
  },

  // Moral alignment endpoints
  moral: {
    getAlignment: () => apiRequest('/moral/alignment'),
    getAnalysis: () => apiRequest('/moral/analysis'),
  },

  // Utility methods
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),

  // Token management methods
  setTokens: (tokens: AuthTokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken)
      }
    }
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  },
}