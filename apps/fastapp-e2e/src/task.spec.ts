import { expect, test } from './fixtures';
import { TaskPage } from './task-page';

test.beforeEach(async ({ taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();
});

test.setTimeout(20000);

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
  });

  test('can change the priority of a task', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);

    await firstListItem.getByTestId('priority-none').click();

    await taskPage.comboboxPopover.getByTestId('priority-urgent').click();

    // close popover by clicking /assign launch/i
    await page
      .getByText(/website redesign/i)
      .first()
      .click({ force: true });

    await expect(firstListItem.getByTestId('priority-urgent')).toBeVisible();
    await expect(firstListItem.getByTestId('priority-none')).toBeHidden();
  });

  test('can change the completed status of a task', async ({ taskPage }) => {
    const firstListItem = await taskPage.getListItem(0);

    await firstListItem.getByText('❌').click();

    await taskPage.comboboxPopover.getByText('✅').click();

    await expect(firstListItem.getByText('✅')).toBeVisible();
  });

  test('can filter tasks by projects and tags', async ({ taskPage, page }) => {
    // click on the filter button
    await taskPage.filterButton.click();

    // filter by project
    await taskPage.comboboxPopover.getByText('Project').click();
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
    await taskPage.comboboxPopover.getByText('tag').click();
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
    await taskPage.comboboxPopover.getByText(/✅/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByTestId('list-item')).toHaveCount(1);

    await taskPage.filterList.getByText(/true/i).click();
    await taskPage.comboboxPopover.getByText(/❌/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByTestId('list-item')).not.toHaveCount(1);

    await taskPage.filterButton.click();
    await taskPage.comboboxPopover.getByText(/priority/i).click();
    await taskPage.comboboxPopover.getByTestId(/priority-low/i).click();
    await page.getByText('tasks').first().click({ force: true });

    await expect(page.getByTestId('priority-high').first()).toBeHidden();

    await taskPage.filterList.getByText(/low/i).click();
    await taskPage.comboboxPopover.getByTestId(/priority-low/i).click();
    await taskPage.comboboxPopover.getByTestId(/priority-high/i).click();
    await page.getByText('tasks').first().click({ force: true });
    await expect(page.getByTestId('priority-high').first()).toBeVisible();
  });

  test('can filter tasks by due date', async ({ taskPage, page }) => {
    const listItem = await taskPage.getListItem(0);
    const listItem2 = await taskPage.getListItem(1);
    // before filter -> this is our first list item
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    await taskPage.openFilter(/due date/i);
    await taskPage.comboboxPopover.getByText(/today/i).click();
    await taskPage.expectToSeeFilter(/due Date/i, 'is', 'today');

    // after filter -> this is our first list item
    await expect(listItem.getByText(/develop frontend/i)).toBeVisible();
    await expect(
      listItem2.getByText(/implement responsive design/i)
    ).toBeVisible();

    // now we change the filter from is -> is not
    await taskPage.filterList.getByText(/is/i).click();
    await taskPage.comboboxPopover.getByText(/is not/i).click();
    await taskPage.expectToSeeFilter(/due Date/i, 'is not', 'today');
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    // after remove filter -> this is our first list item again
    await expect(listItem.getByText(/design mockups/i)).toBeVisible();

    await taskPage.openFilter(/due date/i);
    await taskPage.comboboxPopover.getByText(/this month/i).click();
    await taskPage.expectToSeeFilter(/due date/i, 'within', 'this month');

    await page.getByText(/this month/i).click();
    await taskPage.filterAndSelect('3 week', /3 weeks from now/i);
    await taskPage.expectToSeeFilter(/due date/i, 'before', '3 weeks from now');

    await taskPage.openFilter(/due date/i);
    await taskPage.filterAndSelect('no date', /no date defined/i);
    await taskPage.expectToSeeFilter(/due date/i, 'is', /no date defined/i);

    await taskPage.filterBySpecificDate(new Date().getDate().toString());

    await taskPage.closePopover();

    await taskPage.removeFilter('dueDate');

    await testingQueryBehavior({ taskPage, page });
  });

  test('can change the due date of the first task', async ({ taskPage }) => {
    const firstListItem = await taskPage.getListItem(0);
    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 1);
    const today = new Date();
    const day = tommorow.getDate();
    const day2DigitsTommorow = day.toString().padStart(2, '0');
    const day2DigitsToday = today.getDate().toString().padStart(2, '0');

    await firstListItem.getByText(day2DigitsTommorow).click();

    await taskPage.comboboxPopover.getByText(/today/i).click();

    await expect(firstListItem.getByText(day2DigitsToday)).toBeVisible();
  });

  test('can search for the date filter in the list item edit combobox', async ({
    taskPage,
  }) => {
    await taskPage.openFilter(/due Date/i);
    await taskPage.comboboxPopover.getByText(/today/i).click();

    const firstListItem = await taskPage.getListItem(0);
    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate());
    const day = tommorow.getDate();
    const day2DigitsTommorow = day.toString().padStart(2, '0');
    await firstListItem.getByText(day2DigitsTommorow).click();

    await taskPage.comboboxPopover.getByPlaceholder(/change/i).fill('3 day');
    await expect(
      taskPage.comboboxPopover.getByText(/3 days from now/i)
    ).toBeVisible();

    await taskPage.comboboxPopover.getByPlaceholder(/change/i).fill('day');
    await expect(taskPage.comboboxPopover.getByText(/one/i)).toBeVisible();
    await expect(taskPage.comboboxPopover.getByText(/2 days/i)).toBeVisible();
    await expect(taskPage.comboboxPopover.getByText(/3 days/i)).toBeVisible();

    await taskPage.comboboxPopover.getByPlaceholder(/change/i).fill('in 2');
    await expect(taskPage.comboboxPopover.getByText(/2 days/i)).toBeVisible();
    await expect(taskPage.comboboxPopover.getByText(/2 weeks/i)).toBeVisible();

    await taskPage.comboboxPopover.getByPlaceholder(/change/i).fill('no');
    await expect(taskPage.comboboxPopover.getByText(/no date/i)).toBeVisible();

    await taskPage.comboboxPopover.getByPlaceholder(/change/i).fill('today');
    await expect(taskPage.comboboxPopover.getByText(/one day/i)).toBeHidden();
  });

  test("can filter project by 'no project and assign a task to 'no project'", async ({
    taskPage,
    page,
  }) => {
    await taskPage.openFilter(/project/i);
    await taskPage.comboboxPopover.getByText(/no project/i).click();
    await expect(
      taskPage.comboboxPopover.getByText(/no project/i)
    ).toBeVisible();

    // i can see two list items
    await expect(page.getByTestId('list-item')).toHaveCount(2);

    await taskPage.closePopover();
    // click on the first list item "set project"
    await page
      .getByText(/set project/i)
      .first()
      .click();

    await taskPage.comboboxPopover.getByText(/fitness plan/i).click();

    // i can see only one list item
    await expect(page.getByTestId('list-item')).toHaveCount(1);

    await taskPage.removeFilter('projects');

    await expect(page.getByText(/design mockups/i).first()).toBeVisible();

    await page
      .getByText(/website redesign/i)
      .first()
      .click({ force: true });

    await taskPage.comboboxPopover.getByText(/no project/i).click();

    await taskPage.openFilter(/project/i);

    await taskPage.comboboxPopover.getByText(/no project/i).click();

    await taskPage.closePopover();

    await expect(page.getByText(/design mockups/i)).toBeVisible();
  });

  test('can right click on a task and open the context menu', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.locator('div').first().click({ force: true });
    await expect(firstListItem.getByText(/website redesign/i)).toBeVisible();
    await expect(firstListItem.getByText(/important/i)).toBeHidden();

    await expect(firstListItem.getByTestId('priority-none')).toBeVisible();

    // right click on the first list item
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    // check if the context menu is visible
    await expect(taskPage.contextmenu).toBeVisible();

    await expect(taskPage.contextmenu.getByText(/rename task/i)).toBeVisible();
    await expect(taskPage.contextmenu.getByText(/copy/i)).toBeVisible();

    await taskPage.contextmenu.getByText(/Project/i).hover();
    await expect(taskPage.contextmenu.getByText(/no project/i)).toBeVisible();

    await page.waitForTimeout(300);

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    // await expect(taskPage.contextmenu).toBeVisible();

    // await page.waitForTimeout(300);

    await taskPage.contextmenu.getByText(/priority/i).hover();

    await taskPage.contextmenu.getByText(/tag/i).hover();
    await taskPage.contextmenu.getByText(/important/i).click();
    await expect(firstListItem.getByText(/important/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });
    await expect(taskPage.contextmenu).toBeVisible();
    await taskPage.contextmenu.getByText(/priority/i).click();
    await taskPage.commandbar.getByText(/urgent/i).click();
    await expect(firstListItem.getByTestId('priority-urgent')).toBeVisible();
  });

  test('tasks has many todos, can add and remove todos', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.getByText('1 / 2').click();

    await taskPage.comboboxPopover.getByText(/Todo 2/i).click();

    await expect(firstListItem.getByText('1 / 1')).toBeVisible();

    await taskPage.comboboxPopover.getByText(/Todo 1/i).click();

    await taskPage.comboboxPopover.getByText(/Todo 1/i).click();

    await page.reload();

    await expect(firstListItem.getByText('1 / 1')).toBeVisible();
  });

  test('can right click on a task, and delete the task in the context menu', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await expect(taskPage.contextmenu).toBeVisible();

    await taskPage.contextmenu.getByText(/delete task/i).click();

    // see /are you sure/i
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: 'confirm' }).click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
  });

  test('display options are shown correctly', async ({ taskPage, page }) => {
    await taskPage.displayOptionsButton.click();

    await expect(taskPage.displayOptions).toBeVisible();

    await expect(taskPage.displayOptions).toBeVisible();

    await expect(
      taskPage.displayOptions.getByText(/No sorting/i)
    ).toBeVisible();
    await expect(
      taskPage.displayOptions.getByText(/No grouping/i)
    ).toBeVisible();
    await expect(
      taskPage.displayOptions.getByText(/list options/i)
    ).toBeVisible();
    await expect(
      taskPage.displayOptions.getByText(/display properties/i)
    ).toBeVisible();
    await expect(taskPage.displayOptions.getByText(/name/i)).toBeVisible();
    await expect(taskPage.displayOptions.getByText(/completed/i)).toBeVisible();
    await expect(taskPage.displayOptions.getByText(/board/i)).toBeVisible();
    await expect(taskPage.displayOptions.getByText(/ordering/i)).toBeVisible();
  });

  test('can sort by a field', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await sortByField(taskPage, /name/i);

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
    await expect(firstListItem.getByText(/assign launch/i)).toBeVisible();

    await page
      .getByRole('button', { name: 'toggle-sorting-direction' })
      .click();

    await expect(firstListItem.getByText(/assign launch/i)).toBeHidden();
    await expect(
      firstListItem.getByText(/watch spanish movies/i)
    ).toBeVisible();
  });

  test('can group by a field', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await groupByField(taskPage, /project/i);

    await expect(page.getByText(/Website redesign/i)).toHaveCount(4);

    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await firstListItem
      .getByText(/design mockups/i)
      .first()
      .click({ force: true });

    await sortByField(taskPage, /project/i);
    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
    await expect(firstListItem.getByText(/track monthly/i)).toBeVisible();
  });

  test('can scroll down, load more tasks, update a task and scroll to the top', async ({
    taskPage,
    page,
  }) => {
    // scroll down to the bottom
    // we want to test that if we fetch the next page of the pagination
    // and we update any item, all the previous pages that were loaded are still there
    await expect(page.getByText(/design mockups/i)).toBeVisible();

    await page.mouse.wheel(0, 10000);
    await page.getByText(/create training schedule/i).click();
    await page.mouse.wheel(0, 10000);
    await page.waitForTimeout(400);
    await page.getByText(/practice edit/i).click();

    await page.getByText(/learn photo/i).click();
    await taskPage.comboboxPopover.getByText(/no project/i).click();
    await expect(page.getByText(/learn photo/i)).toBeHidden();
    await page.waitForTimeout(400);

    await page.mouse.wheel(0, -10000);
    await page.waitForTimeout(400);
    await expect(page.getByText(/design mockups/i)).toBeVisible();

    // now we also want to test that when we change a item from the first pagination page
    // it still updates correctly
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.getByText(/website redesign/i).click();
    await taskPage.comboboxPopover.getByText(/fitness plan/i).click();
    await expect(firstListItem.getByText(/website redesign/i)).toBeHidden();
    await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
  });

  // [ ] add test -> scroll down to the bottom -> update project -> scroll to the top and we should be able to see the very first task item
  //  [ ] expand test for contextmenu
  // add tests for commandbar
  //  add tests for commanform
});

const testingQueryBehavior = async ({ taskPage, page }) => {
  await taskPage.openFilter(/due Date/i);
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

const sortByField = async (taskPage: TaskPage, name: RegExp) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No sorting/i).click();

  await taskPage.comboboxPopover.getByText(name).click();
};

const groupByField = async (taskPage: TaskPage, name: RegExp) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No grouping/i).click();

  await taskPage.comboboxPopover.getByText(name).click();
};
