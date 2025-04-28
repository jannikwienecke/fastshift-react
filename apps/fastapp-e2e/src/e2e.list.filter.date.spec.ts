import { expect, test } from './fixtures';
import { CON } from './helpers';
import { isDev } from './helpers/e2e.helper';

test.beforeEach(async ({ seedDatabase }) => {
  await seedDatabase();
});

test.setTimeout(isDev() ? 20000 : 10000);

test.describe.configure({ mode: 'serial' });

// const FILTER_DATE = 'due date';

test.describe('List Filter Date Tests', () => {
  test('can filter tasks by due date', async ({ mainPage, page, helper }) => {
    const list = helper.list;

    await helper.navigation.goToDetailSubList(
      'my-projects',
      CON.project.values.websiteRedesign,
      'Tasks'
    );

    const listItem = await list.getFirstListItem();
    const listItem2 = await list.getListItem(1);
    // before filter -> this is our first list item
    await expect(listItem.locator.getByText(/design mockups/i)).toBeVisible();

    await mainPage.openFilter(/due date/i);
    await mainPage.comboboxPopover.getByText(/today/i).click();
    await mainPage.expectToSeeFilter(/due Date/i, 'is', 'today');

    // after filter -> this is our first list item
    await expect(listItem.locator.getByText(/develop frontend/i)).toBeVisible();
    await expect(
      listItem2.locator.getByText(/implement responsive design/i)
    ).toBeVisible();

    // now we change the filter from is -> is not
    await mainPage.filterList.getByText(/is/i).click();
    await mainPage.comboboxPopover.getByText(/is not/i).click();
    await mainPage.expectToSeeFilter(/due Date/i, 'is not', 'today');
    await expect(listItem.locator.getByText(/design mockups/i)).toBeVisible();

    // after remove filter -> this is our first list item again
    await expect(listItem.locator.getByText(/design mockups/i)).toBeVisible();

    await mainPage.openFilter(/due date/i);
    await mainPage.comboboxPopover.getByText(/this month/i).click();
    await mainPage.expectToSeeFilter(/due date/i, 'within', 'this month');

    await page.getByText(/this month/i).click();
    await mainPage.filterAndSelect('3 week', /3 weeks from now/i);
    await mainPage.expectToSeeFilter(/due date/i, 'before', '3 weeks from now');

    await mainPage.openFilter(/due date/i);
    await mainPage.filterAndSelect('no date', /no date defined/i);
    await mainPage.expectToSeeFilter(/due date/i, 'is', /no date defined/i);

    await mainPage.filterBySpecificDate(new Date().getDate().toString());

    await mainPage.removeFilter('dueDate');
  });

  test('can query filter dates correctly', async ({
    mainPage,
    page,
    helper,
  }) => {
    await helper.navigation.goToListView('task');

    await mainPage.openFilter(/due Date/i);
    const input = page.getByPlaceholder(/filter/i);

    const getByText = (l: RegExp) => mainPage.comboboxPopover.getByText(l);

    // TODO HIER WEITER MACHEN -> WRONG FILTER VALUES
    await input.fill('week');
    await expect(getByText(/this week/i)).toBeVisible();
    await expect(getByText(/last week/i)).toBeVisible();
    await expect(getByText(/one week from now/i)).toBeVisible();
    await expect(getByText(/one week ago/i)).toBeVisible();

    await input.fill('week 3');
    await expect(getByText(/3 weeks from now/i)).toBeVisible();
    await expect(getByText(/3 weeks ago/i)).toBeVisible();

    await input.fill('month');
    await expect(getByText(/this month/i)).toBeVisible();
    await expect(getByText(/last month/i)).toBeVisible();
    await expect(getByText(/one month from now/i)).toBeVisible();
    await expect(getByText(/one month ago/i)).toBeVisible();

    await input.fill('year');
    await expect(getByText(/this year/i)).toBeVisible();
    await expect(getByText(/last year/i)).toBeVisible();

    await input.fill('from now 12');
    await expect(getByText(/12 days from now/i)).toBeVisible();
    await expect(getByText(/12 weeks from now/i)).toBeVisible();
    await expect(getByText(/12 months from now/i)).toBeVisible();

    await input.fill('2024');
    await expect(getByText(/2024/i).first()).toBeVisible();
    await expect(getByText(/january 2024/i)).toBeVisible();
    await expect(getByText(/march 2024/i)).toBeVisible();
    await expect(getByText(/december 2024/i)).toBeVisible();

    await input.fill('2024 aug');
    await expect(getByText(/2024/i).first()).toBeVisible();
    await expect(getByText(/august 2024/i)).toBeVisible();

    await input.fill('august');
    const year = new Date().getFullYear();
    await expect(page.getByText(`august ${year}`)).toBeVisible();
    await expect(page.getByText(`august ${year - 1}`)).toBeVisible();
    await expect(page.getByText(`august ${year + 1}`)).toBeVisible();
    await expect(page.getByText(`august ${year + 2}`)).toBeVisible();

    await input.fill('today');
    await expect(getByText(/today/i)).toBeVisible();
  });

  test('can search for the date filter in the list item edit combobox', async ({
    mainPage,
    helper,
  }) => {
    await helper.navigation.goToListView('task');

    await mainPage.openFilter(/due Date/i);
    await mainPage.comboboxPopover.getByText(/today/i).click();

    const firstListItem = await mainPage.getListItem(0);
    const tommorow = new Date();
    tommorow.setDate(tommorow.getDate());
    const day = tommorow.getDate();
    const day2DigitsTommorow = day.toString().padStart(2, '0');
    await firstListItem.getByText(day2DigitsTommorow).click();

    await mainPage.comboboxPopover.getByPlaceholder(/change/i).fill('3 day');
    await expect(
      mainPage.comboboxPopover.getByText(/3 days from now/i)
    ).toBeVisible();

    await mainPage.comboboxPopover.getByPlaceholder(/change/i).fill('day');
    await expect(mainPage.comboboxPopover.getByText(/one/i)).toBeVisible();
    await expect(mainPage.comboboxPopover.getByText(/2 days/i)).toBeVisible();
    await expect(mainPage.comboboxPopover.getByText(/3 days/i)).toBeVisible();

    await mainPage.comboboxPopover.getByPlaceholder(/change/i).fill('in 2');
    await expect(mainPage.comboboxPopover.getByText(/2 days/i)).toBeVisible();
    await expect(mainPage.comboboxPopover.getByText(/2 weeks/i)).toBeVisible();

    await mainPage.comboboxPopover.getByPlaceholder(/change/i).fill('no');
    await expect(mainPage.comboboxPopover.getByText(/no date/i)).toBeVisible();

    await mainPage.comboboxPopover.getByPlaceholder(/change/i).fill('today');
    await expect(mainPage.comboboxPopover.getByText(/one day/i)).toBeHidden();
  });
});
