import {} from '@playwright/test';
import { expect, test } from './fixtures';

test.beforeEach(async ({ page, seedDatabase }) => {
  await seedDatabase();

  await page.goto('/fastapp/projects', { timeout: 5000 });
});

test.setTimeout(10000);

test.describe.configure({ mode: 'serial' });

test.describe('Project management', () => {
  test.describe.configure({ mode: 'serial' });

  test('can change the category of a project.', async ({ page }) => {
    // Click on the first project (Website Redesign)
    await page.getByText('Education').first().click();

    // Get input field by placeholder "change category"
    const input = page.getByPlaceholder('change categories');
    await input.fill('Person');

    // Wait for 'Work' category not to be visible
    const popover = page.getByTestId('combobox-popover');
    // expect that inside popover Work is not visible
    await expect(popover.getByText('Work')).toBeHidden();

    // Click on "Personal" to confirm the change
    await popover.getByText('Personal').first().click();

    // // Expect input field not to be visible after confirmation
    await expect(input).toBeHidden();
  });

  test('can change the owner of a project', async ({ page }) => {
    // Click on the first project (owned by John Doe)
    await page.getByText('David').first().click();

    // Find the input field for changing the owner
    const input = page.getByPlaceholder('change owner');
    await input.fill('Mike');

    // Expect "Jane Smith" to be visible in the dropdown
    const popover = page.getByTestId('combobox-popover');
    await expect(popover.getByText('Mike')).toBeVisible();
    await expect(popover.getByText('David')).toBeHidden();

    // Click on "Jane Smith" to confirm the change
    await popover.getByText('Mike').first().click();

    // Expect the input field to be hidden after confirming
    await expect(input).toBeHidden();
  });

  test('can assign and remove tasks from a project', async ({ page }) => {
    // Get the initial count of tasks
    const initialTaskCount = await page
      .getByTestId('field-value-tasks')
      .first()
      .innerText();

    expect(initialTaskCount).toBe('3');

    // Open the task dropdown
    await page.getByTestId('field-value-tasks').first().click();

    // Add a new task
    const input = page.getByPlaceholder('change tasks');
    await input.fill('Create workout');
    const newTask = page.getByText('Create workout').first();
    await newTask.locator('..').getByRole('checkbox').click();

    // Close the dropdown
    await page.getByText('Learn Photography').first().click({ force: true });

    // // Expect the task count to increase
    await expect(page.getByTestId('field-value-tasks').first()).toHaveText('4');

    // // Open the dropdown again
    await page.getByTestId('field-value-tasks').first().click();

    // // Remove a task
    const popover = page.getByTestId('combobox-popover');
    const existingTask = popover.getByText('Create workout').first();
    await existingTask.locator('..').getByRole('checkbox').click();

    // // Close the dropdown
    await page.getByText('Learn Photography').first().click({ force: true });

    // // Wait for the task count to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // // Expect the task count to decrease
    await expect(page.getByTestId('field-value-tasks').first()).toHaveText('3');
  });
});
