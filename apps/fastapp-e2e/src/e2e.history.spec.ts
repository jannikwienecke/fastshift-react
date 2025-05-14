import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';
import { saveCurrentView } from './helpers/e2e.helper.custom-views';
import { listFilter } from './helpers/e2e.helper.filter';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('history');
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('history view tests', () => {
  test('Can see history list', async ({ mainPage, page, helper }) => {
    const firstListItem = await mainPage.getListItem(0);
    expect(firstListItem).toBeDefined();

    // click on user to go to the user detail page
    await firstListItem.getByText(/david/i).click();

    // url should contain /owner
    const url = page.url();
    expect(url).toContain('/owner');

    // go back
    await page.goBack();

    await firstListItem.getByText(CON.task.values.designMockups).click();
    await expect(page.url()).toContain('/tasks');

    // go back
    await page.goBack();

    // can see the workd update and the word insert
    await expect(page.getByText(/update/i).first()).toBeVisible();

    await expect(page.getByText(/insert/i).first()).toBeVisible();

    const { filterByWithOptions, removeFilter } = listFilter({
      mainPage,
      helper,
    });

    // await open();
    // await searchFor('Model');
    // await selectFilterOption('Tasks');
    await filterByWithOptions({ mainPage, helper }, 'Model', 'Tasks');
    await expect(firstListItem).toBeDefined();

    await removeFilter('tableName');

    await filterByWithOptions({ mainPage, helper }, 'Model', 'projects');
    await expect(firstListItem).toBeHidden();

    await saveCurrentView(page);

    await waitFor(page, 300);
    await page.reload();

    await expect(firstListItem).toBeHidden();
    await removeFilter('tableName');
    await expect(firstListItem).toBeDefined();
  });

  test('Can see the history details correctly ', async ({
    mainPage,
    page,
    helper,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    expect(firstListItem).toBeDefined();

    await firstListItem.getByText(/tasks/i).first().click();

    await expect(page.url()).toContain('/overview');

    await expect(page.getByText(/description:/i)).toBeVisible();
    await expect(page.getByText(/_creationTime/i)).toBeVisible();
    await expect(
      page.getByText(CON.task.values.designMockups).first()
    ).toBeVisible();

    // click on david
    await page.getByText(/david/i).click();

    // expect the url to contain /owner
    const url = page.url();
    expect(url).toContain('/owner');

    await helper.navigation.goToListView('history');
    const secondListItem = await helper.list.getListItem(1);
    expect(secondListItem).toBeDefined();
    await expect(secondListItem.locator.getByText(/update/i)).toBeVisible();

    await secondListItem.locator.getByText(/tasks/i).first().click();
    await expect(page.url()).toContain('/overview');

    // expect to have the words "old" and "new" and Field: Description
    await expect(page.getByText(/old/i)).toBeVisible();
    await expect(page.getByText(/new/i)).toBeVisible();
    await expect(page.getByText(/field:/i)).toBeVisible();
    await expect(page.getByText(/description/i)).toBeVisible();
  });
});
