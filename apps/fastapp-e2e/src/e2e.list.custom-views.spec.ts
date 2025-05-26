import { expect, test } from './fixtures';
import { isDev, pressEnter, waitFor } from './helpers/e2e.helper';
import { groupByField, sortByField } from './helpers/e2e.helper.displayoptions';
import {
  filterByDueDate,
  filterByProject,
  saveCurrentView,
} from './helpers/e2e.helper.custom-views';
import { CON } from './helpers';
import { listFilter } from './helpers/e2e.helper.filter';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('all-tasks');
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('Custom Views', () => {
  test('can sort and save the view', async ({ mainPage: mainPage, page }) => {
    let firstListItem = await mainPage.getListItem(0);
    await sortByField(mainPage, /name/i);
    await firstListItem.click({ force: true });

    await page.getByText(/reset/i).click();
    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();

    await sortByField(mainPage, /name/i);
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();

    await page.reload();

    firstListItem = await mainPage.getListItem(0);
    await expect(
      firstListItem.getByText(/Assign launch team role/i)
    ).toBeVisible();

    await groupByField(mainPage, /project/i);
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await waitFor(page, 500);
    await page.reload();

    await expect(page.getByTestId(`group-Website Redesign`)).toBeVisible();
  });

  test.skip('can sort and save the view in sub list', async ({
    mainPage,
    helper,
    page,
  }) => {
    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    let firstListItem = await mainPage.getListItem(0);
    await sortByField(mainPage, /name/i);
    await firstListItem.click({ force: true });

    await saveCurrentView(page);

    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();

    await page.reload();

    firstListItem = await mainPage.getListItem(0);
    await expect(
      firstListItem.getByText(/Assign launch team role/i)
    ).toBeVisible();

    await groupByField(mainPage, /project/i);
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await waitFor(page, 500);
    await page.reload();

    await expect(page.getByTestId(`group-Website Redesign`)).toBeVisible();
  });

  test('can filter and save the view and then navigate to another view and back', async ({
    mainPage: mainPage,
    page,
  }) => {
    const firstListItem = await mainPage.getListItem(0);

    await filterByProject(mainPage, 'fitness plan');
    await firstListItem.click({ force: true });

    await expect(page.getByText(/fitness plan/i)).toHaveCount(4);
    await expect(page.getByText(/design mockups/i)).toBeHidden();

    await page.getByText(/reset/i).click();
    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await filterByProject(mainPage, 'fitness plan');
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await waitFor(page, 500);
    await page.reload();

    await expect(page.getByText(/fitness plan/i)).toHaveCount(4);
    await expect(page.getByText(/design mockups/i)).toBeHidden();

    await mainPage.sidebar
      .getByText(/projects/i)
      .first()
      .click();

    await mainPage.sidebar
      .getByText(/all projects/i)
      .first()
      .click();

    // we are on projects list view -> can see
    await expect(page.getByText(CON.project.values.fitnessPlan)).toHaveCount(2);
    await expect(
      page.getByText(CON.project.values.websiteRedesign)
    ).toHaveCount(1);

    // go back to tasks list view -> see the filtered tasks again
    await mainPage.sidebar.getByText('Tasks').nth(2).click();
    await mainPage.sidebar
      .getByText(/all tasks/i)
      .first()
      .click();

    await expect(page.getByText(CON.project.values.fitnessPlan)).toHaveCount(4);
    await expect(
      page.getByText(CON.project.values.websiteRedesign)
    ).toHaveCount(0);
  });

  test('can save date filter in a new view, and see it in the list. But dont see it in sub list of project:tasks', async ({
    page,
    mainPage,
    helper,
  }) => {
    await filterByDueDate(mainPage, 'today');
    await expect(page.getByText(/today/i).first()).toBeVisible();

    await saveCurrentView(page, true, {
      name: 'today-view',
      description: 'today view desc',
    });

    await expect(page).toHaveURL(/.*today-view/);

    await page.reload();
    await expect(page.getByText(/today/i).first()).toBeVisible();

    const day = new Date().getDate();
    await page
      .getByText(day.toString() + '.')
      .first()
      .click();

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    // filter of main list view is not applied to sub list
    await expect(page.getByText(/today/i).first()).toBeHidden();

    await filterByProject(mainPage, CON.project.values.websiteRedesign);

    await waitFor(page, 500);

    await helper.navigation.goToListView('all-tasks');

    // filter of sub list is not applied to main list
    await expect(
      page.getByText(CON.project.values.fitnessPlan).first()
    ).toBeVisible();

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await expect(
      listFilter({ mainPage, helper }).getFilterItemBy(
        CON.filter.options.project + 's'
      )
    ).toBeVisible();
  });

  test('can save date filter in a new view, see the sub todos and navigate around', async ({
    page,
    mainPage,
    helper,
  }) => {
    await filterByDueDate(mainPage, 'tomorrow');
    await expect(page.getByText(/tomorrow/i).first()).toBeVisible();

    await saveCurrentView(page, true, {
      name: 'tommorrow-view',
      description: 'tommorrow view desc',
    });

    await expect(page).toHaveURL(/.*tommorrow-view/);

    let firstListItem = await helper.list.getFirstListItem();
    await firstListItem.locator.click();

    await mainPage.detailHeader.getByText(/todos/i).click({ force: true });

    firstListItem = await helper.list.getFirstListItem();

    // we had a bug where the sub list would not show any results for a view with a custom name
    await expect(
      firstListItem.locator.getByText(/todo 1/i).first()
    ).toBeVisible();

    await mainPage.page.goBack();

    await expect(page).toHaveURL(/.*tommorrow-view/);
    await expect(page).toHaveURL(/.overview/);

    await mainPage.page.goBack();

    await expect(page).toHaveURL(/.*tommorrow-view/);
    await expect(page).not.toHaveURL(/.*overview/);

    firstListItem = await helper.list.getFirstListItem();
    await expect(
      firstListItem.locator.getByText(CON.task.values.designMockups)
    ).toBeVisible();

    await firstListItem.locator.click();

    await mainPage.detailHeader.getByText(/todos/i).click({ force: true });

    await expect(page).toHaveURL(/.todos/);

    await mainPage.sidebar.getByText(/tasks/i).nth(2).click();
    await mainPage.sidebar
      .getByText(/all tasks/i)
      .first()
      .click();

    await expect(page).toHaveURL(/.*task/i);

    // we had a bug when
    // we are on a custom view with a custom name
    // we navigate to it, then go to a different view, and back to the overview and then the detail page, app would break

    await mainPage.page.goBack();

    await mainPage.page.goBack();

    await mainPage.page.goBack();

    await expect(page).toHaveURL(/.*tommorrow-view/);
    await expect(page).not.toHaveURL(/.*Task/);

    firstListItem = await helper.list.getFirstListItem();

    await expect(
      firstListItem.locator.getByText(CON.task.values.designMockups)
    ).toBeVisible();

    //
  });

  test("can update an existing view's name and description", async ({
    mainPage,
  }) => {
    expect(1).toBe(1);

    await mainPage.pageHeader.getByText(/more/i).click({ force: true });
    await mainPage.page.getByText(/edit/i).click();

    const page = mainPage.page;
    await page.getByPlaceholder(/enter view name/i).fill('NEW NAME');
    await page
      .getByPlaceholder(/enter view description/i)
      .fill('NEW DESCRIPTION');

    await page.getByRole('button', { name: 'save' }).click();

    await page.waitForURL(/.*new-name/);
  });

  test('can update an existing view and set an emoji', async ({ mainPage }) => {
    await mainPage.pageHeader.getByText(/more/i).click({ force: true });
    await mainPage.page.getByText(/edit/i).click();

    const page = mainPage.page;

    await page.getByRole('button', { name: 'emoji-picker-button' }).click();

    await page.getByPlaceholder(/search/i).fill('laugh');

    await waitFor(page, 300);

    await pressEnter(page);

    await page.getByRole('button', { name: 'save' }).click();

    await waitFor(page, 300);

    await expect(page.getByText('🤣')).toBeVisible();

    await mainPage.sidebar.getByText('Tasks').nth(2).click();
    await expect(mainPage.sidebar.getByText('🤣')).toBeVisible();
  });

  test('can star and unstar a view', async ({ mainPage }) => {
    const page = mainPage.page;

    await page.getByTestId('unstarred').click({ force: true });
    await expect(mainPage.sidebar.getByText(/all tasks/i)).toHaveCount(2);
    await page.getByTestId('starred').click({ force: true });
    await expect(mainPage.sidebar.getByText(/all tasks/i)).toHaveCount(0);
    await page.getByTestId('unstarred').click({ force: true });

    await mainPage.sidebar.getByText(/all tasks more/i).click();

    await expect(mainPage.sidebar.getByText(/all tasks/i)).toHaveCount(2);
    await page.getByText(/remove from favorites/i).click();
    await expect(mainPage.sidebar.getByText(/all tasks/i)).toHaveCount(0);
  });

  test('can star and unstar a detail view', async ({ mainPage, helper }) => {
    const page = mainPage.page;

    expect(1).toBe(1);
    await helper.navigation.goToDetail(
      'all-tasks',
      CON.task.values.designMockups
    );

    await waitFor(page, 500);
    await page.getByTestId('unstarred').click({ force: true });

    // expect to see the name in the sidebar
    await expect(
      mainPage.sidebar.getByText(CON.task.values.designMockups)
    ).toHaveCount(2);

    await mainPage.sidebar
      .getByText(CON.task.values.designMockups + ' more')
      .click();
    await expect(
      mainPage.sidebar.getByText(CON.task.values.designMockups)
    ).toHaveCount(2);

    // remove from favorites
    await page.getByText(/remove from favorites/i).click();
    await expect(
      mainPage.sidebar.getByText(CON.task.values.designMockups)
    ).toHaveCount(0);

    await page.getByTestId('unstarred').click({ force: true });

    await mainPage.page
      .getByPlaceholder(/name/i)
      .fill(CON.task.values.designMockups + 'UPDATED');

    await pressEnter(page);

    await expect(
      mainPage.sidebar.getByText(CON.task.values.designMockups + 'UPDATED')
    ).toHaveCount(2);
  });
});
