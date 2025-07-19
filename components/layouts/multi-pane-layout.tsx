"use client"

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ControlSection {
  id: string
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

interface MultiPaneLayoutProps {
  controlSections: ControlSection[]
  mainContent: React.ReactNode
  className?: string
}

export function MultiPaneLayout({ 
  controlSections, 
  mainContent, 
  className 
}: MultiPaneLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    controlSections.reduce((acc, section) => ({
      ...acc,
      [section.id]: section.defaultExpanded ?? true
    }), {})
  )

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Controls Panel - Left Side */}
      <div className={cn(
        "border-r bg-muted/10 transition-all duration-300",
        isSidebarCollapsed ? "w-12" : "w-80"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isSidebarCollapsed && (
              <h2 className="text-lg font-semibold">Controls</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="ml-auto"
            >
              {isSidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>

          {/* Scrollable Controls */}
          {!isSidebarCollapsed && (
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {controlSections.map((section, index) => (
                  <div key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {expandedSections[section.id] ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <span className="font-medium text-sm">{section.title}</span>
                    </button>

                    {/* Section Content */}
                    {expandedSections[section.id] && (
                      <div className="mt-2 pl-6 space-y-3">
                        {section.children}
                      </div>
                    )}

                    {/* Section Separator */}
                    {index < controlSections.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Main Content - Center/Right */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {mainContent}
        </div>
      </div>
    </div>
  )
}

// Utility component for control groups
export function ControlGroup({ 
  label, 
  children,
  className
}: { 
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
