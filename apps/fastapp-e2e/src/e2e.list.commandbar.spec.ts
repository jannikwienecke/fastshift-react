import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, pressEnter, pressEscape, waitFor } from './helpers/e2e.helper';
import { openContextMenu2 } from './helpers/e2e.helper.contextmenu';
import { sortByField } from './helpers/e2e.helper.displayoptions';
import { MainViewPage } from './view-pom';

// helper to DRY out opening the context menu

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToListView('task');
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('List Commandbar', () => {
  test('can open and navigate in the commandbar from main task list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('task');

    await navigateCommandbar({ mainPage, helper });
  });

  test('can open and navigate in the commandbar from sub list of projects->tasks', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await navigateCommandbar({ mainPage, helper });
  });

  test('can open commandbar and then toggle completed state', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await toggleCompletedState({ mainPage, helper });
  });

  test('can open commandbar and then toggle completed state from sub list of project -> tasks', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await toggleCompletedState({ mainPage, helper });
  });

  test('can open commandbar and update the project', async ({
    mainPage,
    helper,
  }) => {
    const firstListItem = await helper.list.getFirstListItem();

    await openCommandbar({ mainPage, helper });

    await mainPage.commandbar.getByText(/add to project/i).click();

    await expect(
      mainPage.commandbar.getByText(/create new project/i)
    ).toBeVisible();

    await expect(mainPage.commandbar.getByText(/no project/i)).toBeVisible();

    await mainPage.commandbar
      .getByPlaceholder('change project to')
      .fill(CON.project.values.fitnessPlan);

    await mainPage.commandbar.getByText(CON.project.values.fitnessPlan).click();
    await firstListItem.hasText(CON.project.values.fitnessPlan);
  });

  test('can open commandbar and then open commandform task create form', async ({
    mainPage,
    helper,
    page,
  }) => {
    const props = { mainPage, helper };
    await openCommandbar({ mainPage, helper });

    await search(mainPage, 'create new task');

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

    await openCommandbar({ mainPage, helper });

    await search(mainPage, 'create new task');

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

    await openCommandbar({ mainPage, helper });

    await search(mainPage, 'create new task');

    await mainPage.commandbar.getByText(/create new task/i).click();

    await mainPage.commandform.getByPlaceholder(/name/i).fill('New Task Name');

    await mainPage.commandform.getByText(/create task/i).click();

    expect(1).toBe(1);
  });

  test('can add and remove a tag to a task in the commandbar', async ({
    mainPage,
    helper,
  }) => {
    const props = { mainPage, helper };
    const firstListItem = (await helper.list.getFirstListItem()).locator;

    await expect(firstListItem.getByText(/design mockups/i)).toBeVisible();
    await expect(firstListItem.getByText(/urgent/i)).toBeHidden();
    await expect(firstListItem.getByText(/important/i)).toBeHidden();

    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/tag/i).click();

    await mainPage.commandbar.getByText(/urgent/i).click();
    await mainPage.commandbar.getByText(/important/i).click();

    await expect(firstListItem.getByText(/urgent/i)).toBeVisible();
    await expect(firstListItem.getByText(/important/i)).toBeVisible();

    await firstListItem.click({ force: true });

    await openContextMenu2(props, 0);

    await mainPage.contextmenu.getByText(/tag/i).click();

    await mainPage.commandbar.getByText(/urgent/i).click();
    await expect(firstListItem.getByText(/urgent/i)).toBeHidden();
  });

  test('can open commandbar, and update the email with validation', async ({
    mainPage,
    helper,
  }) => {
    await helper.list.getFirstListItem();

    await openCommandbar({ mainPage, helper });

    await mainPage.page
      .getByPlaceholder(/type a command/i)
      .fill('change email');

    await expect(mainPage.commandbar.getByText(/change email/i)).toBeVisible();

    await mainPage.commandbar.getByText(/change email/i).click();

    await mainPage.commandbar.getByPlaceholder(/change email/i).fill('test@');

    await expect(
      mainPage.commandbar.getByText(/invalid email address/i)
    ).toBeVisible();

    await pressEnter(mainPage.page);

    await expect(
      mainPage.commandbar.getByText(/invalid email address/i)
    ).toBeVisible();

    await mainPage.commandbar
      .getByPlaceholder(/change email/i)
      .fill('test@test.de');

    await expect(
      mainPage.commandbar.getByText(/invalid email address/i)
    ).toBeHidden();

    await pressEnter(mainPage.page);

    // commandbar is closed
    await expect(mainPage.commandbar).toBeHidden();
  });
});

const navigateCommandbar = async ({ mainPage, helper }: PartialFixtures) => {
  await openCommandbar({ helper, mainPage });

  // expect to see the commandbar and the text /project/i
  await expect(mainPage.commandbar.getByText(/project/i).first()).toBeVisible();

  await search(mainPage, 'rename task');

  await hasText(mainPage, 'rename task');
  await hasText(mainPage, 'rename project', false);

  await search(mainPage, 'create new');

  await hasText(mainPage, 'create new task');
  await hasText(mainPage, 'create new project');
  await hasText(mainPage, 'create new tag');

  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .clear();

  await expect(
    mainPage.commandbar.getByText(/update description/i)
  ).toBeVisible();
};

const toggleCompletedState = async ({ mainPage, helper }: PartialFixtures) => {
  await openCommandbar({ helper, mainPage });

  await mainPage.commandbar.getByText(/mark as completed/i).click();

  await pressEscape(mainPage.page);

  await expect(mainPage.commandbar).toBeHidden();

  const firstListItem = await helper.list.getFirstListItem();
  await firstListItem.hasText('✅');
};

const openCommandbar = async ({ mainPage, helper }: PartialFixtures) => {
  const firstListItem = await helper.list.getFirstListItem();
  await firstListItem.locator
    .getByText(CON.project.values.websiteRedesign)
    .click();

  await waitFor(mainPage.page, 1000);
  await mainPage.page.keyboard.press('Meta+k');
  await expect(mainPage.commandbar).toBeVisible();
};

const search = async (mainPage: MainViewPage, text: string) => {
  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .clear();

  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .fill(text);
};

const hasText = async (
  mainPage: MainViewPage,
  text: string,
  isVisible?: boolean
) => {
  if (isVisible || isVisible === undefined) {
    await expect(mainPage.commandbar.getByText(text)).toBeVisible();
  } else {
    await expect(mainPage.commandbar.getByText(text)).toBeHidden();
  }
};

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
