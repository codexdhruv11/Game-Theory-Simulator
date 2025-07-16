# Game Theory Simulator

An interactive frontend application for exploring and simulating classic game theory scenarios. Built with Next.js, TypeScript, and shadcn/ui components.

## Features

### 🎮 Interactive Simulations
- **Prisoner's Dilemma**: Classic cooperation vs. defection scenarios with round-by-round gameplay
- **Nash Equilibrium Calculator**: Find equilibrium points in strategic games
- **Zero-Sum Games**: Analyze competitive scenarios including Matching Pennies and Rock Paper Scissors
- **Auction Theory**: Simulate first-price and second-price sealed bid auctions
- **Evolutionary Game Theory**: Watch strategies evolve over time in population dynamics

### 🎨 Multiple Themes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended use
- **Academic Theme**: Scholarly green-based color scheme
- **Neon Theme**: Vibrant purple cyberpunk aesthetic

### 📱 Responsive Design
- **Bento Layout**: Modern grid-based layout that adapts from multi-column on desktop to single-column on mobile
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Interactive elements designed for both mouse and touch input

### 🔤 Typography
- **IBM Plex Mono**: Technical, academic aesthetic perfect for mathematical content
- **Consistent Spacing**: Carefully crafted typography hierarchy

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd game-theory-simulator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Theme Switching
Click the theme switcher button in the top-right corner to cycle between:
- Light mode
- Dark mode  
- Academic theme (green-based)
- Neon theme (purple-based)

### Game Simulations

#### Prisoner's Dilemma
1. Select strategies for both players (Cooperate or Defect)
2. Click "Play Round" to see the results
3. Track cumulative scores across multiple rounds
4. Analyze the game history to understand strategic patterns

#### Nash Equilibrium
1. Choose between Coordination Game and Chicken Game
2. View the payoff matrix
3. See the calculated Nash equilibria
4. Understand why these strategy profiles are stable

#### Zero-Sum Games
1. Select between Matching Pennies and Rock Paper Scissors
2. View the payoff matrix (showing Player 1's payoffs)
3. See the minimax solution and optimal mixed strategies

#### Auction Simulator
1. Choose auction type (First-Price or Second-Price Sealed Bid)
2. Generate optimal bids based on auction theory
3. Run the auction to see who wins and at what price
4. Compare outcomes between different auction mechanisms

#### Evolutionary Game
1. Start with an initial population of cooperators and defectors
2. Watch as strategies evolve based on their relative fitness
3. Observe how population dynamics change over generations
4. See the long-term equilibrium emerge

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Theme Management**: next-themes
- **Icons**: Lucide React
- **Font**: IBM Plex Mono

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and theme variables
│   ├── layout.tsx           # Root layout with theme provider
│   └── page.tsx             # Main page with bento layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── bento-layout.tsx     # Responsive grid layout
│   ├── theme-provider.tsx   # Theme context provider
│   ├── theme-switcher.tsx   # Theme selection dropdown
│   └── [game-components]/   # Individual game simulations
├── lib/
│   └── utils.ts             # Utility functions
└── [config files]          # Next.js, TypeScript, Tailwind configs
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Game theory concepts based on classical literature
- UI components powered by shadcn/ui
- Responsive design inspired by modern bento layouts
- Typography using IBM's excellent Plex Mono font