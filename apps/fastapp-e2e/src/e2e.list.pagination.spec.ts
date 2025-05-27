import { expect, test } from './fixtures';
import { isDev, waitFor } from './helpers/e2e.helper';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('all-tasks');
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('Pagination / Scrolling -> load more data', () => {
  test.skip('can scroll down, load more tasks, update a task and scroll to the top', async ({
    mainPage: taskPage,
    page,
  }) => {
    expect(1).toBe(1);

    // scroll down to the bottom
    // we want to test that if we fetch the next page of the pagination
    // and we update any item, all the previous pages that were loaded are still there
    // await expect(page.getByText(/design mockups/i)).toBeVisible();

    // await page.locator('body').click();

    // await page.waitForTimeout(1000);

    // await page.mouse.wheel(0, 10000);
    // await page.waitForTimeout(1000);
    // await expect(page.getByText(/create training schedule/i)).toBeVisible();
    // await page.mouse.wheel(0, 10000);
    // await page.waitForTimeout(1000);
    // await page.waitForTimeout(400);
    // await page.getByText(/practice edit/i).click();

    // await page.getByText(/learn photo/i).click();
    // await taskPage.comboboxPopover.getByText(/no project/i).click();
    // await expect(page.getByText(/learn photo/i)).toBeHidden();
    // await page.waitForTimeout(400);

    // await page.mouse.wheel(0, -10000);
    // await page.waitForTimeout(400);
    // await expect(page.getByText(/design mockups/i)).toBeVisible();

    // // now we also want to test that when we change a item from the first pagination page
    // // it still updates correctly
    // const firstListItem = await taskPage.getListItem(0);
    // await firstListItem.getByText(/website redesign/i).click();
    // await taskPage.comboboxPopover.getByText(/fitness plan/i).click();
    // await expect(firstListItem.getByText(/website redesign/i)).toBeHidden();
    // await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
  });

  // add test -> scroll down, load more tasks, and still only see always one of the same task
  // we had a bug, where each time we scroll, we load the same task again
  test.skip('scroll down, load more tasks, and still only see one of the same task', async ({
    mainPage: taskPage,
    page,
  }) => {
    // scroll down to the bottom
    const firstListItem = await taskPage.getListItem(0);
    await firstListItem.click();

    await scrollToBottom(page);

    // expect to see only one of the same task
    await expect(page.getByText(/Practice editing techniques/i)).toHaveCount(1);
  });
});

const scrollToBottom = async (page) => {
  await page.mouse.wheel(0, 10000);
  await waitFor(page, 500);
  await page.mouse.wheel(0, 10000);
  await waitFor(page, 500);
  await page.mouse.wheel(0, 10000);
};
