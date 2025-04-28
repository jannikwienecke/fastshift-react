import { expect, test } from './fixtures';
import { isDev, waitFor } from './helpers/e2e.helper';
import { groupByField, sortByField } from './helpers/e2e.helper.displayoptions';
import {
  filterByDueDate,
  filterByProject,
  saveCurrentView,
} from './helpers/e2e.helper.custom-views';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('task');
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('Custom Views', () => {
  test('can sort and save the view', async ({ mainPage: taskPage, page }) => {
    let firstListItem = await taskPage.getListItem(0);
    await sortByField(taskPage, /name/i);
    await firstListItem.click({ force: true });

    await page.getByText(/reset/i).click();
    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();

    await sortByField(taskPage, /name/i);
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();

    await page.reload();

    firstListItem = await taskPage.getListItem(0);
    await expect(
      firstListItem.getByText(/Assign launch team role/i)
    ).toBeVisible();

    await groupByField(taskPage, /project/i);
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await waitFor(page, 500);
    await page.reload();

    await expect(page.getByTestId(`group-Website Redesign`)).toBeVisible();
  });

  test('can filter and save the view', async ({ mainPage: taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);

    await filterByProject(taskPage, 'fitness plan');
    await firstListItem.click({ force: true });

    await expect(page.getByText(/fitness plan/i)).toHaveCount(4);
    await expect(page.getByText(/design mockups/i)).toBeHidden();

    await page.getByText(/reset/i).click();
    await expect(page.getByText(/reset/i)).toBeHidden();
    await expect(page.getByText(/save/i)).toBeHidden();
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await filterByProject(taskPage, 'fitness plan');
    await firstListItem.click({ force: true });
    await saveCurrentView(page);

    await waitFor(page, 500);
    await page.reload();

    await expect(page.getByText(/fitness plan/i)).toHaveCount(4);
    await expect(page.getByText(/design mockups/i)).toBeHidden();
  });

  test('can save date filter in a new view, and see it in the list', async ({
    page,
    mainPage: taskPage,
  }) => {
    await filterByDueDate(taskPage, 'today');
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
  });
});
