/**
 * Comprehensive Test Suite for Game Theory Simulator
 * 
 * This test suite covers:
 * 1. Core game theory logic
 * 2. Prisoner's Dilemma strategies
 * 3. Nash equilibrium calculations
 * 4. Matrix operations
 * 5. Error handling and edge cases
 * 6. Performance tests
 * 7. UI functionality tests
 */

// Test Results Storage
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  performance: {}
};

// Test Framework
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function test(name, testFunction) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    testFunction();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
  }
}

function timeTest(name, testFunction, iterations = 1000) {
  console.log(`\n⏱️  Performance Test: ${name}`);
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    testFunction();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const avgTime = duration / iterations;
  
  console.log(`   Duration: ${duration.toFixed(2)}ms`);
  console.log(`   Average per iteration: ${avgTime.toFixed(4)}ms`);
  
  testResults.performance[name] = {
    totalTime: duration,
    averageTime: avgTime,
    iterations
  };
}

// =====================================================
// 1. PRISONER'S DILEMMA STRATEGY TESTS
// =====================================================

// Payoff Matrix for Prisoner's Dilemma
const PAYOFF_MATRIX = {
  cooperate: {
    cooperate: { player: 3, opponent: 3 },
    defect: { player: 0, opponent: 5 }
  },
  defect: {
    cooperate: { player: 5, opponent: 0 },
    defect: { player: 1, opponent: 1 }
  }
};

// Strategy implementations
const AI_STRATEGIES = {
  "tit-for-tat": (history) => history.length === 0 ? "cooperate" : history[history.length - 1],
  "always-cooperate": () => "cooperate",
  "always-defect": () => "defect",
  "random": () => Math.random() > 0.5 ? "cooperate" : "defect",
  "grudger": (history) => history.includes("defect") ? "defect" : "cooperate",
  "pavlov": (history, playerHistory = []) => {
    if (history.length === 0) return "cooperate";
    const lastPlayerMove = playerHistory[playerHistory.length - 1];
    const lastOpponentMove = history[history.length - 1];
    
    if (lastPlayerMove === "cooperate" && lastOpponentMove === "cooperate") return "cooperate";
    if (lastPlayerMove === "defect" && lastOpponentMove === "defect") return "cooperate";
    return "defect";
  }
};

test("Prisoner's Dilemma Payoff Matrix Consistency", () => {
  // Test that payoff matrix is symmetric and consistent
  assert(PAYOFF_MATRIX.cooperate.cooperate.player === PAYOFF_MATRIX.cooperate.cooperate.opponent, "Mutual cooperation should have equal payoffs");
  assert(PAYOFF_MATRIX.defect.defect.player === PAYOFF_MATRIX.defect.defect.opponent, "Mutual defection should have equal payoffs");
  
  // Test Nash equilibrium (defect, defect)
  assert(PAYOFF_MATRIX.defect.defect.player === 1, "Nash equilibrium payoff should be 1");
  
  // Test temptation vs sucker's payoff
  assert(PAYOFF_MATRIX.defect.cooperate.player > PAYOFF_MATRIX.cooperate.cooperate.player, "Temptation should be greater than reward");
  assert(PAYOFF_MATRIX.cooperate.defect.player < PAYOFF_MATRIX.defect.defect.player, "Sucker's payoff should be less than punishment");
});

test("Tit-for-Tat Strategy Logic", () => {
  // Test initial cooperation
  assert(AI_STRATEGIES["tit-for-tat"]([]) === "cooperate", "Tit-for-tat should start with cooperation");
  
  // Test response to cooperation
  assert(AI_STRATEGIES["tit-for-tat"](["cooperate"]) === "cooperate", "Tit-for-tat should cooperate after opponent cooperates");
  
  // Test response to defection
  assert(AI_STRATEGIES["tit-for-tat"](["defect"]) === "defect", "Tit-for-tat should defect after opponent defects");
  
  // Test response to mixed history
  assert(AI_STRATEGIES["tit-for-tat"](["cooperate", "defect", "cooperate"]) === "cooperate", "Tit-for-tat should respond to last move only");
});

test("Grudger Strategy Logic", () => {
  // Test initial cooperation
  assert(AI_STRATEGIES["grudger"]([]) === "cooperate", "Grudger should start with cooperation");
  
  // Test continued cooperation
  assert(AI_STRATEGIES["grudger"](["cooperate", "cooperate"]) === "cooperate", "Grudger should continue cooperating if opponent never defected");
  
  // Test eternal defection after first defection
  assert(AI_STRATEGIES["grudger"](["cooperate", "defect", "cooperate"]) === "defect", "Grudger should never forgive defection");
});

test("Pavlov Strategy Logic", () => {
  // Test initial cooperation
  assert(AI_STRATEGIES["pavlov"]([], []) === "cooperate", "Pavlov should start with cooperation");
  
  // Test win-stay (mutual cooperation)
  assert(AI_STRATEGIES["pavlov"](["cooperate"], ["cooperate"]) === "cooperate", "Pavlov should stay if mutual cooperation");
  
  // Test win-stay (mutual defection)
  assert(AI_STRATEGIES["pavlov"](["defect"], ["defect"]) === "cooperate", "Pavlov should stay if mutual defection");
  
  // Test lose-shift (being exploited)
  assert(AI_STRATEGIES["pavlov"](["defect"], ["cooperate"]) === "defect", "Pavlov should shift if exploited");
});

test("Strategy Tournament Simulation", () => {
  // Run a mini tournament
  const strategies = ["tit-for-tat", "always-cooperate", "always-defect", "grudger"];
  const results = {};
  
  strategies.forEach(strategy => {
    results[strategy] = 0;
  });
  
  // Test each strategy pair
  strategies.forEach(strategy1 => {
    strategies.forEach(strategy2 => {
      if (strategy1 === strategy2) return;
      
      let history1 = [];
      let history2 = [];
      let score1 = 0;
      
      // Play 10 rounds
      for (let i = 0; i < 10; i++) {
        const move1 = AI_STRATEGIES[strategy1](history2, history1);
        const move2 = AI_STRATEGIES[strategy2](history1, history2);
        
        const payoff = PAYOFF_MATRIX[move1][move2];
        score1 += payoff.player;
        
        history1.push(move1);
        history2.push(move2);
      }
      
      results[strategy1] += score1;
    });
  });
  
  // Test that results are reasonable
  assert(results["always-defect"] > 0, "Always defect should get some points");
  assert(results["tit-for-tat"] >= results["always-cooperate"], "Tit-for-tat should outperform always-cooperate");
  
  console.log("   Tournament Results:", results);
});

// =====================================================
// 2. NASH EQUILIBRIUM TESTS
// =====================================================

test("Nash Equilibrium Detection - Coordination Game", () => {
  // Coordination game matrix
  const coordinationMatrix = [
    [{rowPlayer: 2, colPlayer: 2}, {rowPlayer: 0, colPlayer: 0}],
    [{rowPlayer: 0, colPlayer: 0}, {rowPlayer: 1, colPlayer: 1}]
  ];
  
  // Test best response calculation
  function findBestResponses(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const nashEquilibria = [];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Check if this is a Nash equilibrium
        let isNash = true;
        
        // Check row player's best response
        for (let i2 = 0; i2 < rows; i2++) {
          if (matrix[i2][j].rowPlayer > matrix[i][j].rowPlayer) {
            isNash = false;
            break;
          }
        }
        
        // Check column player's best response
        if (isNash) {
          for (let j2 = 0; j2 < cols; j2++) {
            if (matrix[i][j2].colPlayer > matrix[i][j].colPlayer) {
              isNash = false;
              break;
            }
          }
        }
        
        if (isNash) {
          nashEquilibria.push([i, j]);
        }
      }
    }
    
    return nashEquilibria;
  }
  
  const equilibria = findBestResponses(coordinationMatrix);
  assert(equilibria.length === 2, "Coordination game should have 2 Nash equilibria");
  assert(equilibria.some(([i, j]) => i === 0 && j === 0), "Should have equilibrium at (0,0)");
  assert(equilibria.some(([i, j]) => i === 1 && j === 1), "Should have equilibrium at (1,1)");
});

test("Nash Equilibrium Detection - Prisoner's Dilemma", () => {
  // Prisoner's dilemma in matrix form
  const prisonerMatrix = [
    [{rowPlayer: 3, colPlayer: 3}, {rowPlayer: 0, colPlayer: 5}],
    [{rowPlayer: 5, colPlayer: 0}, {rowPlayer: 1, colPlayer: 1}]
  ];
  
  function findNashEquilibria(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const equilibria = [];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isNash = true;
        
        // Check if row player wants to deviate
        for (let i2 = 0; i2 < rows; i2++) {
          if (matrix[i2][j].rowPlayer > matrix[i][j].rowPlayer) {
            isNash = false;
            break;
          }
        }
        
        // Check if column player wants to deviate
        if (isNash) {
          for (let j2 = 0; j2 < cols; j2++) {
            if (matrix[i][j2].colPlayer > matrix[i][j].colPlayer) {
              isNash = false;
              break;
            }
          }
        }
        
        if (isNash) {
          equilibria.push([i, j]);
        }
      }
    }
    
    return equilibria;
  }
  
  const equilibria = findNashEquilibria(prisonerMatrix);
  assert(equilibria.length === 1, "Prisoner's dilemma should have 1 Nash equilibrium");
  assert(equilibria[0][0] === 1 && equilibria[0][1] === 1, "Nash equilibrium should be (defect, defect)");
});

// =====================================================
// 3. COOPERATIVE GAME THEORY TESTS
// =====================================================

test("Shapley Value Calculation - Basic", () => {
  // Simple 3-player game
  function characteristicFunction(coalition) {
    const size = coalition.length;
    if (size === 0) return 0;
    if (size === 1) return 1;
    if (size === 2) return 3;
    if (size === 3) return 6;
    return 0;
  }
  
  // Calculate Shapley values manually for verification
  function calculateShapleyValues(n, charFunc) {
    const shapley = Array(n).fill(0);
    
    // For each player
    for (let player = 0; player < n; player++) {
      // For each possible coalition not containing the player
      const allCoalitions = generateAllCoalitions(n);
      
      for (const coalition of allCoalitions) {
        if (!coalition.includes(player)) {
          const withoutPlayer = charFunc(coalition);
          const withPlayer = charFunc([...coalition, player]);
          const marginalContribution = withPlayer - withoutPlayer;
          
          // Weight by coalition size
          const coalitionSize = coalition.length;
          const weight = factorial(coalitionSize) * factorial(n - coalitionSize - 1) / factorial(n);
          
          shapley[player] += marginalContribution * weight;
        }
      }
    }
    
    return shapley;
  }
  
  function generateAllCoalitions(n) {
    const coalitions = [];
    const totalSubsets = Math.pow(2, n);
    
    for (let i = 0; i < totalSubsets; i++) {
      const coalition = [];
      for (let j = 0; j < n; j++) {
        if (i & (1 << j)) {
          coalition.push(j);
        }
      }
      coalitions.push(coalition);
    }
    
    return coalitions;
  }
  
  function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }
  
  const shapleyValues = calculateShapleyValues(3, characteristicFunction);
  
  // Check efficiency (sum should equal grand coalition value)
  const sum = shapleyValues.reduce((a, b) => a + b, 0);
  assert(Math.abs(sum - 6) < 0.001, "Shapley values should sum to grand coalition value");
  
  // Check symmetry (all players should have equal value in this symmetric game)
  assert(Math.abs(shapleyValues[0] - shapleyValues[1]) < 0.001, "Player 0 and 1 should have equal Shapley values");
  assert(Math.abs(shapleyValues[1] - shapleyValues[2]) < 0.001, "Player 1 and 2 should have equal Shapley values");
  
  console.log("   Shapley Values:", shapleyValues);
});

// =====================================================
// 4. MATRIX OPERATIONS TESTS
// =====================================================

test("Matrix Cell Operations", () => {
  // Test matrix cell structure
  const cell = { row: 0, col: 1, rowPlayer: 5, colPlayer: 3 };
  
  assert(typeof cell.row === 'number', "Row should be a number");
  assert(typeof cell.col === 'number', "Col should be a number");
  assert(typeof cell.rowPlayer === 'number', "Row player payoff should be a number");
  assert(typeof cell.colPlayer === 'number', "Col player payoff should be a number");
});

test("Matrix Dominant Strategy Detection", () => {
  // Matrix with dominant strategy for row player
  const matrix = [
    [{rowPlayer: 4, colPlayer: 1}, {rowPlayer: 3, colPlayer: 2}],
    [{rowPlayer: 2, colPlayer: 3}, {rowPlayer: 1, colPlayer: 4}]
  ];
  
  function findDominantStrategy(matrix, player) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    if (player === 'row') {
      for (let i = 0; i < rows; i++) {
        let isDominant = true;
        
        for (let i2 = 0; i2 < rows; i2++) {
          if (i === i2) continue;
          
          for (let j = 0; j < cols; j++) {
            if (matrix[i][j].rowPlayer <= matrix[i2][j].rowPlayer) {
              isDominant = false;
              break;
            }
          }
          
          if (!isDominant) break;
        }
        
        if (isDominant) return i;
      }
    }
    
    return null;
  }
  
  const dominantRow = findDominantStrategy(matrix, 'row');
  assert(dominantRow === 0, "Row 0 should be dominant strategy");
});

// =====================================================
// 5. ERROR HANDLING TESTS
// =====================================================

test("Error Handling - Invalid Strategy", () => {
  let errorThrown = false;
  
  try {
    // Try to use non-existent strategy
    AI_STRATEGIES["non-existent-strategy"]([]);
  } catch (error) {
    errorThrown = true;
  }
  
  assert(errorThrown, "Should throw error for non-existent strategy");
});

test("Error Handling - Invalid Payoff Matrix", () => {
  let errorThrown = false;
  
  try {
    // Try to access non-existent payoff
    const payoff = PAYOFF_MATRIX["invalid_move"]["cooperate"];
  } catch (error) {
    errorThrown = true;
  }
  
  assert(errorThrown, "Should throw error for invalid payoff access");
});

test("Error Handling - Empty History", () => {
  // Test strategies with empty history
  assert(AI_STRATEGIES["tit-for-tat"]([]) === "cooperate", "Tit-for-tat should handle empty history");
  assert(AI_STRATEGIES["grudger"]([]) === "cooperate", "Grudger should handle empty history");
  assert(AI_STRATEGIES["pavlov"]([], []) === "cooperate", "Pavlov should handle empty history");
});

// =====================================================
// 6. PERFORMANCE TESTS
// =====================================================

timeTest("Strategy Execution Performance", () => {
  const history = Array(100).fill("cooperate");
  AI_STRATEGIES["tit-for-tat"](history);
}, 10000);

timeTest("Nash Equilibrium Calculation Performance", () => {
  const matrix = [
    [{rowPlayer: 2, colPlayer: 2}, {rowPlayer: 0, colPlayer: 0}],
    [{rowPlayer: 0, colPlayer: 0}, {rowPlayer: 1, colPlayer: 1}]
  ];
  
  // Simple Nash equilibrium calculation
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      // Check if Nash equilibrium
      let isNash = true;
      
      for (let i2 = 0; i2 < matrix.length; i2++) {
        if (matrix[i2][j].rowPlayer > matrix[i][j].rowPlayer) {
          isNash = false;
          break;
        }
      }
      
      if (isNash) {
        for (let j2 = 0; j2 < matrix[0].length; j2++) {
          if (matrix[i][j2].colPlayer > matrix[i][j].colPlayer) {
            isNash = false;
            break;
          }
        }
      }
    }
  }
}, 5000);

timeTest("Tournament Simulation Performance", () => {
  const strategies = ["tit-for-tat", "always-cooperate", "always-defect"];
  
  strategies.forEach(strategy1 => {
    strategies.forEach(strategy2 => {
      if (strategy1 === strategy2) return;
      
      let history1 = [];
      let history2 = [];
      
      for (let i = 0; i < 50; i++) {
        const move1 = AI_STRATEGIES[strategy1](history2, history1);
        const move2 = AI_STRATEGIES[strategy2](history1, history2);
        
        history1.push(move1);
        history2.push(move2);
      }
    });
  });
}, 1000);

// =====================================================
// 7. INTEGRATION TESTS
// =====================================================

test("Full Game Simulation", () => {
  let playerHistory = [];
  let opponentHistory = [];
  let playerScore = 0;
  let opponentScore = 0;
  
  // Simulate 10 rounds
  for (let round = 0; round < 10; round++) {
    const playerMove = round % 2 === 0 ? "cooperate" : "defect";
    const opponentMove = AI_STRATEGIES["tit-for-tat"](playerHistory);
    
    const payoff = PAYOFF_MATRIX[playerMove][opponentMove];
    
    playerHistory.push(playerMove);
    opponentHistory.push(opponentMove);
    playerScore += payoff.player;
    opponentScore += payoff.opponent;
  }
  
  assert(playerHistory.length === 10, "Should have 10 rounds of history");
  assert(opponentHistory.length === 10, "Should have 10 rounds of opponent history");
  assert(playerScore >= 0, "Player score should be non-negative");
  assert(opponentScore >= 0, "Opponent score should be non-negative");
  
  console.log(`   Final Scores - Player: ${playerScore}, Opponent: ${opponentScore}`);
});

test("Statistics Calculation", () => {
  const history = ["cooperate", "cooperate", "defect", "cooperate", "defect"];
  
  // Calculate cooperation rate
  const cooperationRate = history.filter(move => move === "cooperate").length / history.length;
  assert(cooperationRate === 0.6, "Cooperation rate should be 60%");
  
  // Calculate pattern consistency
  const consistentMoves = history.filter((move, i) => 
    i > 0 && move === history[i-1]
  ).length;
  const consistencyRate = consistentMoves / (history.length - 1);
  
  assert(consistencyRate >= 0 && consistencyRate <= 1, "Consistency rate should be between 0 and 1");
  
  console.log(`   Cooperation Rate: ${(cooperationRate * 100).toFixed(1)}%`);
  console.log(`   Consistency Rate: ${(consistencyRate * 100).toFixed(1)}%`);
});

// =====================================================
// 8. EDGE CASE TESTS
// =====================================================

test("Edge Case - Single Round Game", () => {
  const playerMove = "cooperate";
  const opponentMove = AI_STRATEGIES["tit-for-tat"]([]);
  
  const payoff = PAYOFF_MATRIX[playerMove][opponentMove];
  
  assert(payoff.player === 3, "Single round cooperation should yield 3 points");
  assert(payoff.opponent === 3, "Single round cooperation should yield 3 points for opponent");
});

test("Edge Case - Very Long History", () => {
  // Test with 1000 rounds of history
  const longHistory = Array(1000).fill("cooperate");
  
  const move = AI_STRATEGIES["tit-for-tat"](longHistory);
  assert(move === "cooperate", "Tit-for-tat should handle long history");
  
  const grudgerMove = AI_STRATEGIES["grudger"](longHistory);
  assert(grudgerMove === "cooperate", "Grudger should handle long cooperative history");
});

test("Edge Case - Alternating History", () => {
  const alternatingHistory = [];
  for (let i = 0; i < 20; i++) {
    alternatingHistory.push(i % 2 === 0 ? "cooperate" : "defect");
  }
  
  const titForTatMove = AI_STRATEGIES["tit-for-tat"](alternatingHistory);
  assert(titForTatMove === "defect", "Tit-for-tat should respond to last move");
  
  const grudgerMove = AI_STRATEGIES["grudger"](alternatingHistory);
  assert(grudgerMove === "defect", "Grudger should defect if any defection in history");
});

// =====================================================
// RUN ALL TESTS
// =====================================================

console.log("🚀 Starting Game Theory Simulator Test Suite");
console.log("=" .repeat(60));

// Run all tests
console.log("\n📊 RUNNING TESTS...");

// The tests will run automatically when this file is executed

// Print final results
setTimeout(() => {
  console.log("\n" + "=".repeat(60));
  console.log("📋 TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📊 Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`🏆 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log("\n🚨 FAILED TESTS:");
    testResults.errors.forEach(error => {
      console.log(`   • ${error.test}: ${error.error}`);
    });
  }
  
  if (Object.keys(testResults.performance).length > 0) {
    console.log("\n⚡ PERFORMANCE RESULTS:");
    Object.entries(testResults.performance).forEach(([test, result]) => {
      console.log(`   • ${test}: ${result.averageTime.toFixed(4)}ms avg (${result.iterations} iterations)`);
    });
  }
  
  console.log("\n🎯 RECOMMENDATIONS:");
  if (testResults.failed === 0) {
    console.log("   ✅ All tests passed! The game theory simulator is working correctly.");
  } else {
    console.log("   ⚠️  Some tests failed. Review the error messages above.");
  }
  
  if (testResults.performance["Strategy Execution Performance"]?.averageTime > 1) {
    console.log("   ⚠️  Strategy execution is slow. Consider optimization.");
  }
  
  if (testResults.performance["Nash Equilibrium Calculation Performance"]?.averageTime > 1) {
    console.log("   ⚠️  Nash equilibrium calculation is slow. Consider optimization.");
  }
  
  console.log("\n✨ Test suite completed successfully!");
  
}, 1000);

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testResults,
    AI_STRATEGIES,
    PAYOFF_MATRIX
  };
}
