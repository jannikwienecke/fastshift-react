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

  test('can change the completed status of a task', async ({ taskPage }) => {
    const firstListItem = await taskPage.getListItem(0);

    await firstListItem.getByText('❌').click();

    await taskPage.comboboxPopover.getByText('true').click();

    await expect(firstListItem.getByText('✅')).toBeVisible();
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
    const listItem = await taskPage.getListItem(0);
    const listItem2 = await taskPage.getListItem(1);
    // before filter -> this is our first list item
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    await taskPage.openFilter(/dueDate/i);
    await taskPage.comboboxPopover.getByText(/today/i).click();
    await taskPage.expectToSeeFilter(/dueDate/i, 'is', 'today');

    // after filter -> this is our first list item
    await expect(listItem.getByText(/develop frontend/i)).toBeVisible();
    await expect(
      listItem2.getByText(/implement responsive design/i)
    ).toBeVisible();

    // now we change the filter from is -> is not
    await taskPage.filterList.getByText(/is/i).click();
    await taskPage.comboboxPopover.getByText(/is not/i).click();
    await taskPage.expectToSeeFilter(/dueDate/i, 'is not', 'today');
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    // after remove filter -> this is our first list item again
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    await taskPage.openFilter(/dueDate/i);
    await taskPage.comboboxPopover.getByText(/this month/i).click();
    await taskPage.expectToSeeFilter(/dueDate/i, 'within', 'this month');

    await page.getByText(/this month/i).click();
    await taskPage.filterAndSelect('3 week', /3 weeks from now/i);
    await taskPage.expectToSeeFilter(/dueDate/i, 'before', '3 weeks from now');

    await taskPage.openFilter(/dueDate/i);
    await taskPage.filterAndSelect('no date', /no date defined/i);
    await taskPage.expectToSeeFilter(/dueDate/i, 'is', /no date defined/i);

    await taskPage.filterBySpecificDate(new Date().getDate().toString());

    await taskPage.closePopover();

    await taskPage.removeFilter('dueDate');

    await testingQueryBehavior({ taskPage, page });
  });
});

const testingQueryBehavior = async ({ taskPage, page }) => {
  await taskPage.openFilter(/dueDate/i);
  const input = page.getByPlaceholder(/filter/i);

  const getByText = (l: RegExp) => taskPage.comboboxPopover.getByText(l);

  await input.fill('week');
  await expect(getByText(/this week/i)).toBeVisible();
  await expect(getByText(/last week/i)).toBeVisible();
  await expect(getByText(/one week from now/i)).toBeVisible();
  await expect(getByText(/one week ago/i)).toBeVisible();

  await input.fill('week 3');
  await expect(getByText(/3 weeks from now/i)).toBeVisible();
  await expect(getByText(/3 weeks ago/i)).toBeVisible();

  await input.fill('month');
  await expect(getByText(/this month/i)).toBeVisible();
  await expect(getByText(/last month/i)).toBeVisible();
  await expect(getByText(/one month from now/i)).toBeVisible();
  await expect(getByText(/one month ago/i)).toBeVisible();

  await input.fill('year');
  await expect(getByText(/this year/i)).toBeVisible();
  await expect(getByText(/last year/i)).toBeVisible();

  await input.fill('from now 12');
  await expect(getByText(/12 days from now/i)).toBeVisible();
  await expect(getByText(/12 weeks from now/i)).toBeVisible();
  await expect(getByText(/12 months from now/i)).toBeVisible();

  await input.fill('2024');
  await expect(getByText(/2024/i).first()).toBeVisible();
  await expect(getByText(/january 2024/i)).toBeVisible();
  await expect(getByText(/march 2024/i)).toBeVisible();
  await expect(getByText(/december 2024/i)).toBeVisible();

  await input.fill('2024 aug');
  await expect(getByText(/2024/i).first()).toBeVisible();
  await expect(getByText(/august 2024/i)).toBeVisible();

  await input.fill('august');
  const year = new Date().getFullYear();
  await expect(page.getByText(`august ${year}`)).toBeVisible();
  await expect(page.getByText(`august ${year - 1}`)).toBeVisible();
  await expect(page.getByText(`august ${year + 1}`)).toBeVisible();
  await expect(page.getByText(`august ${year + 2}`)).toBeVisible();

  await input.fill('today');
  await expect(getByText(/today/i)).toBeVisible();
};
