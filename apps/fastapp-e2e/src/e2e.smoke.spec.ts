import { expect, test } from './fixtures';

test.beforeEach(async ({ taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();
});

test.setTimeout(20000);

test.describe.configure({ mode: 'serial' });

test.describe('Smoke Test', () => {
  test('Can load and view all views', async ({ taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);

    await firstListItem.click();

    const detailHeader = page.getByTestId('detail-page-header');
    await expect(detailHeader).toBeVisible();

    await detailHeader.getByText(/tags/i).click();

    await detailHeader.getByText(/todos/i).click();

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
    await sidebar
      .getByText(/projects/i)
      .first()
      .click();

    const projectListItem = await taskPage.getListItem(0);

    await projectListItem.click();

    await detailHeader.getByText(/tasks/i).click();

    await sidebar.getByText(/owner/i).first().click();

    const ownerListItem = await taskPage.getListItem(0);
    await ownerListItem.click();

    const placeholderFirstName = page.getByPlaceholder('Name').first();
    await placeholderFirstName.fill('JohnNew');
    await placeholderFirstName.press('Enter');

    await sidebar.getByText(/owner/i).first().click();

    await ownerListItem.getByText(/johnnew/i).click();
  });
});
