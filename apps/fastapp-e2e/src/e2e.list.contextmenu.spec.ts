import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';

// helper to DRY out opening the context menu
async function openContextMenu(item: any, contextmenu: any) {
  await item.locator('div').first().click({ force: true, button: 'right' });
  await expect(contextmenu).toBeVisible();
}

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('task');
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('List Contextmenu', () => {
  test('can right click on a task and open the context menu', async ({
    mainPage,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    await openContextMenu(firstListItem, mainPage.contextmenu);
    await expect(mainPage.contextmenu.getByText(/rename task/i)).toBeVisible();
    await expect(mainPage.contextmenu.getByText(/copy/i)).toBeVisible();

    await mainPage.contextmenu.getByText(/Project/i).hover();
    await expect(mainPage.contextmenu.getByText(/no project/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await mainPage.contextmenu.getByText(/priority/i).hover();

    await mainPage.contextmenu.getByText(/tag/i).hover();
    await mainPage.contextmenu.getByText(/important/i).click();
    await expect(firstListItem.getByText(/important/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });
    await expect(mainPage.contextmenu).toBeVisible();
    await mainPage.contextmenu.getByText(/priority/i).click();
    await mainPage.commandbar.getByText(/urgent/i).click();
    await expect(firstListItem.getByTestId('priority-urgent')).toBeVisible();
  });

  test('can right click on a task and open the context menu in sub view ', async ({
    mainPage,
    helper,
  }) => {
    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const firstListItem = await mainPage.getListItem(0);
    await openContextMenu(firstListItem, mainPage.contextmenu);
    await expect(mainPage.contextmenu.getByText(/rename task/i)).toBeVisible();
    await expect(mainPage.contextmenu.getByText(/copy/i)).toBeVisible();

    await mainPage.contextmenu.getByText(/Project/i).hover();
    await expect(mainPage.contextmenu.getByText(/no project/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });

    await mainPage.contextmenu.getByText(/priority/i).hover();

    await mainPage.contextmenu.getByText(/tag/i).hover();
    await mainPage.contextmenu.getByText(/important/i).click();
    await expect(firstListItem.getByText(/important/i)).toBeVisible();

    await firstListItem
      .locator('div')
      .first()
      .click({ force: true, button: 'right' });
    await expect(mainPage.contextmenu).toBeVisible();
    await mainPage.contextmenu.getByText(/priority/i).click();
    await mainPage.commandbar.getByText(/urgent/i).click();
    await expect(firstListItem.getByTestId('priority-urgent')).toBeVisible();
  });

  test('can right click on a task and toggle completed state', async ({
    mainPage,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openContextMenu(firstListItem, mainPage.contextmenu);
    await mainPage.contextmenu.getByText(/mark as completed/i).click();

    await expect(firstListItem.getByText(/✅/i)).toBeVisible();
  });

  test('can right click on a task and open commandbar by clicking on project', async ({
    mainPage,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openContextMenu(firstListItem, mainPage.contextmenu);
    await mainPage.contextmenu.getByText(/project/i).click();

    await mainPage.commandbar.getByText(/fitness plan/i).click();
    await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
    await expect(firstListItem.getByText(/website redesign/i)).toBeHidden();
  });

  test('can right click on a task and click edit to open commandform', async ({
    mainPage,
    page,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openContextMenu(firstListItem, mainPage.contextmenu);
    await mainPage.contextmenu.getByText(/edit task/i).click();

    await expect(
      mainPage.commandform.getByText(/design mockups/i)
    ).toBeVisible();

    await mainPage.commandform
      .getByPlaceholder(/name/i)
      .fill('design mockups - updated');

    await mainPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(page.getByText(/design mockups - updated/i)).toBeVisible();

    await waitFor(page, 500);

    await expect(firstListItem.getByText(/❌/i)).toBeVisible();

    await openContextMenu(firstListItem, mainPage.contextmenu);

    await waitFor(page, 500);

    await mainPage.contextmenu.getByText(/edit task/i).click();

    await waitFor(page, 500);

    await mainPage.commandform.getByPlaceholder(/name/i).fill('design mockups');

    await waitFor(page, 500);

    await mainPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await expect(
      firstListItem.getByText(/design mockups - updated/i)
    ).toBeHidden();
  });

  test('can right click on a task, and delete the task in the context menu', async ({
    mainPage,
    page,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await openContextMenu(firstListItem, mainPage.contextmenu);

    await mainPage.contextmenu.getByText(/delete task/i).click();

    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: 'confirm' }).click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
  });
});
