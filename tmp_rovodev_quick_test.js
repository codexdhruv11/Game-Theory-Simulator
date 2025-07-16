// Quick Test Script for Game Theory Simulator
// Run this in browser console to verify basic functionality

console.log("🎮 Game Theory Simulator - Quick Test Script");

// Test 1: Check if React is loaded
if (typeof React !== 'undefined') {
    console.log("✅ React is loaded");
} else {
    console.log("❌ React not found");
}

// Test 2: Check theme switching
function testThemes() {
    const themeButton = document.querySelector('[data-testid="theme-toggle"]') || 
                       document.querySelector('button[aria-label*="theme"]') ||
                       document.querySelector('button svg');
    
    if (themeButton) {
        console.log("✅ Theme switcher button found");
        return true;
    } else {
        console.log("❌ Theme switcher not found");
        return false;
    }
}

// Test 3: Check game components
function testGameComponents() {
    const expectedTitles = [
        "Introduction",
        "Prisoner's Dilemma", 
        "Nash Equilibrium",
        "Zero-Sum Game",
        "Auction Theory",
        "Evolutionary Game"
    ];
    
    let foundComponents = 0;
    expectedTitles.forEach(title => {
        const element = Array.from(document.querySelectorAll('h3, h2, h1'))
            .find(el => el.textContent.includes(title));
        if (element) {
            console.log(`✅ Found: ${title}`);
            foundComponents++;
        } else {
            console.log(`❌ Missing: ${title}`);
        }
    });
    
    return foundComponents === expectedTitles.length;
}

// Test 4: Check responsive layout
function testResponsiveLayout() {
    const gridContainer = document.querySelector('.grid');
    if (gridContainer) {
        const styles = window.getComputedStyle(gridContainer);
        console.log("✅ Grid layout found");
        console.log(`Grid columns: ${styles.gridTemplateColumns}`);
        return true;
    } else {
        console.log("❌ Grid layout not found");
        return false;
    }
}

// Test 5: Check for console errors
function checkConsoleErrors() {
    const originalError = console.error;
    let errorCount = 0;
    
    console.error = function(...args) {
        errorCount++;
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        console.error = originalError;
        if (errorCount === 0) {
            console.log("✅ No console errors detected");
        } else {
            console.log(`❌ ${errorCount} console errors detected`);
        }
    }, 2000);
}

// Run all tests
function runQuickTests() {
    console.log("\n🧪 Running Quick Tests...\n");
    
    setTimeout(() => {
        const results = {
            themes: testThemes(),
            components: testGameComponents(),
            layout: testResponsiveLayout()
        };
        
        checkConsoleErrors();
        
        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);
        
        if (passedTests === totalTests) {
            console.log("🎉 All tests passed! Application is working correctly.");
        } else {
            console.log("⚠️ Some tests failed. Check the issues above.");
        }
    }, 1000);
}

// Auto-run tests
runQuickTests();

// Manual test functions
window.gameTheoryTests = {
    runQuickTests,
    testThemes,
    testGameComponents,
    testResponsiveLayout,
    checkConsoleErrors
};