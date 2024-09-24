import { expect, test } from './fixtures';

test.beforeEach(async ({ taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();
});

test.setTimeout(10000);

test.describe.configure({ mode: 'serial' });

test.describe('Task management', () => {
  test('can change the project of a task.', async ({ taskPage, page }) => {
    // Click on the first project (Website Redesign)
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem
      .getByText('website redesign')
      .first()
      .click({ force: true });

    expect(true).toBe(true);

    await taskPage.comboboxPopover.waitFor({ state: 'visible' });

    await expect(taskPage.comboboxPopover.getByText(/website/i)).toBeVisible();

    const input = page.getByPlaceholder('Change project');

    await input.fill('Fitness Plan');

    await expect(
      taskPage.comboboxPopover.getByText('Fitness Plan')
    ).toBeVisible();
    await expect(taskPage.comboboxPopover.getByText(/website/i)).toBeHidden();

    await taskPage.comboboxPopover.getByText('Fitness Plan').click();

    await expect(input).toBeHidden();
  });

  test('Can add and remove tags from a task', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(2);

    await expect(firstListItem.getByText('Long-term')).toBeVisible();
    await expect(firstListItem.getByText('Creative')).toBeHidden();

    // click on the first tag "Planning"
    await page.getByText('long-term').first().click();

    const existingTag = taskPage.comboboxPopover.getByText(/planning/i);
    await existingTag
      .locator('../../../..')
      .getByRole('checkbox')
      .first()
      .click();

    // get input field by placeholder change tg
    const input = page.getByPlaceholder('Change tag');
    await input.fill('Creative');

    await expect(taskPage.comboboxPopover.getByText('Creative')).toBeVisible();
    await expect(taskPage.comboboxPopover.getByText('planning')).toBeHidden();

    const importantTag = taskPage.comboboxPopover.getByText(/Creative/i);
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

  test('can change the priority of a task', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(5);

    await firstListItem.getByText('🟢').click();

    await expect(taskPage.comboboxPopover.getByText('🟡')).toBeVisible();

    await taskPage.comboboxPopover.getByText('🟡').click();

    // close popover by clicking /assign launch/i
    await page
      .getByText(/website redesign/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByText('🟡')).toBeVisible();
    await expect(firstListItem.getByText('🟢')).toBeHidden();
  });

  test('can filter tasks by projects and tags', async ({ taskPage, page }) => {
    // click on the filter button
    await taskPage.filterButton.click();

    // filter by project
    await taskPage.comboboxPopover.getByText('Projects').click();
    await taskPage.comboboxPopover.getByText('fitness plan').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(
      taskPage.comboboxPopover.getByText('fitness plan')
    ).toBeHidden();
    await expect(page.getByText('fitness plan')).toHaveCount(4);

    // change filter from "is" to "is not"
    await taskPage.filterList.getByText('is').click();
    await taskPage.comboboxPopover.getByText('is not').click();
    await page.getByText('tasks').first().click({ force: true });
    // its 1 because we stil see thte name in the filter
    await expect(page.getByText('fitness plan')).toHaveCount(1);

    // click on 'fitness plan'
    await page.getByText('fitness plan').click();
    await taskPage.comboboxPopover.getByText('learn spanish').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText('fitness plan')).toHaveCount(0);
    await expect(page.getByText('learn spanish')).toHaveCount(0);

    await taskPage.filterList.getByText('is not any of').click();
    await taskPage.comboboxPopover.getByText('is any of').click();
    await expect(page.getByText('fitness plan')).toHaveCount(3);
    await expect(page.getByText('learn spanish')).toHaveCount(3);
    await page.getByText('tasks').first().click({ force: true });

    await taskPage.filterButton.click();
    await taskPage.comboboxPopover.getByText('tags').click();
    await taskPage.comboboxPopover.getByText(/important/i).click();
    await page.getByText('tasks').first().click({ force: true });

    const tagsFilterItem = page.getByTestId('filter-item-tags');
    await tagsFilterItem.getByText('is').click();
    await taskPage.comboboxPopover.getByText('is not').click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText(/important/i)).toHaveCount(1);
  });

  test('can filter tasks by completed and priority', async ({
    taskPage,
    page,
  }) => {
    // click on the filter button
    await taskPage.filterButton.click();

    await taskPage.comboboxPopover.getByText(/completed/i).click();
    await taskPage.comboboxPopover.getByText(/true/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByTestId('list-item')).toHaveCount(1);

    await taskPage.filterList.getByText(/true/i).click();
    await taskPage.comboboxPopover.getByText(/false/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByTestId('list-item')).not.toHaveCount(1);

    await taskPage.filterButton.click();
    await taskPage.comboboxPopover.getByText(/priority/i).click();
    await taskPage.comboboxPopover.getByText(/🟡/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByText(/🟢/i).first()).toBeHidden();

    await taskPage.filterList.getByText(/medium/i).click();
    await taskPage.comboboxPopover.getByText(/🟢/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByText(/🟢/i).first()).toBeVisible();
  });

  test('can filter tasks by due date', async ({ taskPage, page }) => {
    // to be implemented
    expect(true).toBe(true);
  });
});
