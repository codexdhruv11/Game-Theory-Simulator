"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, User, AuthTokens } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    email: string
    username: string
    password: string
    displayName: string
  }) => Promise<{ success: boolean; error?: string }>
  loginAsGuest: (username?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
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
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Only check auth if we have a token
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!token) {
        setIsLoading(false)
        return
      }
      
      const response = await api.auth.me()
      if (response.user) {
        setUser(response.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.auth.login({ email, password })
      
      if (response.user && response.tokens) {
        api.setTokens(response.tokens)
        setUser(response.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || response.message || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: {
    email: string
    username: string
    password: string
    displayName: string
  }) => {
    try {
      setIsLoading(true)
      const response = await api.auth.register(userData)
      
      if (response.user && response.tokens) {
        api.setTokens(response.tokens)
        setUser(response.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || response.message || 'Registration failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsGuest = async (username?: string) => {
    try {
      setIsLoading(true)
      const response = await api.auth.loginGuest({ username })
      
      if (response.user && response.tokens) {
        api.setTokens(response.tokens)
        setUser(response.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || response.message || 'Guest login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Guest login failed' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      api.clearTokens()
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.auth.me()
      if (response.user) {
        setUser(response.user)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    loginAsGuest,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}