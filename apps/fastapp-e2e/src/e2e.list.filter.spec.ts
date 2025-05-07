import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, pressEscape, waitFor } from './helpers/e2e.helper';
import { listFilter } from './helpers/e2e.helper.filter';

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase();
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('List Filter Tests', () => {
  test('can filter task list by differnt filters', async ({
    mainPage: mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage: mainPage,
      helper,
    };

    await helper.navigation.goToListView('all-tasks');

    const { removeFilter, filterByWithOptions, filterByName, filterByDate } =
      listFilter(props);

    await filterByWithOptions(
      props,
      CON.filter.options.completed,
      'Not Completed'
    );

    await removeFilter('completed');

    await filterByWithOptions(
      props,
      CON.filter.options.project,
      CON.project.values.fitnessPlan,
      CON.project.values.websiteRedesign
    );
    await removeFilter(CON.filter.options.project + 's');

    await filterByName(props, CON.task.values.designMockups);
    await removeFilter(CON.filter.options.name);

    await filterByWithOptions(
      props,
      CON.filter.options.tag,
      [CON.tag.values.planning, CON.tag.values.longTerm],
      CON.tag.values.creative
    );
    await removeFilter(CON.filter.options.tag + 's');

    await filterByWithOptions(
      props,
      CON.filter.options.priority,
      CON.priority.values.urgent,
      CON.priority.values.none
    );
    await removeFilter(CON.filter.options.priority);

    await filterByDate(props, CON.filter.options.date, 'Today');
  });

  test('can filter task list by tag and open filter, update it and change operator ', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToListView('all-tasks');

    const { getFilterItemBy, selectFilterOption, filterByWithOptions } =
      listFilter(props);

    await filterByWithOptions(
      props,
      CON.filter.options.tag,
      [CON.tag.values.planning, CON.tag.values.longTerm],
      CON.tag.values.creative
    );

    let filterItem = getFilterItemBy(CON.filter.options.tag + 's');

    await filterItem.getByText(/2 tags/i).click();

    await selectFilterOption(CON.tag.values.creative);
    await pressEscape(mainPage.page);

    filterItem = getFilterItemBy(CON.filter.options.tag + 's');
    await filterItem.getByText(/is any of/i).click();
    await selectFilterOption('is not any of');

    await expect(mainPage.page.getByText(CON.tag.values.creative)).toBeHidden();
    await expect(mainPage.page.getByText(CON.tag.values.longTerm)).toBeHidden();
  });

  test('can filter task list by tag and open filter, update it and change operator in sub projects task list ', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );
    const { getFilterItemBy, selectFilterOption, filterByWithOptions } =
      listFilter(props);

    await filterByWithOptions(
      props,
      CON.filter.options.tag,
      [CON.tag.values.planning, CON.tag.values.longTerm],
      CON.tag.values.creative
    );

    let filterItem = getFilterItemBy(CON.filter.options.tag + 's');

    await filterItem.getByText(/2 tags/i).click();

    await pressEscape(mainPage.page);

    await expect(
      mainPage.page.getByText(CON.tag.values.longTerm)
    ).toBeVisible();

    filterItem = getFilterItemBy(CON.filter.options.tag + 's');
    await filterItem.getByText(/is any of/i).click();
    await selectFilterOption('is not any of');

    await expect(mainPage.page.getByText(CON.tag.values.creative)).toBeHidden();
    await expect(mainPage.page.getByText(CON.tag.values.planning)).toBeHidden();
    await expect(mainPage.page.getByText(CON.tag.values.longTerm)).toBeHidden();
  });

  test('can filter task list by tag AND Project ', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToListView('all-tasks');

    const { getFilterItemBy, filterByWithOptions } = listFilter(props);

    await filterByWithOptions(
      props,
      CON.filter.options.tag,
      CON.tag.values.planning,
      CON.tag.values.creative
    );

    await filterByWithOptions(
      props,
      CON.filter.options.project,
      CON.project.values.fitnessPlan,
      CON.project.values.websiteRedesign
    );

    await expect(getFilterItemBy(CON.filter.options.tag + 's')).toBeVisible();
    await expect(
      getFilterItemBy(CON.filter.options.project + 's')
    ).toBeVisible();
  });

  test('can filter task list in sub list of project ', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage,
      helper,
    };

    await helper.navigation.goToDetailSubList(
      'all-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const { filterByWithOptions } = listFilter(props);

    await filterByWithOptions(
      props,
      CON.filter.options.tag,
      CON.tag.values.planning,
      CON.tag.values.creative
    );
  });

  test('can filter by learn photography (non default loaded project) ', async ({
    mainPage,
    page,
    helper,
  }) => {
    await helper.navigation.goToListView('all-tasks');

    await mainPage.openFilter(/project/i);

    await mainPage.comboboxPopover
      .getByPlaceholder(/filter by/i)
      .fill('learn photography');

    // we select a project which is not in the first 10 projects (key difference here)
    await mainPage.comboboxPopover.getByText(/learn photo/i).click();

    await mainPage.closePopover();

    await mainPage.openFilter(/project/i);

    await expect(
      mainPage.comboboxPopover.getByText(/learn photo/i)
    ).toBeVisible();

    await page.getByText(/save/i).click({ force: true });
    await page.getByText(/save/i).click();
    await page.getByText(/save to this/i).click();

    await waitFor(page, 1000);

    await page.reload();

    await mainPage.openFilter(/project/i);

    await expect(
      mainPage.comboboxPopover.getByText(/learn photo/i)
    ).toBeVisible();
  });
});
