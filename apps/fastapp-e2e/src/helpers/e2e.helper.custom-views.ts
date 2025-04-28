import { Page } from '@playwright/test';

import { MainViewPage } from '../view-pom';

export async function saveCurrentView(
  page: Page,
  useNewView = false,
  viewDetails?: {
    name: string;
    description: string;
  }
) {
  await page.getByText(/save/i).click();

  if (useNewView) {
    await page.getByText(/create new view/i).click();
    if (viewDetails) {
      await page.getByPlaceholder(/enter view name/i).fill(viewDetails.name);
      await page
        .getByPlaceholder(/enter view description/i)
        .fill(viewDetails.description);
    }
    await page.getByRole('button', { name: 'save' }).click();
  } else {
    await page.getByText(/save to this view/i).click();
  }
}

export async function filterByProject(
  taskPage: MainViewPage,
  projectName: string
) {
  await taskPage.filterButton.click();
  await taskPage.comboboxPopover.getByText('Project').click();
  await taskPage.comboboxPopover.getByText(projectName).click();
}

export async function filterByDueDate(taskPage: MainViewPage, option: string) {
  await taskPage.filterButton.click();
  await taskPage.comboboxPopover.getByText(/due date/i).click();
  await taskPage.comboboxPopover.getByText(new RegExp(option, 'i')).click();
}
