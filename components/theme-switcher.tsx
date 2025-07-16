"use client"

import * as React from "react"
import { Moon, Sun, Palette, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  
  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "system", label: "System", icon: Monitor },
    { name: "theme-academic", label: "Academic", icon: Palette },
    { name: "theme-neon", label: "Neon", icon: Palette },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" data-testid="theme-switcher">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.name
          
          return (
            <DropdownMenuItem 
              key={themeOption.name}
              onClick={() => setTheme(themeOption.name)} 
              data-testid={`theme-${themeOption.name}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Icon className="mr-2 h-4 w-4" />
                {themeOption.label}
              </div>
              {isActive && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
