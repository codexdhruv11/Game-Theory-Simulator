"use client"

import React, { useState } from 'react'
import { cn } from "@/lib/utils"
import { 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlSection {
  id: string
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  priority?: 'high' | 'medium' | 'low'
}

interface ControlPanelLayoutProps {
  sections: ControlSection[]
  mainContent: React.ReactNode
  rightPanel?: React.ReactNode
  className?: string
}

export function ControlPanelLayout({ 
  sections, 
  mainContent,
  rightPanel,
  className 
}: ControlPanelLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Group sections by priority
  const highPrioritySections = sections.filter(s => s.priority === 'high')
  const mediumPrioritySections = sections.filter(s => s.priority === 'medium' || !s.priority)
  const lowPrioritySections = sections.filter(s => s.priority === 'low')

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const expandAll = () => {
    const allExpanded = sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: true
    }), {})
    setExpandedSections(allExpanded)
  }

  const collapseAll = () => {
    setExpandedSections({})
  }

  return (
    <div className={cn(
      "flex h-screen overflow-hidden bg-background",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Left Control Panel */}
      <div className={cn(
        "border-r bg-muted/5 transition-all duration-300 flex flex-col",
        leftPanelCollapsed ? "w-12" : "w-80"
      )}>
        {/* Panel Header */}
        <div className="flex items-center justify-between p-3 border-b h-14">
          {!leftPanelCollapsed && (
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Controls
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className={cn("h-8 w-8", leftPanelCollapsed && "ml-auto")}
          >
            {leftPanelCollapsed ? 
              <PanelLeftOpen className="h-4 w-4" /> : 
              <PanelLeftClose className="h-4 w-4" />
            }
          </Button>
        </div>

        {/* Controls Content */}
        {!leftPanelCollapsed && (
          <>
            {/* Quick Actions */}
            <div className="flex gap-2 p-3 border-b">
              <Button 
                variant="outline" 
                size="sm"
                onClick={expandAll}
                className="flex-1 text-xs"
              >
                Expand All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={collapseAll}
                className="flex-1 text-xs"
              >
                Collapse All
              </Button>
            </div>

            {/* Tabbed Organization */}
            <Tabs defaultValue="essential" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b h-9">
                <TabsTrigger value="essential" className="flex-1 text-xs">
                  Essential
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1 text-xs">
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex-1 text-xs">
                  Effects
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="essential" className="m-0 p-3 space-y-2">
                  {renderSections(highPrioritySections, expandedSections, toggleSection)}
                </TabsContent>
                <TabsContent value="advanced" className="m-0 p-3 space-y-2">
                  {renderSections(mediumPrioritySections, expandedSections, toggleSection)}
                </TabsContent>
                <TabsContent value="effects" className="m-0 p-3 space-y-2">
                  {renderSections(lowPrioritySections, expandedSections, toggleSection)}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Viewport Header */}
        <div className="flex items-center justify-between p-3 border-b h-14 bg-muted/5">
          <h2 className="text-sm font-semibold">Preview</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8"
          >
            {isFullscreen ? 
              <Minimize2 className="h-4 w-4" /> : 
              <Maximize2 className="h-4 w-4" />
            }
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-black/5">
          {mainContent}
        </div>
      </div>

      {/* Optional Right Panel */}
      {rightPanel && (
        <div className={cn(
          "border-l bg-muted/5 transition-all duration-300",
          rightPanelCollapsed ? "w-12" : "w-64"
        )}>
          <div className="flex items-center justify-between p-3 border-b h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              className="h-8 w-8"
            >
              {rightPanelCollapsed ? 
                <PanelLeftClose className="h-4 w-4" /> : 
                <PanelLeftOpen className="h-4 w-4" />
              }
            </Button>
            {!rightPanelCollapsed && (
              <h2 className="text-sm font-semibold">Properties</h2>
            )}
          </div>
          {!rightPanelCollapsed && (
            <ScrollArea className="h-[calc(100vh-3.5rem)]">
              <div className="p-3">
                {rightPanel}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to render sections
function renderSections(
  sections: ControlSection[],
  expandedSections: Record<string, boolean>,
  toggleSection: (id: string) => void
) {
  return sections.map((section, index) => (
    <div key={section.id} className="rounded-lg border bg-card">
      {/* Section Header */}
      <button
        onClick={() => toggleSection(section.id)}
        className="flex items-center w-full p-3 hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        {expandedSections[section.id] ? (
          <ChevronDown className="h-3 w-3 mr-2" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-2" />
        )}
        {section.icon && <span className="mr-2">{section.icon}</span>}
        <span className="font-medium text-sm">{section.title}</span>
      </button>

      {/* Section Content */}
      {expandedSections[section.id] && (
        <div className="p-3 pt-0 space-y-3">
          {section.children}
        </div>
      )}
    </div>
  ))
}

// Utility component for control groups
export function ControlGroup({ 
  label, 
  children,
  className,
  compact = false
}: { 
  label: string
  children: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn(
      compact ? "space-y-1" : "space-y-2",
      className
    )}>
      <label className={cn(
        "font-medium text-muted-foreground",
        compact ? "text-xs" : "text-sm"
      )}>
        {label}
      </label>
      {children}
    </div>
  )
}
