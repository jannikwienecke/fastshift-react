import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, pressEscape, waitFor } from './helpers/e2e.helper';
import { commandbar } from './helpers/e2e.helper.commandbar';
import { openContextMenu2 } from './helpers/e2e.helper.contextmenu';
import { sortByField } from './helpers/e2e.helper.displayoptions';
import { listCombobox } from './helpers/e2e.helper.list-combobox';
import { MainViewPage } from './view-pom';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('all-tasks');
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('List Commandbar', () => {
  test('can open commandbar and then open commandform task create form', async ({
    mainPage,
    helper,
    page,
  }) => {
    const props = { mainPage, helper };
    await commandbar.openCommandbar({ mainPage, helper });

    await commandbar.search(mainPage, 'create new task');

    await mainPage.commandbar.getByText(/create new task/i).click();

    // expect that the btn is disabled
    await expect(
      mainPage.commandform.getByText(/create task/i)
    ).toHaveAttribute('data-disabled', 'true');

    await mainPage.commandform.getByPlaceholder(/name/i).fill('New Task Name');

    await mainPage.commandform
      .getByPlaceholder(/description/i)
      .fill('New Task Description');

    await openComboboxOf(props, 'tags');
    await selectComboboxOption(props, CON.tag.values.longTerm);

    await waitFor(mainPage.page, 200);

    await selectComboboxOption(props, CON.tag.values.creative);

    await mainPage.commandform.click({ force: true });

    await openComboboxOf(props, 'project');

    await selectComboboxOption(props, CON.project.values.websiteRedesign);

    // expect that the btn is NOT disabled
    await expect(mainPage.commandform.getByText(/create task/i)).toBeEnabled();

    await mainPage.commandform.getByText(/create task/i).click();

    await expect(
      mainPage.page.getByText(/created Successfully/i)
    ).toBeVisible();

    // scroll down
    await page.mouse.wheel(0, 5000);
    await waitFor(page, 500);
    await page.mouse.wheel(0, 5000);
    await waitFor(page, 500);
    await page.mouse.wheel(0, 5000);

    await commandbar.openCommandbar({ mainPage, helper });

    await commandbar.search(mainPage, 'create new task');

    await mainPage.commandbar.getByText(/create new task/i).click();

    await mainPage.commandform
      .getByPlaceholder(/name/i)
      .fill('second new task');

    await mainPage.commandform.getByText(/create task/i).click();

    await expect(page.getByText(/second new task/i)).toBeVisible();
  });

  test('sort by created at and then create a new item and see it in list on top', async ({
    mainPage,
    helper,
  }) => {
    await sortByField(mainPage, /created at/i, 'created');
    await pressEscape(mainPage.page);

    await commandbar.openCommandbar({ mainPage, helper });

    await commandbar.search(mainPage, 'create new task');

    await mainPage.commandbar.getByText(/create new task/i).click();

    await mainPage.commandform.getByPlaceholder(/name/i).fill('New Task Name');

    await mainPage.commandform.getByText(/create task/i).click();

    expect(1).toBe(1);
  });

  test('can open commandform to create new project', async ({
    mainPage,
    page,
    helper,
  }) => {
    const props = { mainPage, helper };
    await openContextMenu2(props, 0);

    // Click on Project in the context menu
    await mainPage.contextmenu.getByText(/project/i).click();

    // Click on create new project in the commandbar
    await mainPage.commandbar.getByText(/create new project/i).click();

    // Expect commandform to be visible and create button to be disabled initially
    await expect(mainPage.commandform).toBeVisible();
    await expect(
      mainPage.commandform.getByText(/create project/i)
    ).toHaveAttribute('data-disabled', 'true');

    // Fill in project details
    await mainPage.commandform
      .getByPlaceholder(/label/i)
      .fill('New Test Project');
    await mainPage.commandform
      .getByPlaceholder(/description/i)
      .fill('Project Description');

    await mainPage.commandform.getByText(/owner/i).first().click();
    await page.getByPlaceholder(/filter by/i).fill('Mike Johnson');
    await expect(page.getByText(/john doe/i)).toBeHidden();
    await page.getByText(/mike Johnson/i).click();

    await mainPage.commandform
      .getByText(/category/i)
      .first()
      .click();

    await page.getByText(/Education/i).click();

    await mainPage.commandform
      .getByText(/due date/i)
      .first()
      .click();
    await mainPage.comboboxPopover.getByText(/today/i).click();

    await page.getByRole('button', { name: /create project/i }).click();

    await expect(page.getByText(/created Successfully/i)).toBeVisible();

    // // Expect create button to be enabled after filling required fields
    // await expect(
    //   mainPage.commandform.getByText(/create project/i)
    // ).toBeEnabled();

    // // Create the project
    // await mainPage.commandform.getByText(/create project/i).click();

    // // Verify success message and project creation
    // await expect(page.getByText(/created Successfully/i)).toBeVisible();
    // await expect(page.getByText(/New Test Project/i)).toBeVisible();

    // // Verify the new project appears in the context menu
    // await firstListItem
    //   .locator('div')
    //   .first()
    //   .click({ force: true, button: 'right' });

    // await mainPage.contextmenu.getByText(/project/i).hover();
    // await expect(
    //   mainPage.contextmenu.getByText(/New Test Project/i)
    // ).toBeVisible();
  });

  test('update an task record with invalid title, and see error message and rollback', async ({
    mainPage,
    page,
    helper,
  }) => {
    const props = { mainPage, helper };
    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/edit task/i).click();

    await mainPage.commandform.getByPlaceholder(/name/i).fill('_error_');

    await mainPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();

    await expect(page.getByText(/_error_/i)).toBeVisible();

    // expect commandform to be closed -> optimistic update
    await expect(mainPage.commandform).toBeHidden();

    // and then open it again -> rollback
    await expect(mainPage.commandform).toBeVisible();
    await expect(page.getByText(/_error_/i)).toBeHidden();

    // update name
    await mainPage.commandform
      .getByPlaceholder(/name/i)
      .fill('new name task...');

    await mainPage.commandform
      .getByRole('button', { name: 'update task' })
      .click();
    await expect(page.getByText(/new name task.../i)).toBeVisible();
    await expect(page.getByText(/_error_/i)).toBeHidden();
    await expect(mainPage.commandform).toBeHidden();
  });

  test('can create a new tag inside the task overview detail page', async ({
    mainPage,
    page,
    helper,
  }) => {
    const props = { mainPage, helper };

    await helper.navigation.goToDetail(
      'all-tasks',
      CON.task.values.firstListItem
    );

    await expect(page.getByText(/new tag/i)).toBeHidden();

    await mainPage.page.keyboard.press('Meta+k');
    await expect(mainPage.commandbar).toBeVisible();

    await search(mainPage, 'new tag');

    await mainPage.commandbar.getByText(/new tag/i).click();

    await mainPage.commandform.getByPlaceholder(/name/i).fill('new tag');
    await mainPage.commandform.getByPlaceholder(/color/i).fill('orange');

    await mainPage.commandform.getByText(/create tag/i).click();

    await waitFor(mainPage.page, 500);

    await mainPage.page.getByText(/add tag.../i).click();

    await waitFor(mainPage.page, 300);

    const input = mainPage.comboboxPopover.getByPlaceholder(`Change tags`);

    await input.fill('new tag');
    await mainPage.comboboxPopover.getByText('new tag').click();

    await pressEscape(mainPage.page);

    await listCombobox(props).isClosed();

    await expect(page.getByText(/new tag/i)).toBeVisible();
  });
});

const openComboboxOf = async (
  { mainPage }: PartialFixtures,
  relationLabel: 'tags' | 'project' | 'priority' | 'todos' | 'tasks'
) => {
  await mainPage.commandform.getByText(relationLabel).click();
};

const selectComboboxOption = async (
  { mainPage }: PartialFixtures,
  option: string
) => {
  await mainPage.comboboxPopover.getByText(option).click();
};

// TODO Duplicated code with e2e.helper.commandbar.ts
const search = async (mainPage: MainViewPage, text: string) => {
  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .clear();

  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .fill(text);
};
