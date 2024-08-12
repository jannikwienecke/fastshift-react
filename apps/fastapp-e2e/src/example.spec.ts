import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Home')).toBeVisible();
  await expect(page.getByText('create userinterface')).toBeVisible();
});
