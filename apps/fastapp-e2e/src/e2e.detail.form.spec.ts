import { expect, PartialFixtures, test } from './fixtures';
import { CON } from './helpers';
import { isDev, waitFor } from './helpers/e2e.helper';

test.beforeEach(async ({ seedDatabase, helper }) => {
  await seedDatabase();

  await helper.navigation.goToDetail(
    'all-projects',
    CON.project.values.websiteRedesign
  );
});

test.setTimeout(isDev() ? 30000 : 20000);

test.describe.configure({ mode: 'serial' });

test.describe('Detail Page Form Test', () => {
  test('Can update the project and see saved values after reload', async ({
    mainPage: mainPage,
    helper,
  }) => {
    const page = mainPage.page;
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage: mainPage,
      helper,
    };

    const newLabel = 'New Label';
    const newDescription = 'New Description';

    await helper.navigation.goToDetail(
      'all-projects',
      CON.project.values.websiteRedesign
    );

    // getby label "label"
    await updateDetailFormValue(props, 'label', newLabel);
    await updateDetailFormValue(props, 'description', newDescription);

    await waitFor(mainPage.page, 500);
    await page.reload();

    const labelText = await page.getByPlaceholder(/label/i).inputValue();
    const descriptionText = await page
      .getByPlaceholder(/description/i)
      .inputValue();

    expect(labelText).toBe(newLabel);
    expect(descriptionText).toBe(newDescription);
  });

  test('Can update the project and see updated value in list view', async ({
    mainPage: mainPage,
    helper,
  }) => {
    const page = mainPage.page;
    expect(1).toBe(1);

    const props: PartialFixtures = {
      mainPage: mainPage,
      helper,
    };

    const newLabel = 'New Label';
    const newDescription = 'New Description';

    await helper.navigation.goToDetail(
      'all-projects',
      CON.project.values.websiteRedesign
    );

    // getby label "label"
    await updateDetailFormValue(props, 'label', newLabel);
    await updateDetailFormValue(props, 'description', newDescription);

    await mainPage.sidebar
      .getByText(/projects/i)
      .first()
      .click();

    await mainPage.sidebar
      .getByText(/all projects/i)
      .first()
      .click();

    await expect((await helper.list.getFirstListItem()).locator).toBeVisible();

    await expect(page.getByText(newLabel)).toBeVisible();
    await expect(
      page.getByText(CON.project.values.websiteRedesign)
    ).toBeHidden();
  });
});

export const updateDetailFormValue = async (
  props: PartialFixtures,
  field: string,
  value: string
) => {
  const { mainPage } = props;

  await props.mainPage.page
    .getByPlaceholder(new RegExp(field, 'i'))
    .fill(value);

  // press tab
  await mainPage.page.keyboard.press('Tab');

  // wait for the value to be updated
  await waitFor(mainPage.page, 100);
};
