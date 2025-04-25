import { Locator } from '@playwright/test';
import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { waitFor } from './helpers/e2e.helper';

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase();
});

test.setTimeout(20000);

test.describe.configure({ mode: 'serial' });

test.describe('List Combobox', () => {
  test('can change the project of a task using the combobox in main list', async ({
    mainPage: taskPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage: taskPage,
      helper,
    };

    await helper.navigation.goToListView('task');

    const list = helper.list;

    const firstListItem = await list.getListItem(0);
    const { openListCombobox, searchInCombobox } = listCombobox(props);

    await openListCombobox(
      firstListItem.locator,
      CON.project.values.websiteRedesign
    );
    await searchInCombobox(
      'project',
      CON.project.values.fitnessPlan,
      CON.project.values.websiteRedesign
    );

    await taskPage.comboboxPopover
      .getByText(CON.project.values.fitnessPlan)
      .click();

    await firstListItem.hasText(CON.project.values.fitnessPlan);
  });

  test('can change the project of a task using the combobox in sub list', async ({
    mainPage: taskPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = { mainPage: taskPage, helper };

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const list = helper.list;

    const firstListItem = await list.getFirstListItem();

    const { openListCombobox, searchInCombobox } = listCombobox(props);

    await list.hasLSizeOf(3);

    await openListCombobox(
      firstListItem.locator,
      CON.project.values.websiteRedesign
    );

    await searchInCombobox(
      'project',
      CON.project.values.fitnessPlan,
      CON.project.values.websiteRedesign
    );

    await taskPage.comboboxPopover
      .getByText(CON.project.values.fitnessPlan)
      .click();

    await list.hasLSizeOf(2, 750);
  });

  test('Can add and remove tags from a task in main list', async ({
    mainPage,
    page,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('task');

    await selectAndDeselectTag({ mainPage, helper });
  });

  test('Can add and remove tags from a task in sub list', async ({
    mainPage,
    page,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await selectAndDeselectTag({ mainPage, helper });
  });

  test('can change the priority of a task in main list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);
    await helper.navigation.goToListView('task');

    await selectPriority({ mainPage, helper });
  });

  test('can change the priority of a task in sub list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);
    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await selectPriority({ mainPage, helper });
  });

  test('can change the completed status of a task in main list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('task');

    await selectCompletedStatus({ mainPage, helper });
  });

  test('can change the completed status of a task in sub list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await selectCompletedStatus({ mainPage, helper });
  });
});

const selectCompletedStatus = async ({ mainPage, helper }: PartialFixtures) => {
  const firstListItem = await helper.list.getFirstListItem();
  await firstListItem.hasText('❌');

  const { openListCombobox, pickOptionInCombobox } = listCombobox({
    mainPage,
    helper,
  });

  await openListCombobox(firstListItem.locator, '❌');

  await pickOptionInCombobox('✅');

  await firstListItem.hasText('✅');
};

const selectPriority = async ({ mainPage, helper }) => {
  const firstListItem = await helper.list.getFirstListItem();
  await firstListItem.hasTestId(CON.priority.testId.none);

  const { openListComboboxWithTestId, pickOptionInCombobox } = listCombobox({
    mainPage,
    helper,
  });

  await openListComboboxWithTestId(
    firstListItem.locator,
    CON.priority.testId.none
  );

  await pickOptionInCombobox(CON.priority.values.urgent);

  await firstListItem.hasTestId(CON.priority.testId.urgent);
};

const selectAndDeselectTag = async ({ helper, mainPage }: PartialFixtures) => {
  const listItem = await helper.list.getListItem(2);

  await listItem.hasText(CON.tag.values.longTerm);
  await listItem.hasNoText(CON.tag.values.creative);

  const {
    openListCombobox,
    searchInCombobox,
    selectInCombobox,
    isHidden,
    isVisible,
    isClosed,
  } = listCombobox({ mainPage, helper });

  await openListCombobox(listItem.locator, CON.tag.values.longTerm);

  await selectInCombobox(CON.tag.values.planning);

  await waitFor(mainPage.page, 200);

  await selectInCombobox(CON.tag.values.longTerm);

  await searchInCombobox('tag', CON.tag.values.creative);

  await isVisible(CON.tag.values.creative);
  await isHidden(CON.tag.values.planning);

  await selectInCombobox(CON.tag.values.creative);

  await listItem.locator
    .getByText(CON.tag.values.creative)
    .first()
    .click({ force: true });

  await isClosed();

  await listItem.hasText(CON.tag.values.creative);
};

const listCombobox = ({ mainPage: taskPage }: PartialFixtures) => {
  const openListCombobox = async (listItem: Locator, name: string) => {
    await listItem.getByText(name).first().click({ force: true });

    await taskPage.comboboxPopover.waitFor({ state: 'visible' });

    await expect(taskPage.comboboxPopover.getByText(name)).toBeVisible();
  };

  const openListComboboxWithTestId = async (
    listItem: Locator,
    testId: string
  ) => {
    await listItem.getByTestId(testId).first().click({ force: true });

    await taskPage.comboboxPopover.waitFor({ state: 'visible' });

    await expect(taskPage.comboboxPopover.getByTestId(testId)).toBeVisible();
  };

  const searchInCombobox = async (
    model: string,
    value: string,
    hiddenValue?: string
  ) => {
    const input = taskPage.comboboxPopover.getByPlaceholder(`Change ${model}`);

    await input.fill(value);

    await expect(taskPage.comboboxPopover.getByText(value)).toBeVisible();
    if (hiddenValue) {
      await expect(
        taskPage.comboboxPopover.getByText(hiddenValue)
      ).toBeHidden();
    }
  };

  const pickOptionInCombobox = async (value: string) => {
    await taskPage.comboboxPopover.getByText(value).click();
    await expect(taskPage.comboboxPopover).toBeHidden();
  };

  const selectInCombobox = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await item.locator('../../../..').getByRole('checkbox').first().click();
  };

  const isVisible = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await expect(item).toBeVisible();
  };

  const isHidden = async (value: string) => {
    const item = taskPage.comboboxPopover.getByText(value);
    await expect(item).toBeHidden();
  };

  const isClosed = async () => {
    await expect(taskPage.comboboxPopover).toBeHidden();
  };

  return {
    openListCombobox,
    openListComboboxWithTestId,
    searchInCombobox,
    pickOptionInCombobox,
    selectInCombobox,
    isVisible,
    isHidden,
    isClosed,
  };
};
