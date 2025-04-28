import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';
import { listCombobox } from './helpers/e2e.helper.list-combobox';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();

  await helper.navigation.goToDetail(
    'my-projects',
    CON.project.values.websiteRedesign
  );
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('Detail Page Form Test', () => {
  test('Can update owner and category ', async ({
    mainPage: mainPage,
    helper,
  }) => {
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

    await searchInCombobox('categories', CON.category.values.personal);

    await pickOptionInCombobox(CON.category.values.personal);

    await isClosed();

    await mainPage.page.getByText('31. Dez.').click();

    await searchInCombobox('due date', CON.dueDate.values.tomorrow);

    await mainPage.comboboxPopover
      .getByText(CON.dueDate.values.tomorrow)
      .click();

    await isClosed();

    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate());
    const day = tommorow.getDate() + 1;
    const day2DigitsTommorow = day.toString().padStart(2, '0');

    await expect(page.getByText(day2DigitsTommorow).first()).toBeVisible();
    await expect(page.getByText(CON.category.values.personal)).toBeVisible();
    await expect(page.getByText(CON.owner.values.janeSmith)).toBeVisible();

    await mainPage.sidebar.getByText('projects').first().click();

    const personalItem = (
      await helper.list.getFirstListItem()
    ).locator.getByText(CON.category.values.personal);
    await expect(personalItem).toBeVisible();
  });
});
