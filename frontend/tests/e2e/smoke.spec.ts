import { test, expect } from '@playwright/test';

test.describe('AgroConnect Frontend Smoke & Scaffold E2E Verification', () => {
  test('landing page loads and has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AgroConnect/);
  });
});
