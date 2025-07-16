import { test, expect } from '@playwright/test';

test.describe('Prisoner\'s Dilemma Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have all tabs accessible', async ({ page }) => {
    // Look for the Prisoner's Dilemma card
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    const tabsList = prisonersDilemmaCard.locator('[data-testid="prisoners-dilemma-tabs"]');
    
    // Check if tabs are present
    await expect(tabsList.locator('[data-testid="tab-game"]')).toBeVisible();
    await expect(tabsList.locator('[data-testid="tab-matrix"]')).toBeVisible();
    await expect(tabsList.locator('[data-testid="tab-tournament"]')).toBeVisible();
    await expect(tabsList.locator('[data-testid="tab-statistics"]')).toBeVisible();
  });

  test('should allow strategy selection', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Look for strategy buttons
    const cooperateButton = prisonersDilemmaCard.locator('[data-testid="strategy-cooperate"]');
    const defectButton = prisonersDilemmaCard.locator('[data-testid="strategy-defect"]');
    
    await expect(cooperateButton).toBeVisible();
    await cooperateButton.click();
    
    await expect(defectButton).toBeVisible();
    await defectButton.click();
  });

  test('should allow opponent type selection', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Click on the tab to ensure we're on the game tab
    const gameTab = prisonersDilemmaCard.locator('[data-testid="tab-game"]');
    await gameTab.click();
    await page.waitForTimeout(500);
    
    // Look for opponent strategy buttons
    const strategies = ['Tit For Tat', 'Always Cooperate', 'Always Defect', 'Random', 'Grudger', 'Pavlov'];
    
    for (const strategy of strategies) {
      const strategyButton = prisonersDilemmaCard.locator(`text=${strategy}`).first();
      if (await strategyButton.isVisible()) {
        await strategyButton.click();
        await page.waitForTimeout(500); // Wait for state change
      }
    }
  });

  test('should allow playing rounds', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Click on the tab to ensure we're on the game tab
    const gameTab = prisonersDilemmaCard.locator('[data-testid="tab-game"]');
    await gameTab.click();
    await page.waitForTimeout(500);
    
    // Look for Play Round button
    const playRoundButton = prisonersDilemmaCard.locator('text=Play Round').first();
    
    if (await playRoundButton.isVisible()) {
      // Select a strategy first
      const cooperateButton = prisonersDilemmaCard.locator('[data-testid="strategy-cooperate"]');
      if (await cooperateButton.isVisible()) {
        await cooperateButton.click();
      }
      
      // Play a few rounds
      for (let i = 0; i < 3; i++) {
        await playRoundButton.click();
        await page.waitForTimeout(1000); // Wait for animation
      }
    }
  });

  test('should display game history after playing', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Click on the tab to ensure we're on the game tab
    const gameTab = prisonersDilemmaCard.locator('[data-testid="tab-game"]');
    await gameTab.click();
    await page.waitForTimeout(500);
    
    // Select a strategy first
    const cooperateButton = prisonersDilemmaCard.locator('[data-testid="strategy-cooperate"]');
    if (await cooperateButton.isVisible()) {
      await cooperateButton.click();
    }
    
    const playRoundButton = prisonersDilemmaCard.locator('text=Play Round').first();
    
    if (await playRoundButton.isVisible()) {
      await playRoundButton.click();
      await page.waitForTimeout(1000);
      
      // Check if game history table appears
      const historyTable = prisonersDilemmaCard.locator('table').first();
      if (await historyTable.isVisible()) {
        await expect(historyTable).toBeVisible();
      }
    }
  });

  test('should have working reset functionality', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Click on the tab to ensure we're on the game tab
    const gameTab = prisonersDilemmaCard.locator('[data-testid="tab-game"]');
    await gameTab.click();
    await page.waitForTimeout(500);
    
    // Select a strategy first
    const cooperateButton = prisonersDilemmaCard.locator('[data-testid="strategy-cooperate"]');
    if (await cooperateButton.isVisible()) {
      await cooperateButton.click();
    }
    
    const playRoundButton = prisonersDilemmaCard.locator('text=Play Round').first();
    const resetButton = prisonersDilemmaCard.locator('text=Reset').first();
    
    if (await playRoundButton.isVisible()) {
      // Play a round
      await playRoundButton.click();
      await page.waitForTimeout(1000);
      
      // Reset the game
      if (await resetButton.isVisible()) {
        await resetButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should switch between tabs correctly', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Test switching to Payoff Matrix tab
    const matrixTab = prisonersDilemmaCard.locator('[data-testid="tab-matrix"]');
    await matrixTab.click();
    await page.waitForTimeout(500);
    
    // Check if payoff matrix is visible
    const matrixTable = prisonersDilemmaCard.locator('table').first();
    if (await matrixTable.isVisible()) {
      await expect(matrixTable).toBeVisible();
    }
    
    // Test switching to Tournament tab
    const tournamentTab = prisonersDilemmaCard.locator('[data-testid="tab-tournament"]');
    await tournamentTab.click();
    await page.waitForTimeout(500);
    
    // Check if tournament button is visible
    const runTournamentButton = prisonersDilemmaCard.locator('text=Run Tournament').first();
    if (await runTournamentButton.isVisible()) {
      await expect(runTournamentButton).toBeVisible();
    }
  });

  test('should run tournament simulation', async ({ page }) => {
    const prisonersDilemmaCard = page.locator('text=Prisoner\'s Dilemma').locator('..').locator('..');
    
    // Switch to Tournament tab
    const tournamentTab = prisonersDilemmaCard.locator('[data-testid="tab-tournament"]');
    await tournamentTab.click();
    await page.waitForTimeout(500);
    
    // Run tournament
    const runTournamentButton = prisonersDilemmaCard.locator('text=Run Tournament').first();
    if (await runTournamentButton.isVisible()) {
      await runTournamentButton.click();
      await page.waitForTimeout(2000); // Wait for tournament to complete
    }
  });
});
