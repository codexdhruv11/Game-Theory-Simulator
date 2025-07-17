/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        'ibm-plex-sans': ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        'ibm-plex-mono': ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Game theory specific colors
        cooperation: {
          DEFAULT: "hsl(var(--cooperation))",
          foreground: "hsl(var(--cooperation-foreground))",
        },
        defection: {
          DEFAULT: "hsl(var(--defection))",
          foreground: "hsl(var(--defection-foreground))",
        },
        equilibrium: {
          DEFAULT: "hsl(var(--equilibrium))",
          foreground: "hsl(var(--equilibrium-foreground))",
        },
        instability: {
          DEFAULT: "hsl(var(--instability))",
          foreground: "hsl(var(--instability-foreground))",
        },
        // Trust evolution specific colors
        "trust-high": "#22c55e",
        "trust-low": "#ef4444",
        "cooperation-success": "#3b82f6",
        "defection-warning": "#f59e0b",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-node": {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.05)", opacity: 0.8 },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.8)", opacity: 0 },
          "80%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "particle-float": {
          "0%": { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: 1 },
          "100%": { transform: "translateY(-20px) translateX(10px) rotate(45deg)", opacity: 0 },
        },
        "pulse": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.1)", opacity: 0.8 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "edge-pulse": {
          "0%": { strokeWidth: "1.5px", strokeOpacity: 0.8 },
          "50%": { strokeWidth: "3px", strokeOpacity: 1 },
          "100%": { strokeWidth: "1.5px", strokeOpacity: 0.8 },
        },
        "member-highlight": {
          "0%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.3)" },
          "100%": { filter: "brightness(1)" },
        },
        "bid-bounce": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        "signal-flow": {
          "0%": { strokeDashoffset: "20" },
          "100%": { strokeDashoffset: "0" },
        },
        "belief-update": {
          "0%": { transform: "scale(0.8)", opacity: 0.5 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "unstable-match": {
          "0%": { strokeDasharray: "0", strokeDashoffset: "0" },
          "50%": { strokeDasharray: "4", strokeDashoffset: "8" },
          "100%": { strokeDasharray: "0", strokeDashoffset: "0" },
        },
        "winner-highlight": {
          "0%": { filter: "brightness(1)", transform: "scaleY(1)" },
          "50%": { filter: "brightness(1.2)", transform: "scaleY(1.05)" },
          "100%": { filter: "brightness(1)", transform: "scaleY(1)" },
        },
        "path-dash": {
          "0%": { strokeDasharray: "5", strokeDashoffset: "20" },
          "100%": { strokeDasharray: "5", strokeDashoffset: "0" },
        },
        "strategy-transition": {
          "0%": { transform: "translateX(0) scale(1)", opacity: 1 },
          "50%": { transform: "translateX(10px) scale(0.9)", opacity: 0.5 },
          "100%": { transform: "translateX(0) scale(1)", opacity: 1 },
        },
        "loading-spinner": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-staggered": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "3d-rotate": {
          "0%": { transform: "rotateX(0deg) rotateY(0deg)" },
          "50%": { transform: "rotateX(15deg) rotateY(15deg)" },
          "100%": { transform: "rotateX(0deg) rotateY(0deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-node": "pulse-node 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "bounce-in": "bounce-in 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "particle-float": "particle-float 2s ease-out forwards",
        "pulse": "pulse 2s infinite",
        "edge-pulse": "edge-pulse 1.5s infinite",
        "member-highlight": "member-highlight 2s infinite",
        "bid-bounce": "bid-bounce 0.5s ease-in-out",
        "signal-flow": "signal-flow 2s infinite linear",
        "belief-update": "belief-update 1s ease-out",
        "unstable-match": "unstable-match 2s infinite",
        "winner-highlight": "winner-highlight 1s ease-out",
        "path-dash": "path-dash 1.5s infinite linear",
        "strategy-transition": "strategy-transition 1s ease-in-out",
        "loading-spinner": "loading-spinner 1s linear infinite",
        "fade-in-staggered": "fade-in-staggered 0.5s ease-out",
        "3d-rotate": "3d-rotate 10s ease-in-out infinite",
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      boxShadow: {
        'node': '0 0 0 2px hsl(var(--node-border)), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'node-active': '0 0 0 3px hsl(var(--node-border-active)), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        '3d': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '3d-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-glow': 'inset 0 0 5px 2px rgba(var(--primary-rgb), 0.2)',
        'equilibrium': '0 0 15px 5px rgba(var(--equilibrium-rgb), 0.3)',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-out': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      backdropBlur: {
        'xs': '2px',
        'md': '6px',
        'xl': '24px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-diagonal': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'gradient-game-theory': 'linear-gradient(135deg, hsl(var(--cooperation)), hsl(var(--equilibrium)))',
      },
      transformOrigin: {
        'center-bottom': 'center bottom',
      },
      perspective: {
        '500': '500px',
        '1000': '1000px',
        '2000': '2000px',
      },
      translate: {
        '3d-10': 'translate3d(0, 0, 10px)',
        '3d-20': 'translate3d(0, 0, 20px)',
      },
      rotate: {
        '3d-15': 'rotateX(15deg) rotateY(15deg)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}