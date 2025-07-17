import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Custom hook for orchestrating multi-step animations
 * @param steps - Array of animation step durations in milliseconds
 * @param initialStep - Starting step index (default: 0)
 * @param loop - Whether to loop the animation (default: false)
 * @returns Object containing current step and control functions
 */
export function useAnimationSequence(
  steps: number[],
  initialStep: number = 0,
  loop: boolean = false
) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(initialStep);
  }, [initialStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps]);

  useEffect(() => {
    if (!isPlaying) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const nextStep = currentStep + 1;
      
      if (nextStep >= steps.length) {
        if (loop) {
          setCurrentStep(0);
        } else {
          setIsPlaying(false);
        }
      } else {
        setCurrentStep(nextStep);
      }
    }, steps[currentStep]);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep, isPlaying, loop, steps]);

  return {
    currentStep,
    isPlaying,
    play,
    pause,
    reset,
    goToStep,
    totalSteps: steps.length
  };
}

/**
 * Creates a staggered animation for a list of elements
 * @param total - Total number of items
 * @param staggerMs - Milliseconds between each item's animation
 * @param initialDelayMs - Initial delay before starting animations
 * @returns Array of delay values for each item
 */
export function createStaggeredDelays(
  total: number,
  staggerMs: number = 50,
  initialDelayMs: number = 0
): number[] {
  return Array.from({ length: total }, (_, i) => initialDelayMs + i * staggerMs);
}

/**
 * Custom hook for animating a number change with easing
 * @param targetValue - Target number value to animate to
 * @param duration - Animation duration in milliseconds
 * @param easingFn - Easing function to use (default: easeOutExpo)
 * @returns Current animated value
 */
export function useAnimatedNumber(
  targetValue: number,
  duration: number = 1000,
  easingFn: (t: number) => number = easeOutExpo
) {
  const [value, setValue] = useState<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(targetValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    startValueRef.current = value;
    startTimeRef.current = null;
    
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      setValue(startValueRef.current + (targetValue - startValueRef.current) * easedProgress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, easingFn, value]);

  return value;
}

/**
 * Custom hook for creating an element entrance animation when it becomes visible
 * @param options - Intersection observer options
 * @returns [ref, isVisible] tuple
 */
export function useEntranceAnimation(
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const { ref, inView } = useInView(options);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
    }
  }, [inView, isVisible]);

  return [ref, isVisible] as const;
}

/**
 * Custom hook for animating visibility based on intersection observer
 * @param ref - React ref object for the element to observe
 * @param options - Intersection observer options
 * @returns isVisible state
 */
export function useAnimatedVisibility(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { inView } = useInView({ 
    root: ref.current ? ref.current.parentElement : null,
    ...options 
  });
  
  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
    }
  }, [inView, isVisible]);

  return isVisible;
}

/**
 * Creates a physics-based spring animation configuration
 * @param stiffness - Spring stiffness (default: 100)
 * @param damping - Spring damping (default: 10)
 * @param mass - Object mass (default: 1)
 * @returns Spring configuration object
 */
export function createSpringAnimation(
  stiffness: number = 100,
  damping: number = 10,
  mass: number = 1
) {
  return {
    type: 'spring',
    stiffness,
    damping,
    mass
  };
}

/**
 * Creates a bouncy animation configuration
 * @param bounciness - Level of bounce (0-1, default: 0.25)
 * @param speed - Animation speed (default: 1)
 * @returns Bounce configuration object
 */
export function createBounceAnimation(
  bounciness: number = 0.25,
  speed: number = 1
) {
  return {
    type: 'spring',
    stiffness: 300 * speed,
    damping: 10 * (1 - bounciness),
    mass: 1,
    velocity: 5 * speed
  };
}

/**
 * Manages an animation queue for sequential animations
 */
export class AnimationQueue {
  private queue: (() => Promise<void>)[] = [];
  private isRunning: boolean = false;

  /**
   * Add an animation function to the queue
   * @param animationFn - Function that returns a Promise when animation completes
   */
  add(animationFn: () => Promise<void>): void {
    this.queue.push(animationFn);
    this.runNext();
  }

  /**
   * Clear all pending animations
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Run the next animation in the queue
   */
  private async runNext(): Promise<void> {
    if (this.isRunning || this.queue.length === 0) return;

    this.isRunning = true;
    const nextAnimation = this.queue.shift();

    if (nextAnimation) {
      try {
        await nextAnimation();
      } catch (error) {
        console.error('Animation error:', error);
      }
    }

    this.isRunning = false;
    this.runNext();
  }
}

/**
 * Creates a particle effect configuration
 * @param count - Number of particles
 * @param duration - Animation duration in milliseconds
 * @param spread - Particle spread factor
 * @returns Particle configuration object
 */
export function createParticleEffect(
  count: number = 20,
  duration: number = 1000,
  spread: number = 100
) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * spread,
    y: (Math.random() - 0.5) * spread,
    scale: Math.random() * 0.5 + 0.5,
    rotation: Math.random() * 360,
    duration: duration * (Math.random() * 0.4 + 0.8)
  }));
}

/**
 * Creates a morphing transition between two states
 * @param startState - Starting state object
 * @param endState - Ending state object
 * @param progress - Animation progress (0-1)
 * @returns Interpolated state object
 */
export function createMorphTransition<T extends Record<string, number>>(
  startState: T,
  endState: T,
  progress: number
): T {
  const result = {} as T;
  
  Object.keys(startState).forEach(key => {
    const start = startState[key];
    const end = endState[key];
    result[key as keyof T] = start + (end - start) * progress as T[keyof T];
  });
  
  return result;
}

// Easing functions
export function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
} 