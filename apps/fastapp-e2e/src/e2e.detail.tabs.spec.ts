import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev, pressEnter, pressEscape, waitFor } from './helpers/e2e.helper';
import { listCombobox } from './helpers/e2e.helper.list-combobox';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();
  await helper.navigation.goToDetail(
    'all-projects',
    CON.project.values.websiteRedesign
  );
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

test.describe('Detail Tabs', () => {
  test('can see and navigate between tabs on project detail page', async ({
    mainPage: mainPage,
    page,
    helper,
  }) => {
    await expect(mainPage.detailTabs).toBeVisible();

    await expect(mainPage.detailTabs.getByText(/color/i)).toBeHidden();
    await mainPage.detailTabs.getByText(/category/i).click();
    await expect(mainPage.detailTabs.getByText(/color/i)).toBeVisible();
    await mainPage.detailTabs.getByText(/owner/i).click();
    await expect(mainPage.detailTabs.getByText(/color/i)).toBeHidden();
    await expect(mainPage.detailTabs.getByText(/first name/i)).toBeVisible();
  });

  test('can see detail tabs when navigating through detail sub list page', async ({
    mainPage,
    helper,
  }) => {
    expect(1).toBe(1);

    await mainPage.detailHeader.getByText(/tasks/i).click({ force: true });

    // go to detail page of a task item and see the detail tabs of project
    await (await helper.list.getFirstListItem()).locator
      .getByText(CON.task.values.firstListItem)
      .click();

    await expect(mainPage.detailTabs).toBeVisible();
    await mainPage.detailTabs.getByText(/project/i).click();

    await expect(mainPage.detailTabs.getByText(/label/i)).toBeVisible();
    await expect(mainPage.detailTabs.getByText(/desc/i)).toBeVisible();
    await expect(mainPage.detailTabs.getByText(/owner/i)).toBeVisible();
  });

  test('can update projects owner in detail tabs ', async ({
    mainPage: mainPage,
    helper,
  }) => {
    await expect(mainPage.detailTabs).toBeVisible();

    await mainPage.detailTabs.getByText(/owner/i).click();

    await mainPage.detailTabs
      .getByPlaceholder(/first name/i)
      .fill('NEW FIRST NAME');

    await mainPage.detailTabs
      .getByPlaceholder(/last name/i)
      .fill('NEW LAST NAME');

    await mainPage.detailTabs.getByText(CON.user.values.johnDoe).click();

    const { searchInCombobox, pickOptionInCombobox } = listCombobox({
      mainPage,
      helper,
    });

    await searchInCombobox('user', CON.user.values.janeSmith);

    await waitFor(mainPage.page, 500);

    await pickOptionInCombobox(CON.user.values.janeSmith);

    await pressEscape(mainPage.page);

    await waitFor(mainPage.page, 500);

    await mainPage.page.reload();

    await expect(mainPage.detailTabs).toBeVisible();
    await mainPage.detailTabs.getByText(/owner/i).click();

    await expect(
      mainPage.detailTabs.getByPlaceholder(/first name/i)
    ).toHaveValue('NEW FIRST NAME');
    await expect(
      mainPage.detailTabs.getByPlaceholder(/last name/i)
    ).toHaveValue('NEW LAST NAME');

    await expect(
      mainPage.detailTabs.getByText(CON.user.values.janeSmith)
    ).toBeVisible();
  });

  test('tab activity works correctly ', async ({
    mainPage: mainPage,
    helper,
  }) => {
    await expect(mainPage.detailTabs).toBeVisible();

    await helper.navigation.goToDetail(
      'all-tasks',
      CON.task.values.designMockups
    );

    await mainPage.detailTabs.getByText(/Acitivty/i).click();

    await mainPage.page.getByPlaceholder(/name/i).fill('NEW NAME');
    await pressEnter(mainPage.page);

    await expect(mainPage.detailTabs.getByText(/new name/i)).toBeVisible();

    await mainPage.page.getByText(/add tag/i).click();
    await mainPage.comboboxPopover.getByText(/urgent/i).click();
    await pressEscape(mainPage.page);

    await expect(mainPage.detailTabs.getByText(/urgent/i)).toBeVisible();

    await mainPage.detailProperties.getByText(/urgent/i).click();
    await mainPage.comboboxPopover.getByText(/important/i).click();
    await pressEscape(mainPage.page);

    await expect(
      mainPage.detailTabs.getByText(/important and urgent/i)
    ).toBeVisible();
  });
});
