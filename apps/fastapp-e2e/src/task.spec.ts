import { expect, test } from './fixtures';

test.beforeEach(async ({ page, seedDatabase }) => {
  await seedDatabase();

  await page.goto('/fastApp/tasks', { timeout: 5000 });
});

test.setTimeout(10000);

test.describe.configure({ mode: 'serial' });

test.describe('Task management', () => {
  test('can change the project of a task.', async ({ page }) => {
    // Click on the first project (Website Redesign)
    const firstListItem = page.getByTestId('list-item').first();
    await firstListItem
      .getByText('Learn Photography')
      .first()
      .click({ force: true });

    expect(true).toBe(true);

    await page.getByTestId('combobox-popover').waitFor({ state: 'visible' });

    // // get input field by placeholder change project
    const popover = page.getByTestId('combobox-popover');

    await expect(popover.getByText(/website/i)).toBeVisible();

    const input = page.getByPlaceholder('Change project');

    await input.fill('Fitness Plan');

    await expect(popover.getByText('Fitness Plan')).toBeVisible();
    await expect(popover.getByText(/website/i)).toBeHidden();

    await popover.getByText('Fitness Plan').click();

    await expect(input).toBeHidden();
  });

  test('Can add and remove tags from a task', async ({ page }) => {
    const firstListItem = page.getByTestId('list-item').first();

    await expect(firstListItem.getByText('Long-term')).toBeVisible();
    await expect(firstListItem.getByText('Important')).toBeVisible();
    await expect(firstListItem.getByText('Creative')).toBeHidden();

    // click on the first tag "Planning"
    await page.getByText('long-term').first().click();

    const popover = page.getByTestId('combobox-popover');
    const existingTag = popover.getByText(/planning/i);
    await existingTag
      .locator('../../../..')
      .getByRole('checkbox')
      .first()
      .click();

    // get input field by placeholder change tg
    const input = page.getByPlaceholder('Change tag');
    await input.fill('Creative');

    await expect(popover.getByText('Creative')).toBeVisible();
    await expect(popover.getByText('planning')).toBeHidden();

    const importantTag = popover.getByText(/Creative/i);
    await importantTag
      .locator('../../../..')
      .getByRole('checkbox')
      .first()
      .click();

    // close popover -> click /assign launch/i
    await page
      .getByText(/learn photography/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByText('Creative')).toBeVisible();
    await expect(firstListItem.getByText('Planning')).toBeHidden();
  });

  test('can chaange the priority of a task', async ({ page }) => {
    const firstListItem = page.getByTestId('list-item').first();

    // get by test id priority
    // const priority = firstListItem.getByTestId('priority');
    await firstListItem.getByText('🟢').click();

    const popover = page.getByTestId('combobox-popover');
    await expect(popover.getByText('🟡')).toBeVisible();

    await popover.getByText('🟡').click();

    // close popover by clicking /assign launch/i
    await page
      .getByText(/learn photography/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByText('🟡')).toBeVisible();
    await expect(firstListItem.getByText('🟢')).toBeHidden();
  });
});
