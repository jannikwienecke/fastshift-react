import {} from '@playwright/test';
import { expect, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/fastapp/project', { timeout: 5000 });
});

test.describe('Project management', () => {
  test.describe.configure({ mode: 'serial' });

  test('can change the category of a project.', async ({ page }) => {
    // Click on the first project (Website Redesign)
    await page.getByText('Finance').first().click();

    // Get input field by placeholder "change category"
    const input = page.getByPlaceholder('change category');
    await input.fill('Personal');

    // Wait for 'Work' category not to be visible
    const popover = page.getByTestId('combobox-popover');
    // expect that inside popover Work is not visible
    await expect(popover.getByText('Work')).toBeHidden();

    // Expect 'Personal' category to be visible
    await expect(page.getByText('Personal').first()).toBeVisible();

    // Click on "Personal" to confirm the change
    await page.getByText('Personal').first().click();

    // Expect input field not to be visible after confirmation
    await expect(input).toBeHidden();
  });

  test('can change the owner of a project', async ({ page }) => {
    // Click on the first project (owned by John Doe)
    await page.getByText('JD').first().click();

    // Find the input field for changing the owner
    const input = page.getByPlaceholder('change owner');
    await input.fill('Jane');

    // Expect "Jane Smith" to be visible in the dropdown
    await expect(page.getByText('Jane Smith').first()).toBeVisible();
    await expect(page.getByText('John Doe').first()).toBeHidden();

    // Click on "Jane Smith" to confirm the change
    await page.getByText('Jane Smith').first().click();

    // Expect the input field to be hidden after confirming
    await expect(input).toBeHidden();
  });

  test('can assign and remove tasks from a project', async ({ page }) => {
    // Click on the first project (Website Redesign)
    await page.getByText('Website Redesign').first().click();

    // Get the initial count of tasks
    const initialTaskCount = await page
      .getByTestId('field-value-tasks')
      .first()
      .innerText();

    expect(initialTaskCount).toBe('3');

    // Open the task dropdown
    await page.getByTestId('field-value-tasks').first().click();

    // Add a new task
    const input = page.getByPlaceholder('change task');
    await input.fill('Create workout');
    const newTask = page.getByText('Create workout').first();
    await newTask.locator('..').getByRole('checkbox').click();

    // Close the dropdown
    await page.getByText('Website Redesign').first().click();

    // Expect the task count to increase
    await expect(page.getByTestId('field-value-tasks').first()).toHaveText('4');

    // Open the dropdown again
    await page.getByTestId('field-value-tasks').first().click();

    // Remove a task
    const existingTask = page.getByText('Design mockups').first();
    await existingTask.locator('..').getByRole('checkbox').click();

    // Close the dropdown
    await page.getByText('Website Redesign').first().click();

    // Wait for the task count to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Expect the task count to decrease
    await expect(page.getByTestId('field-value-tasks').first()).toHaveText('5');
  });
});
