"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface BentoItemProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'feature' | 'stat' | 'action' | 'hero'
  gradient?: string
  icon?: LucideIcon
}

export function BentoItem({ 
  title, 
  description, 
  children, 
  className,
  variant = 'default',
  gradient,
  icon: Icon
}: BentoItemProps) {
  const baseStyles = "relative overflow-hidden transition-all duration-300"
  
  const variants = {
    default: "bg-card hover:shadow-lg border rounded-2xl p-6",
    feature: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 border rounded-3xl p-8",
    stat: "bg-card border rounded-2xl p-6 hover:scale-105",
    action: "bg-primary text-primary-foreground rounded-2xl p-6 hover:shadow-xl",
    hero: "bg-gradient-to-br rounded-3xl p-8 min-h-[300px] flex flex-col justify-between"
  }

  return (
    <div 
      className={cn(
        baseStyles,
        variants[variant],
        gradient && "text-white",
        className
      )} 
      data-testid="bento-item"
      style={gradient ? { background: gradient } : undefined}
    >
      {Icon && (
        <div className={cn(
          "mb-4",
          variant === 'hero' ? "text-4xl" : "text-2xl",
          variant === 'action' ? "text-primary-foreground" : "text-primary"
        )}>
          <Icon className="w-8 h-8" />
        </div>
      )}
      
      {title && (
        <h3 className={cn(
          "font-bold mb-2",
          variant === 'hero' ? "text-3xl" : "text-xl",
          gradient && "text-white"
        )}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={cn(
          "mb-4",
          variant === 'hero' ? "text-lg opacity-90" : "text-sm text-muted-foreground",
          gradient && "text-white/80"
        )}>
          {description}
        </p>
      )}
      
      <div className={variant === 'hero' ? "mt-auto" : ""}>
        {children}
      </div>
    </div>
  )
}

interface BentoLayoutProps {
  children: React.ReactNode
  className?: string
}

export function BentoLayout({ children, className }: BentoLayoutProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto p-4 md:p-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-min" data-testid="bento-grid">
        {children}
      </div>
    </div>
  )
}
