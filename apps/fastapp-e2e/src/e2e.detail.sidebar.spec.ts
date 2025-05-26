import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';
import { listCombobox } from './helpers/e2e.helper.list-combobox';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('Detail Page Form Test', () => {
  test('Can update owner and category ', async ({
    mainPage: mainPage,
    helper,
  }) => {
    await helper.navigation.goToDetail(
      'all-projects',
      CON.project.values.websiteRedesign
    );

    const page = mainPage.page;
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage: mainPage,
      helper,
    };

    await mainPage.page.getByText(CON.owner.values.johnDoe).click();

    const { searchInCombobox, pickOptionInCombobox, isClosed } =
      listCombobox(props);

    await searchInCombobox('owner', CON.owner.values.janeSmith);

    await pickOptionInCombobox(CON.owner.values.janeSmith);

    await isClosed();

    await mainPage.page.getByText(CON.category.values.work).click();

    await searchInCombobox('category', CON.category.values.personal);

    await pickOptionInCombobox(CON.category.values.personal);

    await isClosed();

    await mainPage.page.getByText('31. Dez.').click();

    await searchInCombobox('due date', CON.dueDate.values.tomorrow);

    await mainPage.comboboxPopover
      .getByText(CON.dueDate.values.tomorrow)
      .first()
      .click();

    await isClosed();

    await expect(mainPage.page.getByText(/personal/i).first()).toBeVisible();
    await expect(page.getByText(/jane smith/i).first()).toBeVisible();

    await mainPage.sidebar.getByText('projects').first().click();
    await mainPage.sidebar.getByText('all projects').first().click();

    const personalItem = (
      await helper.list.getFirstListItem()
    ).locator.getByText(CON.category.values.personal);
    await expect(personalItem).toBeVisible();
  });

  test('Can update tags in tasks detail ', async ({
    mainPage: mainPage,
    helper,
  }) => {
    await helper.navigation.goToDetail(
      'all-tasks',
      CON.task.values.designMockups
    );

    const props: PartialFixtures = {
      mainPage: mainPage,
      helper,
    };

    await mainPage.page.getByText(/add tag.../i).click();

    // we dont have any tag yet
    await expect(
      mainPage.comboboxPopover.getByLabel('combobox-checked')
    ).toBeHidden();

    const { searchInCombobox } = listCombobox(props);

    await searchInCombobox('tags', CON.tag.values.creative);

    // we select a tag.
    await mainPage.comboboxPopover
      .getByText(CON.tag.values.creative)
      .first()
      .click();

    await waitFor(mainPage.page, 500);

    // we try to deselect the tag -> will fail because we need at least one tag
    await mainPage.comboboxPopover.getByText(CON.tag.values.creative).click();

    // await to see Oops! Something went wrong
    await expect(
      mainPage.page.getByText('Oops! Something went wrong')
    ).toBeVisible();

    // expect to see an aria label    aria-label='combobox-checked'
    await expect(
      mainPage.comboboxPopover.getByLabel('combobox-checked')
    ).toBeVisible();
  });
});
