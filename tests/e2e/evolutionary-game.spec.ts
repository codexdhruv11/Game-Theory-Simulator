import { test, expect } from '@playwright/test';

test.describe('Evolutionary Game Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Evolutionary Game component', async ({ page }) => {
    // Find the card by its title
    const title = page.getByText('Evolutionary Game', { exact: true });
    await expect(title).toBeVisible();
    
    // Find the description
    const description = page.getByText('Watch strategies evolve over time');
    await expect(description).toBeVisible();
  });

  test('should have simulation controls', async ({ page }) => {
    // Find the start button using data-testid
    const startButton = page.locator('[data-testid="start-simulation"]');
    
    // Check if start button is visible
    await expect(startButton).toBeVisible();
    
    // Find the reset button using data-testid
    const resetButton = page.locator('[data-testid="reset-simulation"]');
    await expect(resetButton).toBeVisible();
  });

  test('should have population grid or visualization', async ({ page }) => {
    // Find the grid using data-testid
    const grid = page.locator('[data-testid="population-grid"]');
    
    // Check if grid is visible
    await expect(grid).toBeVisible();
  });

  test('should display generation counter', async ({ page }) => {
    // Find the generation counter using data-testid
    const generationCounter = page.locator('[data-testid="generation-counter"]');
    
    // Check if generation counter is visible and contains "Generation"
    await expect(generationCounter).toBeVisible();
    await expect(generationCounter).toContainText('Generation');
  });

  test('should have strategy legend or indicators', async ({ page }) => {
    // Find the Evolutionary Game card
    const title = page.getByText('Evolutionary Game', { exact: true });
    await expect(title).toBeVisible();
    
    // Check for color indicators (we'll look for any elements with background colors)
    const colorIndicators = page.locator('[class*="bg-"]').filter({ has: title.locator('..').locator('..') });
    
    // There should be at least some colored elements
    const count = await colorIndicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should start and stop simulation', async ({ page }) => {
    // Find the start button
    const startButton = page.locator('[data-testid="start-simulation"]');
    await expect(startButton).toBeVisible();
    
    // Click the start button
    await startButton.click();
    
    // Wait for the stop button to appear
    const stopButton = page.locator('[data-testid="stop-simulation"]');
    await expect(stopButton).toBeVisible({ timeout: 2000 });
    
    // Click the stop button
    await stopButton.click();
    
    // Wait for the start button to reappear
    await expect(startButton).toBeVisible({ timeout: 2000 });
  });

  test('should reset simulation', async ({ page }) => {
    // Find the reset button
    const resetButton = page.locator('[data-testid="reset-simulation"]');
    await expect(resetButton).toBeVisible();
    
    // Click the reset button
    await resetButton.click();
    
    // Check if generation counter shows 0 after reset
    const generationCounter = page.locator('[data-testid="generation-counter"]');
    await expect(generationCounter).toContainText('Generation: 0');
  });

  test('should have simulation parameters or sliders', async ({ page }) => {
    // Find the speed slider
    const speedSlider = page.locator('[data-testid="speed-slider"]');
    
    // Check if slider is visible
    await expect(speedSlider).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Find the Evolutionary Game card
    const title = page.getByText('Evolutionary Game', { exact: true });
    const card = title.locator('..').locator('..');
    
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(card).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(card).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(card).toBeVisible();
  });
});
