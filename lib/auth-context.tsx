"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
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
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: { email: string; username: string; password: string; displayName: string }) => Promise<void>
  loginAsGuest: (username?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User['profile']>) => Promise<void>
  updatePreferences: (data: Partial<User['preferences']>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken)
      if (data.tokens.refreshToken) {
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
      }

      setUser(data.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { email: string; username: string; password: string; displayName: string }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('accessToken', data.tokens.accessToken)
      if (data.tokens.refreshToken) {
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
      }

      setUser(data.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsGuest = async (username?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Guest login failed')
      }

      const data = await response.json()
      
      // Store access token (no refresh token for guests)
      localStorage.setItem('accessToken', data.tokens.accessToken)

      setUser(data.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('No authentication token')

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Profile update failed')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      throw error
    }
  }

  const updatePreferences = async (preferencesData: Partial<User['preferences']>) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('No authentication token')

      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Preferences update failed')
      }

      const data = await response.json()
      setUser(prevUser => prevUser ? { ...prevUser, preferences: data.preferences } : null)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    loginAsGuest,
    logout,
    refreshUser,
    updateProfile,
    updatePreferences,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}