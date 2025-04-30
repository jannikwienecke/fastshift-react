import { expect, test } from './fixtures';
import { isDev, waitFor } from './helpers/e2e.helper';
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
  await helper.navigation.goToListView('task');
});

test.setTimeout(isDev() ? 20000 : 10000);

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
    // TODO: After implementing
    await helper.navigation.goToDetailSubList(
      'my-projects',
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

    // we are on projects list view -> can see
    await expect(page.getByText(CON.project.values.fitnessPlan)).toHaveCount(2);
    await expect(
      page.getByText(CON.project.values.websiteRedesign)
    ).toHaveCount(1);

    // go back to tasks list view -> see the filtered tasks again
    await mainPage.sidebar.getByText(/tasks/i).first().click();
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
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    // filter of main list view is not applied to sub list
    await expect(page.getByText(/today/i).first()).toBeHidden();

    await filterByProject(mainPage, CON.project.values.websiteRedesign);

    await waitFor(page, 500);

    await helper.navigation.goToListView('task');

    // filter of sub list is not applied to main list
    await expect(
      page.getByText(CON.project.values.fitnessPlan).first()
    ).toBeVisible();

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await expect(
      listFilter({ mainPage, helper }).getFilterItemBy(
        CON.filter.options.project + 's'
      )
    ).toBeVisible();
  });
});
