import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { waitFor } from './helpers/e2e.helper';
import { listCombobox } from './helpers/e2e.helper.list-combobox';

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase();
});

test.setTimeout(20000);

test.describe.configure({ mode: 'serial' });

test.describe('List Combobox', () => {
  test('can change the project of a task using the combobox in main list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToListView('all-tasks');

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

    await mainPage.comboboxPopover
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
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const list = helper.list;

    const firstListItem = await list.getFirstListItem();

    const { openListCombobox, searchInCombobox } = listCombobox(props);

    await list.hasListSizeOf(3);

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

    await list.hasListSizeOf(2, 750);
  });

  test('Can add and remove tags from a task in main list', async ({
    mainPage,
    page,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('all-tasks');

    await selectAndDeselectTag({ mainPage, helper });
  });

  test('Can add and remove tags from a task in sub list', async ({
    mainPage,
    page,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'all-projects',
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
    await helper.navigation.goToListView('all-tasks');

    await selectPriority({ mainPage, helper });
  });

  test('can change the priority of a task in sub list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);
    await helper.navigation.goToDetailSubList(
      'all-projects',
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

    await helper.navigation.goToListView('all-tasks');

    await selectCompletedStatus({ mainPage, helper });
  });

  test('can change the completed status of a task in sub list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    await selectCompletedStatus({ mainPage, helper });
  });

  test('can change the due date of the first task in main list and back in sub list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('all-tasks');

    const firstListItem = await helper.list.getFirstListItem();

    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate() + 1);

    const threeDaysFromNow = new Date();
    const day = tommorow.getDate();

    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const day2DigitsTommorow = day.toString().padStart(2, '0');
    const day2Digits3DaysFromNow = threeDaysFromNow
      .getDate()
      .toString()
      .padStart(2, '0');

    const { openListCombobox, pickOptionInCombobox } = listCombobox({
      mainPage,
      helper,
    });

    await openListCombobox(firstListItem.locator, day2DigitsTommorow);

    await pickOptionInCombobox('3 days from now');

    await firstListItem.hasText(day2Digits3DaysFromNow);

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const firstListItemInSubList = await helper.list.getFirstListItem();
    await firstListItemInSubList.hasText(day2Digits3DaysFromNow);

    await openListCombobox(
      firstListItemInSubList.locator,
      day2Digits3DaysFromNow
    );

    await pickOptionInCombobox('Tomorrow');

    await firstListItemInSubList.hasText(day2DigitsTommorow);
  });

  test('tasks has many todos, can add and remove todos', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await helper.navigation.goToListView('all-tasks');

    let firstListItem = await helper.list.getFirstListItem();

    const {
      openListCombobox,
      searchInCombobox,
      selectInCombobox,
      isVisible,
      isHidden,
    } = listCombobox({ mainPage, helper });

    const oneOfTwo = '1 / 2';
    const oneOfOne = '1 / 1';
    const todo1 = 'Todo 1';
    const todo2 = 'Todo 2';

    await openListCombobox(firstListItem.locator, oneOfTwo);

    await searchInCombobox('todos', '2');

    await isVisible(todo2);
    await isHidden(todo1);

    await selectInCombobox(todo2);

    await firstListItem.hasText(oneOfOne);

    await firstListItem.locator.getByText(oneOfOne).click({ force: true });

    await mainPage.page.reload();

    await waitFor(mainPage.page, 300);

    firstListItem = await helper.list.getFirstListItem();

    await waitFor(mainPage.page, 100);

    await firstListItem.hasText(oneOfOne);

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    firstListItem = await helper.list.getFirstListItem();
    await firstListItem.hasText(oneOfOne);

    await openListCombobox(firstListItem.locator, oneOfOne);

    await waitFor(mainPage.page, 300);

    await searchInCombobox('todos', '1');

    await isVisible(todo1);
    await isHidden(todo2);

    await selectInCombobox(todo1);
    await firstListItem.hasNoText(oneOfOne);
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
