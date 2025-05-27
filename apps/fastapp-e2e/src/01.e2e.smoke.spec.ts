import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev, pressEnter, pressEscape, waitFor } from './helpers/e2e.helper';

test.beforeEach(async ({ mainPage: taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();

  // clear local storage
  await taskPage.page.evaluate(() => {
    localStorage.clear();
  });
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('Smoke Test', () => {
  test('loading views', async ({ mainPage: taskPage, page, helper }) => {
    expect(1).toBe(1);
    await taskPage.sidebar.getByText(/tasks/i).nth(2).click();
    await taskPage.sidebar.getByText(/all tasks/i).click();
    await expect(page).toHaveURL(/.*all/);
    await (await helper.list.getFirstListItem()).locator.click();
    await expect(page).toHaveURL(/.*overview/);

    // expect to see
    // David Wilson changed
    await expect(page.getByText(/changed/)).toBeVisible();

    // and also David Wilson created this Task
    await expect(page.getByText(/created/)).toBeVisible();

    // and 5 minutes ago
    await expect(page.getByText(/3 minutes ago/)).toBeVisible();

    await page.getByPlaceholder(/description/i).fill('This is a test task');

    await pressEnter(page);

    await expect(page.getByText(/just now/)).toBeVisible();

    await taskPage.detailHeader.getByText(/all tasks/i).click();

    await (
      await helper.list.getFirstListItem()
    ).hasText(CON.task.values.firstListItem);

    await taskPage.sidebar.getByText(/this week/i).click();

    await waitFor(page, 200);

    await (await helper.list.getListItem(1)).hasText('develop frontend');

    await helper.list.hasListSizeOf(3);

    await taskPage.sidebar
      .getByText(/urgent/i)
      .first()
      .click();
    await helper.list.hasListSizeOf(1);

    await taskPage.sidebar
      .getByText(/projects/i)
      .first()
      .click();

    await taskPage.sidebar
      .getByText(/sorted/i)
      .first()
      .click();

    await (await helper.list.getListItem(0)).hasText('budget analysis');

    await taskPage.sidebar
      .getByText(/core data/i)
      .first()
      .click();

    await taskPage.sidebar
      .getByText(/history/i)
      .first()
      .click();

    // expect to be on url with history
    await expect(page).toHaveURL(/.*history/);

    await waitFor(page, 200);

    await taskPage.page
      .getByText(/filter/i)
      .first()
      .click();

    await expect(page.getByText(/entity id/i)).toBeVisible();

    await pressEscape(page);

    await page
      .getByText(/david wil/i)
      .first()
      .click();

    // expect to be on url with owner
    await expect(page).toHaveURL(/.*owner/);

    await waitFor(page, 200);

    await page.goBack();

    await expect(page).toHaveURL(/.*history/);

    await waitFor(page, 200);

    await taskPage.page
      .getByText(/filter/i)
      .first()
      .click();

    await expect(page.getByText(/entity id/i)).toBeVisible();
  });

  test('Can load and view all views', async ({ mainPage: taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);

    await firstListItem.click();

    const detailHeader = page.getByTestId('detail-page-header');
    await expect(detailHeader).toBeVisible();

    await detailHeader.getByText(/todos/i).click({ force: true });

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
    await sidebar
      .getByText(/projects/i)
      .first()
      .click();

    await sidebar
      .getByText(/sorted projects/i)
      .first()
      .click();

    await waitFor(page, 200);

    const projectListItem = await taskPage.getListItem(0);

    await projectListItem.click();

    await waitFor(page, 200);

    await detailHeader.getByText(/tasks/i).click({ force: true });

    await sidebar.getByText(/core data/i).click();
    await sidebar.getByText('Owner').first().click();

    const ownerListItem = await taskPage.getListItem(0);
    await ownerListItem.click();

    const placeholderFirstName = page.getByPlaceholder('name').first();
    await placeholderFirstName.fill('JohnNew');
    await waitFor(page, 200);
    await placeholderFirstName.press('Enter');

    await waitFor(page, 200);
    await sidebar.getByText(/owner/i).first().click();
  });
  test('can assign a task to a project and see it in the list', async ({
    mainPage: taskPage,
    page,
  }) => {
    await taskPage.gotoPage('projects');
    // expect url
    await expect(page).toHaveURL(/.*projects/);
    const listItem = await taskPage.getListItem(0);
    await listItem.getByText(/3/i).click();

    await expect(
      taskPage.comboboxPopover.getByText(/organize desk space/i)
    ).toBeHidden();

    await taskPage.comboboxPopover
      .getByPlaceholder(/change tasks/i)
      .fill('organize desk space');

    await waitFor(page, 50);

    await taskPage.comboboxPopover.getByText(/organize desk space/i).click();

    await waitFor(page, 50);

    await listItem.click({ force: true });

    await waitFor(page, 50);

    await expect(listItem.getByText(/4/i)).toBeVisible();
    await listItem.getByText(/4/i).click();

    await expect(
      taskPage.comboboxPopover.getByText(/organize desk space/i)
    ).toBeVisible();
  });
});
