# Game Theory Simulator - Testing Guide

## 🚀 How to Start Testing

### 1. Start the Development Server
```bash
npm run dev
```
Then open your browser to: **http://localhost:3000**

### 2. Visual Layout Test
- ✅ Check if the page loads with a clean layout
- ✅ Verify the header shows "Game Theory Simulator" 
- ✅ Confirm the bento grid layout displays 6 cards
- ✅ Test responsive design by resizing browser window

### 3. Theme Switching Test
**Location:** Top-right corner theme switcher button

**Test Steps:**
1. Click the theme switcher button (sun/moon icon)
2. Select each theme and verify colors change:
   - **Light**: White background, dark text
   - **Dark**: Dark background, light text  
   - **Academic**: Green-tinted professional theme
   - **Neon**: Purple cyberpunk theme
3. ✅ Verify IBM Plex Mono font is used throughout

## 🎮 Game Component Testing

### 4. Game Theory Introduction
**Location:** Top-left card
- ✅ Displays key concepts and definitions
- ✅ Shows formatted text with bullet points
- ✅ Contains quote in highlighted box

### 5. Prisoner's Dilemma Testing
**Location:** Large card spanning 2 columns

**Test Scenario:**
1. **Payoff Matrix**: Verify 2x2 grid shows correct values
2. **Strategy Selection**: 
   - Click "Cooperate" for Player 1
   - Click "Defect" for Player 2
   - Verify buttons highlight when selected
3. **Play Round**: Click "Play Round 1" button
4. **Results**: Check scores appear (Player 1: 0, Player 2: 5)
5. **Multiple Rounds**: Play several rounds and verify:
   - Round number increments
   - Total scores accumulate correctly
   - Game history shows all rounds
6. **Reset**: Click "Reset" and verify everything clears

### 6. Nash Equilibrium Testing
**Location:** Right column, first card

**Test Steps:**
1. **Game Selection**: Switch between "Coordination" and "Chicken"
2. **Matrix Display**: Verify payoff matrix updates correctly
3. **Equilibria**: Check Nash equilibria are displayed
4. **Coordination Game**: Should show "(A, A)" and "(B, B)"
5. **Chicken Game**: Should show "(Swerve, Straight)" and "(Straight, Swerve)"

### 7. Zero-Sum Game Testing
**Location:** Right column, second card

**Test Steps:**
1. **Game Types**: Switch between "Matching Pennies" and "Rock Paper Scissors"
2. **Matrix Colors**: Verify positive values are green, negative are red, zero is gray
3. **Minimax Solution**: Check optimal mixed strategy is displayed
4. **RPS Matrix**: Verify 3x3 matrix displays correctly for Rock Paper Scissors

### 8. Auction Simulator Testing
**Location:** Bottom row, left card

**Test Scenario:**
1. **Auction Types**: Switch between "First-Price" and "Second-Price"
2. **Bidder Display**: Verify 3 bidders with different valuations
3. **Generate Bids**: Click "Generate Optimal Bids"
   - First-price: Bids should be ~80% of valuations
   - Second-price: Bids should equal valuations
4. **Run Auction**: Click "Run Auction"
5. **Results**: Verify winner, price, and profit calculations
6. **Reset**: Test reset functionality

### 9. Evolutionary Game Testing
**Location:** Bottom row, spanning full width

**Test Scenario:**
1. **Initial State**: Verify 50/50 split of cooperators/defectors
2. **Visual Bar**: Check blue bar represents cooperator percentage
3. **Step Evolution**: Click "Step" button multiple times
4. **Population Changes**: Watch numbers and percentages change
5. **Auto Evolution**: Click "Start" for automatic evolution
6. **History Tracking**: Verify evolution history appears
7. **Stop/Reset**: Test stop and reset functionality

## 🔍 Advanced Testing

### 10. Responsive Design Testing
**Test Different Screen Sizes:**
- **Desktop (1200px+)**: 3-column layout
- **Tablet (768-1199px)**: 2-column layout  
- **Mobile (<768px)**: Single column layout

**Browser Dev Tools:**
1. Press F12 to open developer tools
2. Click device toolbar icon
3. Test various device presets
4. Verify all components remain usable

### 11. Accessibility Testing
- ✅ Tab through all interactive elements
- ✅ Verify buttons have proper focus states
- ✅ Check color contrast in all themes
- ✅ Test with screen reader if available

### 12. Performance Testing
**Browser Dev Tools Performance:**
1. Open Network tab
2. Reload page
3. Verify fast loading times
4. Check for any console errors

## 🐛 Common Issues to Check

### Potential Problems:
- [ ] Theme not switching properly
- [ ] Game calculations incorrect
- [ ] Responsive layout breaking
- [ ] Buttons not responding
- [ ] Console errors in browser dev tools

### Quick Fixes:
- Refresh the page
- Clear browser cache
- Check browser console for errors
- Verify all dependencies installed with `npm install`

## ✅ Success Criteria

**The application passes testing if:**
1. All 4 themes work correctly
2. All 6 game components are interactive
3. Calculations produce expected results
4. Layout is responsive across screen sizes
5. No console errors appear
6. All buttons and interactions work smoothly

## 🎯 Test Results Template

```
TESTING CHECKLIST:
□ Page loads successfully
□ All 4 themes switch correctly
□ Prisoner's Dilemma gameplay works
□ Nash Equilibrium calculator functions
□ Zero-sum games display properly
□ Auction simulator runs correctly
□ Evolutionary game evolves population
□ Responsive design works on mobile
□ No console errors
□ Performance is acceptable

OVERALL RESULT: ✅ PASS / ❌ FAIL
```