"use client"

import { useState } from 'react'
import { ControlPanelLayout, ControlGroup } from '@/components/layouts/control-panel-layout'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { 
  Sparkles, 
  Sun, 
  Palette, 
  Zap, 
  Monitor,
  Aperture,
  Layers,
  Sliders,
  Image
} from 'lucide-react'

export default function EffectsEditorPage() {
  // State for various controls
  const [bloomIntensity, setBloomIntensity] = useState([0.5])
  const [exposure, setExposure] = useState([1.0])
  const [contrast, setContrast] = useState([1.0])
  const [depthOfFieldEnabled, setDepthOfFieldEnabled] = useState(true)
  const [focalDistance, setFocalDistance] = useState([10])
  const [glitchEnabled, setGlitchEnabled] = useState(false)
  const [noiseAmount, setNoiseAmount] = useState([0.1])

  // Define control sections with proper organization
  const controlSections = [
    {
      id: 'lighting',
      title: 'Lighting & Bloom',
      icon: <Sun className="h-4 w-4" />,
      priority: 'high' as const,
      children: (
        <div className="space-y-4">
          <ControlGroup label="Bloom Intensity" compact>
            <Slider 
              value={bloomIntensity} 
              onValueChange={setBloomIntensity}
              max={2}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{bloomIntensity[0].toFixed(2)}</span>
              <span>2.0</span>
            </div>
          </ControlGroup>
          <ControlGroup label="Bloom Threshold" compact>
            <Slider defaultValue={[0.8]} max={1} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Bloom Radius" compact>
            <Slider defaultValue={[4]} max={10} step={1} className="w-full" />
          </ControlGroup>
        </div>
      )
    },
    {
      id: 'camera',
      title: 'Camera & Depth of Field',
      icon: <Aperture className="h-4 w-4" />,
      priority: 'high' as const,
      children: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dof-enabled" className="text-sm">Enable DOF</Label>
            <Switch 
              id="dof-enabled"
              checked={depthOfFieldEnabled}
              onCheckedChange={setDepthOfFieldEnabled}
            />
          </div>
          <ControlGroup label="Focal Distance" compact>
            <Slider 
              value={focalDistance} 
              onValueChange={setFocalDistance}
              max={50}
              step={0.1}
              disabled={!depthOfFieldEnabled}
              className="w-full"
            />
          </ControlGroup>
          <ControlGroup label="Aperture" compact>
            <Slider 
              defaultValue={[1.4]} 
              max={22} 
              min={1.4} 
              step={0.1}
              disabled={!depthOfFieldEnabled}
              className="w-full" 
            />
          </ControlGroup>
          <ControlGroup label="Bokeh Scale" compact>
            <Slider 
              defaultValue={[1]} 
              max={3} 
              step={0.1}
              disabled={!depthOfFieldEnabled}
              className="w-full" 
            />
          </ControlGroup>
        </div>
      )
    },
    {
      id: 'tonemapping',
      title: 'Tonemapping',
      icon: <Monitor className="h-4 w-4" />,
      priority: 'high' as const,
      children: (
        <div className="space-y-4">
          <ControlGroup label="Mode" compact>
            <Select defaultValue="aces">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="reinhard">Reinhard</SelectItem>
                <SelectItem value="aces">ACES Filmic</SelectItem>
              </SelectContent>
            </Select>
          </ControlGroup>
          <ControlGroup label="Exposure" compact>
            <Slider 
              value={exposure} 
              onValueChange={setExposure}
              max={3}
              min={0}
              step={0.01}
              className="w-full"
            />
          </ControlGroup>
          <ControlGroup label="Gamma" compact>
            <Slider defaultValue={[2.2]} max={3} min={1} step={0.01} className="w-full" />
          </ControlGroup>
        </div>
      )
    },
    {
      id: 'color-correction',
      title: 'Color Correction',
      icon: <Palette className="h-4 w-4" />,
      priority: 'medium' as const,
      children: (
        <div className="space-y-4">
          <ControlGroup label="Temperature" compact>
            <Slider defaultValue={[0]} max={1} min={-1} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Tint" compact>
            <Slider defaultValue={[0]} max={1} min={-1} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Contrast" compact>
            <Slider 
              value={contrast} 
              onValueChange={setContrast}
              max={2}
              min={0}
              step={0.01}
              className="w-full"
            />
          </ControlGroup>
          <ControlGroup label="Brightness" compact>
            <Slider defaultValue={[0]} max={1} min={-1} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Saturation" compact>
            <Slider defaultValue={[1]} max={2} min={0} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Vibrance" compact>
            <Slider defaultValue={[0]} max={1} min={-1} step={0.01} className="w-full" />
          </ControlGroup>
        </div>
      )
    },
    {
      id: 'effects',
      title: 'Special Effects',
      icon: <Zap className="h-4 w-4" />,
      priority: 'low' as const,
      children: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="glitch-enabled" className="text-sm">Enable Glitch</Label>
            <Switch 
              id="glitch-enabled"
              checked={glitchEnabled}
              onCheckedChange={setGlitchEnabled}
            />
          </div>
          <ControlGroup label="Glitch Intensity" compact>
            <Slider 
              defaultValue={[0.5]} 
              max={1} 
              step={0.01}
              disabled={!glitchEnabled}
              className="w-full" 
            />
          </ControlGroup>
          <ControlGroup label="Noise Amount" compact>
            <Slider 
              value={noiseAmount} 
              onValueChange={setNoiseAmount}
              max={1}
              step={0.01}
              className="w-full"
            />
          </ControlGroup>
          <ControlGroup label="Chromatic Aberration" compact>
            <Slider defaultValue={[0]} max={5} step={0.01} className="w-full" />
          </ControlGroup>
          <ControlGroup label="Vignette" compact>
            <Slider defaultValue={[0.3]} max={1} step={0.01} className="w-full" />
          </ControlGroup>
        </div>
      )
    }
  ]

  // Right panel content
  const rightPanelContent = (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Performance</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">FPS</span>
            <span className="font-mono">60</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GPU</span>
            <span className="font-mono">45%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Memory</span>
            <span className="font-mono">2.1GB</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Reset All
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Save Preset
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Load Preset
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Export Settings</h3>
        <div className="space-y-3">
          <ControlGroup label="Format" compact>
            <Select defaultValue="png">
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </ControlGroup>
          <ControlGroup label="Quality" compact>
            <Slider defaultValue={[90]} max={100} step={1} className="w-full" />
          </ControlGroup>
          <Button className="w-full" size="sm">
            Export Image
          </Button>
        </div>
      </Card>
    </div>
  )

  // Main viewport content (placeholder)
  const mainViewportContent = (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
      <div className="text-center">
        <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Preview Area</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This is where your image preview would appear with all the applied effects in real-time
        </p>
      </div>
    </div>
  )

  return (
    <ControlPanelLayout
      sections={controlSections}
      mainContent={mainViewportContent}
      rightPanel={rightPanelContent}
    />
  )
}
