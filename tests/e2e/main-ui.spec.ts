import { test, expect } from '@playwright/test';

test.describe('Main UI and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Game Theory Simulator/);
    await expect(page.locator('h1')).toContainText('Game Theory Simulator');
    await expect(page.locator('header p').first()).toContainText('Interactive simulations and analysis');
  });

  test('should have theme switcher working', async ({ page }) => {
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]').first();
    
    // Check if theme switcher exists (it might be a button or dropdown)
    await expect(themeSwitcher).toBeVisible();
    
    // Click the theme switcher
    await themeSwitcher.click();
    
    // Wait for theme change animation
    await page.waitForTimeout(500);
  });

  test('should display all game theory components', async ({ page }) => {
    // Check for Introduction component
    await expect(page.locator('text=Introduction')).toBeVisible();
    await expect(page.locator('text=Learn the fundamentals of game theory')).toBeVisible();

    // Check for Prisoner's Dilemma component
    await expect(page.locator('text=Prisoner\'s Dilemma')).toBeVisible();
    await expect(page.locator('text=Classic cooperation vs. defection scenario')).toBeVisible();

    // Check for Nash Equilibrium component
    await expect(page.locator('text=Nash Equilibrium')).toBeVisible();
    await expect(page.locator('text=Find equilibrium points in strategic games')).toBeVisible();

    // Check for Zero-Sum Game component
    await expect(page.locator('text=Zero-Sum Game')).toBeVisible();
    await expect(page.locator('text=Analyze competitive scenarios')).toBeVisible();

    // Check for Auction Theory component
    await expect(page.locator('text=Auction Theory')).toBeVisible();
    await expect(page.locator('text=Simulate different auction mechanisms')).toBeVisible();

    // Check for Evolutionary Game component
    await expect(page.locator('text=Evolutionary Game')).toBeVisible();
    await expect(page.locator('text=Watch strategies evolve over time')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('main')).toBeVisible();

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('main')).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have proper grid layout for bento items', async ({ page }) => {
    const bentoGrid = page.locator('[data-testid="bento-grid"]');
    await expect(bentoGrid).toBeVisible();
    
    // Check that multiple components are arranged in a grid
    const bentoItems = page.locator('[data-testid="bento-item"]');
    await expect(bentoItems).toHaveCount(6); // 6 visible components
  });
});
