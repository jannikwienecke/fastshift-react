import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev } from './helpers/e2e.helper';
import { groupByField, sortByField } from './helpers/e2e.helper.displayoptions';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('all-tasks');
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('List Display Options', () => {
  test('display options are shown correctly', async ({
    mainPage: taskPage,
    page,
  }) => {
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

  test('can sort by a field', async ({ mainPage: taskPage, page }) => {
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

  test('can sort by a field in sub view', async ({
    mainPage: taskPage,
    page,
    helper,
  }) => {
    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await sortByField(taskPage, /name/i);

    await page
      .getByRole('button', { name: 'toggle-sorting-direction' })
      .click();

    await expect(
      firstListItem.getByText(/Implement responsive design/i)
    ).toBeVisible();
  });

  test('can group by a field', async ({ mainPage: taskPage, page }) => {
    const firstListItem = await taskPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await groupByField(taskPage, /project/i);

    await expect(taskPage.list.getByText(/Website redesign/i)).toHaveCount(3);

    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await firstListItem
      .getByText(/design mockups/i)
      .first()
      .click({ force: true });

    await sortByField(taskPage, /project/i);
    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
    await expect(firstListItem.getByText(/track monthly/i)).toBeVisible();
  });
});
