import { test, expect } from '@playwright/test';

test('Projects Page', async ({ page }) => {
  await page.goto('/fastApp/projects');
  await expect(page.getByText(/table: projects/i)).toBeVisible();

  // see Incredible Metal Towels
  await expect(page.getByText('Incredible Metal Towels')).toBeVisible();
  // see The Football Is Good For Training And Recreational Purposes
  await expect(
    page
      .getByText('The Football Is Good For Training And Recreational Purposes')
      .first()
  ).toBeVisible();

  await expect(page.getByText('Unbranded Granite Hat')).toBeVisible();

  await page.getByPlaceholder('Search').fill('Incredible');

  await expect(page.getByText('Incredible Metal Towels')).toBeVisible();
  await expect(page.getByText('Unbranded Granite Hat')).toBeHidden();

  // click reset
  await page.getByText('Reset').click();
  await expect(page.getByText('Incredible Metal Towels')).toBeVisible();
  await expect(page.getByText('Unbranded Granite Hat')).toBeVisible();
});
