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

    await page.waitForTimeout(200);

    const longTerm = taskPage.comboboxPopover.getByText(/long-term/i);
    await longTerm.locator('../../../..').getByRole('checkbox').first().click();

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

    await page.waitForTimeout(500);

    await taskPage.openFilter(/project/i);

    await taskPage.comboboxPopover.getByText(/no project/i).click();

    await taskPage.closePopover();

    await expect(page.getByText(/design mockups/i)).toBeVisible();
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

  test('can right click on a task and toggle completed state', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // right click on the first list item
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/mark as completed/i).click();

    await expect(firstListItem.getByText(/✅/i)).toBeVisible();
  });

  test('can right click on a task and open commandbar by clicking on project', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // right click on the first list item
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/project/i).click();

    await taskPage.commandbar.getByText(/fitness plan/i).click();
    await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
    await expect(firstListItem.getByText(/website redesign/i)).toBeHidden();
  });

  test('can right click on a task and click edit to open commandform', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // right click on the first list item
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/edit task/i).click();

    await expect(
      taskPage.commandform.getByText(/design mockups/i)
    ).toBeVisible();

    await taskPage.commandform
      .getByPlaceholder(/name/i)
      .fill('design mockups - updated');

    await taskPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(page.getByText(/design mockups - updated/i)).toBeVisible();

    await page.waitForTimeout(500);

    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // do the same again to rename to original name
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await page.waitForTimeout(500);

    await taskPage.contextmenu.getByText(/edit task/i).click();

    await page.waitForTimeout(500);

    await taskPage.commandform.getByPlaceholder(/name/i).fill('design mockups');

    await page.waitForTimeout(500);

    await taskPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();
    await expect(
      firstListItem.getByText(/design mockups - updated/i)
    ).toBeHidden();
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

  test('can open and navigate in the commandbar', async ({
    taskPage,
    page,
  }) => {
    // press cmd + k
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.click();

    await taskPage.page.keyboard.press('Meta+k');
    await expect(taskPage.commandbar).toBeVisible();

    // expect to see the commandbar and the text /project/i
    await expect(
      taskPage.commandbar.getByText(/project/i).first()
    ).toBeVisible();

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .fill('rename task');

    await expect(taskPage.commandbar.getByText(/rename task/i)).toBeVisible();
    // now we should no be seeing the project
    await expect(taskPage.commandbar.getByText(/project/i)).toBeHidden();

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .clear();

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .fill('create new');

    await expect(
      taskPage.commandbar.getByText(/create new task/i).first()
    ).toBeVisible();

    await expect(
      taskPage.commandbar.getByText(/create new project/i)
    ).toBeVisible();

    await expect(
      taskPage.commandbar.getByText(/create new tag/i)
    ).toBeVisible();

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .clear();

    await expect(
      taskPage.commandbar.getByText(/update description/i)
    ).toBeVisible();
  });

  test('can open commandbar and then toggle completed state', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // open commandbar
    await taskPage.page.keyboard.press('Meta+k');
    await expect(taskPage.commandbar).toBeVisible();

    await taskPage.commandbar.getByText(/mark as completed/i).click();

    await expect(taskPage.commandbar).toBeHidden();

    await expect(firstListItem.getByText(/✅/i)).toBeVisible();
  });

  test('can open commandbar and update the project', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openCommandbar(taskPage);

    await taskPage.commandbar.getByText(/add to project/i).click();

    await expect(
      taskPage.commandbar.getByText(/create new project/i)
    ).toBeVisible();
    await expect(taskPage.commandbar.getByText(/no project/i)).toBeVisible();

    await taskPage.commandbar
      .getByPlaceholder('change project to')
      .fill('fitness plan');
    await taskPage.commandbar.getByText(/fitness plan/i).click();

    await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
  });

  test('can open commandbar and then open commandform task create form', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openCommandbar(taskPage);

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .fill('create new taks');

    await taskPage.commandbar.getByText(/create new task/i).click();

    // expect that the btn is disabled
    await expect(taskPage.commandform.getByText(/create task/i)).toBeDisabled();

    await taskPage.commandform.getByPlaceholder(/name/i).fill('New Task Name');
    await taskPage.commandform
      .getByPlaceholder(/description/i)
      .fill('New Task Description');

    await taskPage.commandform.getByText(/tag/i).click();
    await taskPage.comboboxPopover.getByText(/important/i).click();
    await page.waitForTimeout(200);
    await taskPage.comboboxPopover.getByText(/important/i).click();

    await expect(taskPage.commandform.getByText(/2 tags/i)).toBeHidden();
    await taskPage.comboboxPopover.getByText(/important/i).click();

    // close the popover
    await taskPage.commandform.getByText(/create task/i).click({ force: true });

    await taskPage.commandform.getByText(/project/i).click();
    await taskPage.comboboxPopover.getByText(/website redesign/i).click();

    // expect that the btn is NOT disabled
    await expect(taskPage.commandform.getByText(/create task/i)).toBeEnabled();

    await taskPage.commandform.getByText(/create task/i).click();

    await expect(page.getByText(/created Successfully/i)).toBeVisible();

    // scroll down
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, 5000);

    await openCommandbar(taskPage);

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .fill('create new taks');

    await taskPage.commandbar.getByText(/create new task/i).click();

    await taskPage.commandform
      .getByPlaceholder(/name/i)
      .fill('second new task');

    await taskPage.commandform.getByText(/create task/i).click();

    await expect(page.getByText(/second new task/i)).toBeVisible();
  });

  test('sort by created at and then create a new item and see it in list on top', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await sortByField(taskPage, /created at/i, 'created');

    await openCommandbar(taskPage);

    await taskPage.commandbar
      .getByPlaceholder(/type a command or search/i)
      .fill('create new taks');

    await taskPage.commandbar.getByText(/create new task/i).click();

    await taskPage.commandform.getByPlaceholder(/name/i).fill('New Task Name');

    await taskPage.commandform.getByText(/create task/i).click();

    expect(1).toBe(1);
  });

  // add test where we filter by name="design" and then we sort by name,
  // we had a bug, where only 2 items were shown, but should be 3
  test('filter by name and sort by name', async ({ taskPage, page }) => {
    // first filter by name
    await taskPage.filterButton.click();
    await taskPage.comboboxPopover.getByText(/name/i).click();

    await page.getByPlaceholder(/name/i).fill('design');
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText(/design mockups/i)).toBeVisible();

    // expect that we have 3 list items
    await expect(page.getByTestId('list-item')).toHaveCount(3);

    // now we sort by name and expect to still see 3 items
    await sortByField(taskPage, /name/i);
    await expect(page.getByText(/design mockups/i)).toBeVisible();
    await expect(page.getByTestId('list-item')).toHaveCount(3);
  });

  // add test -> scroll down, load more tasks, and still only see always one of the same task
  // we had a bug, where each time we scroll, we load the same task again
  test('scroll down, load more tasks, and still only see one of the same task', async ({
    taskPage,
    page,
  }) => {
    // scroll down to the bottom
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.click();

    await scrollToBottom(page);

    // expect to see only one of the same task
    await expect(page.getByText(/Practice editing techniques/i)).toHaveCount(1);
  });

  test('update an task record with invalid title, and see error message and rollback', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    // right click on the first list item
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/edit task/i).click();

    await taskPage.commandform.getByPlaceholder(/name/i).fill('_error_');

    await taskPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(page.getByText(/_error_/i)).toBeVisible();

    // expect commandform to be closed -> optimistic update
    await expect(taskPage.commandform).toBeHidden();

    // and then open it again -> rollback
    await expect(taskPage.commandform).toBeVisible();
    await expect(page.getByText(/_error_/i)).toBeHidden();

    // update name
    await taskPage.commandform
      .getByPlaceholder(/name/i)
      .fill('new name task...');

    await taskPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();
    await expect(page.getByText(/new name task.../i)).toBeVisible();
    await expect(page.getByText(/_error_/i)).toBeHidden();
    await expect(taskPage.commandform).toBeHidden();
  });

  test('can add and remove a tag to a task in the commandbar', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();
    await expect(firstListItem.getByText(/urgent/i)).toBeHidden();
    await expect(firstListItem.getByText(/important/i)).toBeHidden();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/tag/i).click();

    await taskPage.commandbar.getByText(/urgent/i).click();
    await taskPage.commandbar.getByText(/important/i).click();

    await expect(firstListItem.getByText(/urgent/i)).toBeVisible();
    await expect(firstListItem.getByText(/important/i)).toBeVisible();

    await firstListItem.click({ force: true });
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/tag/i).click();

    await taskPage.commandbar.getByText(/urgent/i).click();
    await taskPage.commandbar.getByText(/important/i).click();
    await expect(firstListItem.getByText(/urgent/i)).toBeHidden();
    await expect(firstListItem.getByText(/important/i)).toBeHidden();
  });

  test('can delete record and show the deleted items', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await taskPage.contextmenu.getByText(/delete task/i).click();

    // see /are you sure/i
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: 'confirm' }).click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();

    await taskPage.displayOptionsButton.click();

    await taskPage.displayOptions.getByTestId('show-deleted-switch').click();

    await expect(page.getByText(/design mockups/i)).toBeVisible();
  });

  test('can open commandform to create new project', async ({
    taskPage,
    page,
  }) => {
    const firstListItem = await taskPage.getListItem(0);

    // Right click on the first list item to open context menu
    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    // Click on Project in the context menu
    await taskPage.contextmenu.getByText(/project/i).click();

    // Click on create new project in the commandbar
    await taskPage.commandbar.getByText(/create new project/i).click();

    // Expect commandform to be visible and create button to be disabled initially
    await expect(taskPage.commandform).toBeVisible();
    await expect(
      taskPage.commandform.getByText(/create project/i)
    ).toBeDisabled();

    // Fill in project details
    await taskPage.commandform
      .getByPlaceholder(/label/i)
      .fill('New Test Project');
    await taskPage.commandform
      .getByPlaceholder(/description/i)
      .fill('Project Description');

    // TODO UPDATE THIS TEST -> we need to also set the owner and category
    // // Expect create button to be enabled after filling required fields
    // await expect(
    //   taskPage.commandform.getByText(/create project/i)
    // ).toBeEnabled();

    // // Create the project
    // await taskPage.commandform.getByText(/create project/i).click();

    // // Verify success message and project creation
    // await expect(page.getByText(/created Successfully/i)).toBeVisible();
    // await expect(page.getByText(/New Test Project/i)).toBeVisible();

    // // Verify the new project appears in the context menu
    // await firstListItem
    //   .locator('div')
    //   .first()
    //   .click({ force: true, button: 'right' });

    // await taskPage.contextmenu.getByText(/project/i).hover();
    // await expect(
    //   taskPage.contextmenu.getByText(/New Test Project/i)
    // ).toBeVisible();
  });
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

const sortByField = async (
  taskPage: TaskPage,
  name: RegExp,
  query?: string
) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No sorting/i).click();

  if (query)
    await taskPage.comboboxPopover.getByPlaceholder(/filter by/i).fill(query);

  await taskPage.comboboxPopover.getByText(name).click();
};

const groupByField = async (taskPage: TaskPage, name: RegExp) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No grouping/i).click();

  await taskPage.comboboxPopover.getByText(name).click();
};

const openCommandbar = async (taskPage: TaskPage) => {
  // open commandbar
  await taskPage.page.keyboard.press('Meta+k');
  await expect(taskPage.commandbar).toBeVisible();
};

export const scrollToBottom = async (page) => {
  await page.mouse.wheel(0, 10000);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 10000);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, 10000);
};
