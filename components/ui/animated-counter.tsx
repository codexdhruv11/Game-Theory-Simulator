import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, useTransform, motion, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  format?: "number" | "decimal" | "percentage" | "currency";
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 0.5,
  delay = 0,
  className,
  format = "number",
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  ariaLabel,
}: AnimatedCounterProps) => {
  const previousValue = useRef(value);
  const motionValue = useMotionValue(previousValue.current);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Format the value based on the format prop
  const formattedValue = useTransform(motionValue, (val) => {
    let formatted: string;
    
    switch (format) {
      case "decimal":
        formatted = val.toFixed(decimalPlaces);
        break;
      case "percentage":
        formatted = `${(val * 100).toFixed(decimalPlaces)}%`;
        break;
      case "currency":
        formatted = val.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        });
        break;
      default:
        formatted = val.toFixed(0);
    }
    
    return `${prefix}${formatted}${suffix}`;
  });
  
  // Animate the value when it changes
  useEffect(() => {
    // Skip animation on initial render if requested
    if (!hasAnimated) {
      setHasAnimated(true);
      motionValue.set(value);
      return;
    }
    
    const animation = animate(motionValue, value, {
      duration,
      delay,
      ease: "easeOut",
    });
    
    previousValue.current = value;
    
    return () => animation.stop();
  }, [value, duration, delay, motionValue, hasAnimated]);
  
  return (
    <motion.span
      className={cn("tabular-nums", className)}
      aria-label={ariaLabel || `Value: ${value}`}
    >
      {formattedValue}
    </motion.span>
  );
};

export default AnimatedCounter; 