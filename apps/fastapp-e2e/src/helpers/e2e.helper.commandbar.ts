import { expect } from '@playwright/test';
import { MainViewPage } from '../view-pom';
import { PartialFixtures } from '../fixtures';
import { CON } from './e2e.helper.constants';

const openCommandbar = async ({ mainPage, helper }: PartialFixtures) => {
  const firstListItem = await helper.list.getFirstListItem();
  await firstListItem.locator
    .getByText(CON.project.values.websiteRedesign)
    .click();

  await mainPage.page.keyboard.press('Meta+k');
  await expect(mainPage.commandbar).toBeVisible();
};

const search = async (mainPage: MainViewPage, text: string) => {
  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .clear();

  await mainPage.commandbar
    .getByPlaceholder(/type a command or search/i)
    .fill(text);
};

const hasText = async (
  mainPage: MainViewPage,
  text: string,
  isVisible?: boolean
) => {
  if (isVisible || isVisible === undefined) {
    await expect(mainPage.commandbar.getByText(text)).toBeVisible();
  } else {
    await expect(mainPage.commandbar.getByText(text)).toBeHidden();
  }
};

export const commandbar = {
  hasText,
  search,
  openCommandbar,
};
