import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=Join now');
    await expect(page).toHaveURL(/\/auth\/signup/);
  });
});

test.describe('Shopping Flow', () => {
  test('should allow browsing products', async ({ page }) => {
    await page.goto('/');
    // Check if some product container exists
    await expect(page.locator('h1')).toBeVisible();
  });
});
