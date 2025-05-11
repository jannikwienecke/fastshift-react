import { expect, test } from './fixtures';
import { isDev, waitFor } from './helpers/e2e.helper';

test.beforeEach(async ({ mainPage: taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();

  // clear local storage
  await taskPage.page.evaluate(() => {
    localStorage.clear();
  });
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('Smoke Test', () => {
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

    await taskPage.comboboxPopover.getByText(/organize desk space/i).click();

    await listItem.click({ force: true });

    await expect(listItem.getByText(/4/i)).toBeVisible();
    await listItem.getByText(/4/i).click();

    await expect(
      taskPage.comboboxPopover.getByText(/organize desk space/i)
    ).toBeVisible();
  });
});
