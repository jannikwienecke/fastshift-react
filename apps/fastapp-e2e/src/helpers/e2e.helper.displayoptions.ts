import { expect } from '@playwright/test';
import { MainViewPage } from '../view-pom';

export const sortByField = async (
  taskPage: MainViewPage,
  name: RegExp,
  query?: string
) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No sorting/i).click();

  if (query)
    await taskPage.comboboxPopover.getByPlaceholder(/filter by/i).fill(query);

  await taskPage.comboboxPopover.getByText(name).click();
};

export const groupByField = async (taskPage: MainViewPage, name: RegExp) => {
  await taskPage.displayOptionsButton.click();

  await expect(taskPage.displayOptions).toBeVisible();

  await taskPage.displayOptions.getByText(/No grouping/i).click();

  await taskPage.comboboxPopover.getByText(name).click();
};
