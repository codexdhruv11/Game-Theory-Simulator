import { test, expect } from '@playwright/test';

test.describe('Nash Equilibrium Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Nash Equilibrium component', async ({ page }) => {
    const nashCard = page.locator('text=Nash Equilibrium').locator('..').locator('..');
    
    await expect(nashCard).toBeVisible();
    await expect(nashCard.locator('text=Find equilibrium points in strategic games')).toBeVisible();
  });

  test('should have game selection buttons', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Check for game selection buttons
    await expect(nashCard.locator('[data-testid="coordination-button"]')).toBeVisible();
    await expect(nashCard.locator('[data-testid="chicken-button"]')).toBeVisible();
  });

  test('should switch between different games', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Test Coordination game
    const coordinationButton = nashCard.locator('[data-testid="coordination-button"]');
    await expect(coordinationButton).toBeVisible();
    await coordinationButton.click();
    await page.waitForTimeout(500);
    
    // Check if coordination game matrix is displayed
    await expect(nashCard.locator('text=Coordination Game')).toBeVisible();
    
    // Test Chicken game
    const chickenButton = nashCard.locator('[data-testid="chicken-button"]');
    await expect(chickenButton).toBeVisible();
    await chickenButton.click();
    await page.waitForTimeout(500);
    
    // Check if chicken game matrix is displayed
    await expect(nashCard.locator('text=Chicken Game')).toBeVisible();
  });

  test('should display game matrix correctly', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Check if matrix is displayed
    const matrixCard = nashCard.locator('[data-testid="game-matrix"]');
    await expect(matrixCard).toBeVisible();
    
    // Matrix should have payoff values
    await expect(matrixCard).toContainText(/\d+,\s*\d+/); // Pattern for payoffs like "2, 2"
  });

  test('should show Nash equilibria', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Check for Nash Equilibria section
    const equilibriaCard = nashCard.locator('[data-testid="nash-equilibria"]');
    await expect(equilibriaCard).toBeVisible();
    
    // Check for equilibrium explanation
    await expect(equilibriaCard).toContainText('Nash equilibrium');
    await expect(equilibriaCard).toContainText('No player can improve by unilaterally changing strategy');
  });

  test('should display different equilibria for different games', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Test Coordination game equilibria
    const coordinationButton = nashCard.locator('[data-testid="coordination-button"]');
    await expect(coordinationButton).toBeVisible();
    await coordinationButton.click();
    await page.waitForTimeout(500);
    
    // Should show multiple equilibria for coordination game
    const equilibriaElements = nashCard.locator('[data-testid="equilibrium-item"]');
    await expect(equilibriaElements).toHaveCount(2); // Coordination game has 2 equilibria
    
    // Test Chicken game equilibria
    const chickenButton = nashCard.locator('[data-testid="chicken-button"]');
    await expect(chickenButton).toBeVisible();
    await chickenButton.click();
    await page.waitForTimeout(500);
    
    // Should show equilibria for chicken game
    await expect(equilibriaElements).toHaveCount(2); // Chicken game has 2 equilibria
  });

  test('should have proper styling for equilibria', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Check if equilibria are highlighted with green background
    const equilibriaElements = nashCard.locator('[data-testid="equilibrium-item"]');
    await expect(equilibriaElements.first()).toBeVisible();
    await expect(equilibriaElements.first()).toHaveClass(/bg-green/);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    const nashCard = page.locator('[data-testid="nash-equilibrium-component"]').first();
    
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(nashCard).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(nashCard).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(nashCard).toBeVisible();
  });
});
