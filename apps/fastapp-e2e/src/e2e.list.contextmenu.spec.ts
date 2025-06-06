import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';
import {
  openContextMenu,
  openContextMenu2,
} from './helpers/e2e.helper.contextmenu';
import { showDeleted } from './helpers/e2e.helper.displayoptions';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('all-tasks');
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('List Contextmenu', () => {
  test('can right click on a task and open the context menu', async ({
    mainPage,
    helper,
  }) => {
    const firstListItem = await mainPage.getListItem(0);
    const props = { mainPage, helper };
    await openContextMenu2(props, 0);

    await expect(mainPage.contextmenu.getByText(/rename task/i)).toBeVisible();
    await expect(mainPage.contextmenu.getByText(/copy/i)).toBeVisible();

    await mainPage.contextmenu.getByText(/Project/i).hover();
    await expect(mainPage.contextmenu.getByText(/no project/i)).toBeVisible();

    await waitFor(mainPage.page, 500);
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
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await openContextMenu2(props, 0);

    await expect(mainPage.contextmenu.getByText(/rename task/i)).toBeVisible();
    await expect(mainPage.contextmenu.getByText(/copy/i)).toBeVisible();

    await mainPage.contextmenu.getByText(/Project/i).hover();
    await expect(mainPage.contextmenu.getByText(/no project/i)).toBeVisible();

    await waitFor(mainPage.page, 500);
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
    helper,
  }) => {
    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/mark as completed/i).click();

    await expect(firstListItem.getByText(/✅/i)).toBeVisible();
  });

  test('can right click on a task and open commandbar by clicking on project', async ({
    mainPage,
    helper,
  }) => {
    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/project/i).click();

    await mainPage.commandbar.getByText(/fitness plan/i).click();
    await expect(firstListItem.getByText(/fitness plan/i)).toBeVisible();
    await expect(firstListItem.getByText(/website redesign/i)).toBeHidden();
  });

  test('can right click on a task and click edit to open commandform', async ({
    mainPage,
    page,
    helper,
  }) => {
    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await openContextMenu2(props, 0);

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
    helper,
  }) => {
    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/delete task/i).click();

    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: 'confirm' }).click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();
  });

  test('can delete record from contextmenu and show the deleted items', async ({
    mainPage,
    page,
    helper,
  }) => {
    const props = { mainPage, helper };

    const firstListItem = (await helper.list.getFirstListItem()).locator;
    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();

    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/delete task/i).click();

    await expect(page.getByText(/are you sure/i)).toBeVisible();

    await page.getByRole('button', { name: 'confirm' }).click();

    await expect(firstListItem.getByText(/design mockups/i)).toBeHidden();

    await showDeleted(mainPage);

    await expect(page.getByText(/design mockups/i)).toBeVisible();
  });
});
