import { PartialFixtures } from '../fixtures';
import { pressEscape } from './e2e.helper';
import { CON } from './e2e.helper.constants';
import { expect } from '@playwright/test';

export const listFilter = ({ mainPage }: PartialFixtures) => {
  const filterByName = async (
    { mainPage, helper }: PartialFixtures,
    name: string
  ) => {
    const { open, searchFor, selectFilterOption, enterStringFilter } =
      listFilter({ mainPage, helper });

    await open();
    await searchFor(CON.filter.options.name);
    await selectFilterOption(CON.filter.options.name);
    await enterStringFilter(name);
  };

  const filterByWithOptions = async (
    { mainPage, helper }: PartialFixtures,
    filterName: string,
    name: string | string[],
    notVisibleName?: string
  ) => {
    const { open, searchFor, selectFilterOption } = listFilter({
      mainPage,
      helper,
    });

    await open();
    await searchFor(filterName);
    await selectFilterOption(filterName);

    if (typeof name === 'string') {
      await mainPage.comboboxPopover.getByText(name).first().click();
      await expect(mainPage.page.getByText(name).first()).toBeVisible();
    } else if (Array.isArray(name)) {
      for (const n of name) {
        await mainPage.comboboxPopover.getByText(n).click();
        await expect(mainPage.page.getByText(n).first()).toBeVisible();
      }
    }

    await pressEscape(mainPage.page);

    if (notVisibleName) {
      await expect(mainPage.list.getByText(notVisibleName)).toBeHidden();
    }
  };

  const filterByDate = async (
    { mainPage, helper }: PartialFixtures,
    filterName: string,
    name: string
  ) => {
    const { open, searchFor, selectFilterOption } = listFilter({
      mainPage,
      helper,
    });

    await open();
    await searchFor(filterName);
    await selectFilterOption(filterName);

    await mainPage.comboboxPopover.getByText(name).click();

    await mainPage.page.keyboard.press('Escape');
  };

  const open = async () => {
    await mainPage.filterButton.click();
  };

  const searchFor = async (name: string) => {
    await mainPage.comboboxPopover.getByPlaceholder(/filter by/i).fill(name);
  };

  const selectFilterOption = async (option: string) => {
    await mainPage.comboboxPopover.getByText(option).click();
  };

  const enterStringFilter = async (string: string) => {
    await mainPage.page.getByPlaceholder(/name/i).fill(string);
    await mainPage.page.getByRole('button', { name: /save changes/i }).click();
  };

  const getFilterItemBy = (name: string) => {
    const locator = mainPage.page.getByTestId(`filter-item-${name}`);

    return locator;
  };

  const removeFilter = async (name: string) => {
    await mainPage.page.getByTestId(`remove-filter-${name}`).click();
  };

  return {
    open,
    selectFilterOption,
    searchFor,
    enterStringFilter,
    getFilterItemBy,
    removeFilter,
    filterByWithOptions,
    filterByName,
    filterByDate,
  };
};
