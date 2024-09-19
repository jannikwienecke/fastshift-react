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
      .getByText('website redesign')
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
    const firstListItem = page.getByTestId('list-item').nth(2);

    await expect(firstListItem.getByText('Long-term')).toBeVisible();
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
      .getByText(/website redesign/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByText('Creative')).toBeVisible();
    await expect(firstListItem.getByText('Planning')).toBeHidden();
  });

  test('can chaange the priority of a task', async ({ page }) => {
    const firstListItem = page.getByTestId('list-item').nth(5);

    // get by test id priority
    // const priority = firstListItem.getByTestId('priority');
    await firstListItem.getByText('🟢').click();

    const popover = page.getByTestId('combobox-popover');
    await expect(popover.getByText('🟡')).toBeVisible();

    await popover.getByText('🟡').click();

    // close popover by clicking /assign launch/i
    await page
      .getByText(/website redesign/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByText('🟡')).toBeVisible();
    await expect(firstListItem.getByText('🟢')).toBeHidden();
  });

  test('can filter tasks by projects and tags', async ({ page }) => {
    // click on the filter button
    await page.getByText('Filter').click();

    const popover = page.getByTestId('combobox-popover');

    // filter by project
    await popover.getByText('Projects').click();
    await popover.getByText('fitness plan').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(popover.getByText('fitness plan')).toBeHidden();
    await expect(page.getByText('fitness plan')).toHaveCount(4);

    // change filter from "is" to "is not"
    const filterList = page.getByTestId('filter-list');
    await filterList.getByText('is').click();
    await popover.getByText('is not').click();
    await page.getByText('tasks').first().click({ force: true });
    // its 1 because we stil see thte name in the filter
    await expect(page.getByText('fitness plan')).toHaveCount(1);

    // click on 'fitness plan'
    await page.getByText('fitness plan').click();
    await popover.getByText('learn spanish').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText('fitness plan')).toHaveCount(0);
    await expect(page.getByText('learn spanish')).toHaveCount(0);

    await filterList.getByText('is not any of').click();
    await popover.getByText('is any of').click();
    await expect(page.getByText('fitness plan')).toHaveCount(3);
    await expect(page.getByText('learn spanish')).toHaveCount(3);
    await page.getByText('tasks').first().click({ force: true });

    await page.getByTestId('filter-button').click();
    await popover.getByText('tags').click();
    await popover.getByText(/important/i).click();
    await page.getByText('tasks').first().click({ force: true });

    const tagsFilterItem = page.getByTestId('filter-item-tags');
    await tagsFilterItem.getByText('is').click();
    await popover.getByText('is not').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText(/important/i)).toHaveCount(1);
  });

  test('can filter tasks by completed and priority', async ({ page }) => {
    // click on the filter button
    await page.getByText('Filter').click();

    const popover = page.getByTestId('combobox-popover');

    await popover.getByText(/completed/i).click();
    await popover.getByText(/true/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByTestId('list-item')).toHaveCount(1);

    const filterList = page.getByTestId('filter-list');
    await filterList.getByText(/true/i).click();
    await popover.getByText(/false/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByTestId('list-item')).not.toHaveCount(1);

    await page.getByTestId('filter-button').click();
    await popover.getByText(/priority/i).click();
    await popover.getByText(/🟡/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByText(/🟢/i).first()).toBeHidden();

    await filterList.getByText(/medium/i).click();
    await popover.getByText(/🟢/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText(/🟢/i).first()).toBeVisible();
  });
});
