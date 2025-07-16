"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BentoItemProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function BentoItem({ title, description, children, className }: BentoItemProps) {
  return (
    <Card className={cn("h-full", className)} data-testid="bento-item">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {children}
      </CardContent>
    </Card>
  )
}

interface BentoLayoutProps {
  children: React.ReactNode
}

export function BentoLayout({ children }: BentoLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6" data-testid="bento-grid">
      {children}
    </div>
  )
}