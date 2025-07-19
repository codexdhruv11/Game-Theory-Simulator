"use client"

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { GripVertical } from 'lucide-react'

interface SplitViewLayoutProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  defaultLeftWidth?: number // percentage
  minLeftWidth?: number // percentage
  maxLeftWidth?: number // percentage
  className?: string
}

export function SplitViewLayout({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 50,
  className
}: SplitViewLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const container = document.getElementById('split-view-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
        setLeftWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minLeftWidth, maxLeftWidth])

  return (
    <div 
      id="split-view-container"
      className={cn("flex h-full overflow-hidden", className)}
    >
      {/* Left Panel */}
      <div 
        className="overflow-auto"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Divider */}
      <div
        className={cn(
          "relative w-1 bg-border cursor-col-resize hover:bg-primary/20 transition-colors",
          isDragging && "bg-primary/30"
        )}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Right Panel */}
      <div 
        className="flex-1 overflow-auto"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  )
}

// Horizontal split variant
interface HorizontalSplitViewProps {
  topPanel: React.ReactNode
  bottomPanel: React.ReactNode
  defaultTopHeight?: number // percentage
  minTopHeight?: number // percentage
  maxTopHeight?: number // percentage
  className?: string
}

export function HorizontalSplitView({
  topPanel,
  bottomPanel,
  defaultTopHeight = 50,
  minTopHeight = 30,
  maxTopHeight = 70,
  className
}: HorizontalSplitViewProps) {
  const [topHeight, setTopHeight] = useState(defaultTopHeight)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const container = document.getElementById('horizontal-split-container')
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100

      if (newHeight >= minTopHeight && newHeight <= maxTopHeight) {
        setTopHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minTopHeight, maxTopHeight])

  return (
    <div 
      id="horizontal-split-container"
      className={cn("flex flex-col h-full overflow-hidden", className)}
    >
      {/* Top Panel */}
      <div 
        className="overflow-auto"
        style={{ height: `${topHeight}%` }}
      >
        {topPanel}
      </div>

      {/* Divider */}
      <div
        className={cn(
          "relative h-1 bg-border cursor-row-resize hover:bg-primary/20 transition-colors",
          isDragging && "bg-primary/30"
        )}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Bottom Panel */}
      <div 
        className="flex-1 overflow-auto"
        style={{ height: `${100 - topHeight}%` }}
      >
        {bottomPanel}
      </div>
    </div>
  )
}
