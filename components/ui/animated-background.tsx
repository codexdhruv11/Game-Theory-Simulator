"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createParticleEffect, easeOutExpo, easeInOutCubic } from "@/lib/animation-utils"

export interface AnimatedBackgroundProps {
  variant?: "default" | "game" | "results" | "intro"
  intensity?: "low" | "medium" | "high"
  interactive?: boolean
  className?: string
  reducedMotion?: boolean
  particleCount?: number
  children?: React.ReactNode
}

export function AnimatedBackground({
  variant = "default",
  intensity = "medium",
  interactive = true,
  className,
  reducedMotion = false,
  particleCount = 20,
  children
}: AnimatedBackgroundProps) {
  const controls = useAnimation()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [particles, setParticles] = useState<Array<{ x: number, y: number, size: number, speed: number }>>([])
  
  // Motion values for gradient animation
  const gradientAngle = useMotionValue(45)
  const gradientPosition = useMotionValue(0)
  const transformedAngle = useTransform(gradientAngle, value => `${value}deg`)
  const transformedPosition = useTransform(gradientPosition, value => `${value}%`)
  
  // Get variant-specific settings
  const getVariantSettings = () => {
    switch (variant) {
      case "game":
        return {
          gradientColors: "from-blue-50 via-white to-green-50 dark:from-blue-900/20 dark:via-gray-900 dark:to-green-900/20",
          particleColor: "bg-blue-400/10 dark:bg-blue-400/20",
          shapeColor: "border-blue-200/30 dark:border-blue-400/20",
          animationSpeed: 1.2
        }
      case "results":
        return {
          gradientColors: "from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-900 dark:to-blue-900/20",
          particleColor: "bg-purple-400/10 dark:bg-purple-400/20",
          shapeColor: "border-purple-200/30 dark:border-purple-400/20",
          animationSpeed: 1
        }
      case "intro":
        return {
          gradientColors: "from-amber-50 via-white to-orange-50 dark:from-amber-900/20 dark:via-gray-900 dark:to-orange-900/20",
          particleColor: "bg-amber-400/10 dark:bg-amber-400/20",
          shapeColor: "border-amber-200/30 dark:border-amber-400/20",
          animationSpeed: 1.5
        }
      default:
        return {
          gradientColors: "from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-900 dark:to-purple-900/20",
          particleColor: "bg-blue-400/10 dark:bg-blue-400/20",
          shapeColor: "border-blue-200/30 dark:border-blue-400/20",
          animationSpeed: 1
        }
    }
  }
  
  // Get intensity-specific settings
  const getIntensitySettings = () => {
    switch (intensity) {
      case "low":
        return {
          particleCount: Math.max(10, particleCount / 2),
          animationSpeed: 0.7,
          particleOpacity: 0.05,
          gradientOpacity: 0.3
        }
      case "high":
        return {
          particleCount: Math.min(40, particleCount * 1.5),
          animationSpeed: 1.3,
          particleOpacity: 0.15,
          gradientOpacity: 0.7
        }
      default: // medium
        return {
          particleCount: particleCount,
          animationSpeed: 1,
          particleOpacity: 0.1,
          gradientOpacity: 0.5
        }
    }
  }
  
  const variantSettings = getVariantSettings()
  const intensitySettings = getIntensitySettings()
  
  // Initialize particles
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
      
      // Skip particle generation if reduced motion is enabled
      if (reducedMotion) return
      
      const newParticles = Array.from({ length: intensitySettings.particleCount }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1
      }))
      
      setParticles(newParticles)
    }
  }, [intensitySettings.particleCount, reducedMotion])
  
  // Handle mouse movement for interactive effects
  useEffect(() => {
    if (!interactive || reducedMotion) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / dimensions.width,
        y: e.clientY / dimensions.height
      })
      
      // Subtle gradient shift based on mouse position
      gradientAngle.set(45 + (mousePosition.x - 0.5) * 20)
      gradientPosition.set((mousePosition.y * 30) + 10)
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [interactive, dimensions, mousePosition.x, mousePosition.y, gradientAngle, gradientPosition, reducedMotion])
  
  // Animate background
  useEffect(() => {
    if (reducedMotion) return
    
    const animateGradient = async () => {
      while (true) {
        await controls.start({
          backgroundPosition: ["0% 0%", "100% 100%"],
          transition: { 
            duration: 20 * (1 / variantSettings.animationSpeed), 
            ease: easeInOutCubic,
            repeat: Infinity,
            repeatType: "reverse"
          }
        })
      }
    }
    
    animateGradient()
  }, [controls, variantSettings.animationSpeed, reducedMotion])
  
  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {/* Base gradient background */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          variantSettings.gradientColors
        )}
        animate={controls}
        style={{ 
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Geometric shapes */}
      {!reducedMotion && (
        <>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border-8 border-opacity-20 transform -translate-x-1/2 -translate-y-1/2 blur-xl animate-slow-spin">
            <div className={cn("w-full h-full rounded-full", variantSettings.shapeColor)} />
          </div>
          
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full border-8 border-opacity-10 transform translate-x-1/2 translate-y-1/2 blur-xl animate-reverse-slow-spin">
            <div className={cn("w-full h-full rounded-full", variantSettings.shapeColor)} />
          </div>
          
          <div className="absolute top-2/3 left-1/2 w-80 h-80 rounded-full border-8 border-opacity-15 transform -translate-x-1/2 translate-y-1/4 blur-xl animate-slow-pulse">
            <div className={cn("w-full h-full rounded-full", variantSettings.shapeColor)} />
          </div>
        </>
      )}
      
      {/* Particles */}
      {!reducedMotion && particles.map((particle, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute rounded-full",
            variantSettings.particleColor
          )}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            opacity: intensitySettings.particleOpacity
          }}
          animate={{
            y: ["0%", `${(Math.random() * 20) - 10}%`],
            x: [`0%`, `${(Math.random() * 20) - 10}%`],
            scale: [1, Math.random() * 0.5 + 0.8, 1]
          }}
          transition={{
            duration: (8 + Math.random() * 12) / variantSettings.animationSpeed,
            ease: easeOutExpo,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default AnimatedBackground 