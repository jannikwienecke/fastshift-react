import { CON } from './helpers';
import { isDev } from './helpers/e2e.helper';
import { listFilter } from './helpers/e2e.helper.filter';
import { listCombobox } from './helpers/e2e.helper.list-combobox';
import { expect, PartialFixtures, test } from './fixtures';

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase();
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

const FILTER_PROJECT = 'project';

test.describe('List Filter / Combobox Test', () => {
  test('can filter task list by project and update a task so that the task is not visible', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToListView('task');

    const { filterByWithOptions } = listFilter(props);

    await filterByWithOptions(
      props,
      FILTER_PROJECT,
      CON.project.values.websiteRedesign
    );

    const { openListCombobox } = listCombobox(props);

    const firstListItem = await helper.list.getFirstListItem();

    const textContentBefore = await firstListItem.locator.first().textContent();

    await openListCombobox(
      firstListItem.locator,
      CON.project.values.websiteRedesign
    );

    await mainPage.comboboxPopover
      .getByText(CON.project.values.fitnessPlan)
      .click();

    const textContent = await firstListItem.locator.first().textContent();

    expect(textContent).toContain(CON.project.values.websiteRedesign);

    expect(textContent).not.toEqual(textContentBefore);
  });

  test('changing the project of a task in sub list of a project, removes the task from the list', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const { openListCombobox } = listCombobox(props);

    const firstListItem = await helper.list.getFirstListItem();

    const textContentBefore = await firstListItem.locator.first().textContent();

    await openListCombobox(
      firstListItem.locator,
      CON.project.values.websiteRedesign
    );

    await mainPage.comboboxPopover
      .getByText(CON.project.values.fitnessPlan)
      .click();

    const textContent = await firstListItem.locator.first().textContent();

    expect(textContent).not.toEqual(textContentBefore);
  });
});
