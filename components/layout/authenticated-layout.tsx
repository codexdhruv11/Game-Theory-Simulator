"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/login-form'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User, Settings, Trophy, Brain, LogOut, BarChart3, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, login, register, loginAsGuest, logout, isLoading } = useAuth()
  const [error, setError] = useState<string | undefined>()
  const [showGuestBanner, setShowGuestBanner] = useState(true)

  const handleLogin = async (credentials: { email: string; password: string }) => {
    const result = await login(credentials.email, credentials.password)
    if (!result.success) {
      setError(result.error)
    } else {
      setError(undefined)
    }
  }

  const handleRegister = async (userData: { email: string; username: string; password: string; displayName: string }) => {
    const result = await register(userData)
    if (!result.success) {
      setError(result.error)
    } else {
      setError(undefined)
    }
  }

  const handleGuestLogin = async (username?: string) => {
    const result = await loginAsGuest(username)
    if (!result.success) {
      setError(result.error)
    } else {
      setError(undefined)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuestLogin={handleGuestLogin}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center p-6 border-b">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Game Theory Simulator</h1>
          <p className="text-muted-foreground">Interactive simulations and analysis</p>
        </motion.div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profile?.avatar} alt={user.profile?.displayName} />
                  <AvatarFallback>
                    {user.profile?.displayName?.[0] || user.username[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.profile?.displayName || user.username}</p>
                  {user.email && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                  {user.isGuest && (
                    <p className="text-xs text-orange-600">Guest User</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Statistics</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Leaderboards</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Brain className="mr-2 h-4 w-4" />
                <span>Moral Alignment</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {user.isGuest && showGuestBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 max-w-sm"
        >
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800"
              onClick={() => setShowGuestBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-orange-900 dark:text-orange-100 pr-6">
              Guest Mode
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              Create an account to save your progress across devices and unlock all features.
            </p>
            <Button size="sm" className="mt-2" variant="outline">
              Create Account
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}