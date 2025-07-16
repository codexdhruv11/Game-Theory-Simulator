import { test, expect } from '@playwright/test';

test.describe('UI Components Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load main page successfully', async ({ page }) => {
    // Check basic page structure
    await expect(page.locator('h1')).toContainText('Game Theory Simulator');
    await expect(page.locator('main')).toBeVisible();
    
    // Check that no JavaScript errors occurred
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForTimeout(2000);
    expect(errors).toHaveLength(0);
  });

  test('should display all game theory components', async ({ page }) => {
    // Check for main components by looking for their titles
    const componentTitles = [
      'Introduction',
      'Prisoner\'s Dilemma', 
      'Nash Equilibrium',
      'Zero-Sum Game',
      'Auction Theory',
      'Evolutionary Game'
    ];

    for (const title of componentTitles) {
      await expect(page.locator(`text=${title}`)).toBeVisible();
    }
  });

  test('should have working buttons and interactions', async ({ page }) => {
    // Look for any buttons on the page
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    // Test that buttons are clickable (at least the first few)
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible() && await button.isEnabled()) {
        await button.click();
        await page.waitForTimeout(500);
        
        // Check that the page didn't break
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme switcher button (might have sun/moon icon or theme text)
    const themeButton = page.locator('button').filter({ 
      hasText: /theme|dark|light|sun|moon/i 
    }).first();
    
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(1000);
      
      // Check that the page is still functional
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Check that main elements are still visible
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle user interactions without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Try clicking various elements
    const clickableElements = page.locator('button, [role="button"], [tabindex="0"]');
    const elementCount = await clickableElements.count();
    
    // Click up to 10 random elements
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = clickableElements.nth(i);
      if (await element.isVisible() && await element.isEnabled()) {
        try {
          await element.click();
          await page.waitForTimeout(300);
        } catch (error) {
          // Some elements might not be clickable, that's okay
        }
      }
    }

    // Check that no JavaScript errors occurred
    expect(errors).toHaveLength(0);
  });

  test('should render without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter out known harmless errors
    const significantErrors = consoleErrors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('_next') &&
      !error.includes('hydration') &&
      !error.includes('Warning:')
    );

    expect(significantErrors).toHaveLength(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for basic accessibility attributes
    const mainElement = page.locator('main');
    await expect(mainElement).toBeVisible();

    // Check that buttons have proper attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Check first few buttons for accessibility
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          // Button should have text or aria-label
          const hasText = await button.textContent() !== '';
          const hasAriaLabel = await button.getAttribute('aria-label') !== null;
          
          expect(hasText || hasAriaLabel).toBe(true);
        }
      }
    }
  });

  test('should handle navigation and routing', async ({ page }) => {
    // Check that the current page is accessible
    await expect(page).toHaveURL(/localhost:3000/);
    
    // Try navigating with browser buttons
    await page.goBack();
    await page.waitForTimeout(500);
    await page.goForward();
    await page.waitForTimeout(500);
    
    // Check that we're still on the main page
    await expect(page.locator('h1')).toContainText('Game Theory Simulator');
  });

  test('should handle form inputs and controls', async ({ page }) => {
    // Look for input elements
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Test first few inputs
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible() && await input.isEnabled()) {
          const inputType = await input.getAttribute('type');
          
          if (inputType === 'text' || inputType === 'number') {
            await input.fill('test');
            await page.waitForTimeout(200);
            await input.clear();
          } else if (inputType === 'range') {
            await input.fill('50');
            await page.waitForTimeout(200);
          }
        }
      }
    }

    // Check that the page is still functional
    await expect(page.locator('main')).toBeVisible();
  });
});
