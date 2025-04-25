import { expect, Locator } from '@playwright/test';
import { MainViewPage } from '../view-pom';

export type ListE2eHelper = {
  getListItem: (index: number) => Promise<{
    locator: Locator;
    hasText: (name: string) => Promise<void>;
    hasNoText: (name: string) => Promise<void>;
  }>;
  getFirstListItem: () => Promise<{
    locator: Locator;
    hasText: (name: string) => Promise<void>;
  }>;
  hasLSizeOf: (size: number, timeout?: number) => Promise<void>;
};

export const makeListHelper = (mainPage: MainViewPage): ListE2eHelper => {
  const getListItem = async (index) => {
    const locator = mainPage.page.getByTestId('list-item').nth(index);
    return {
      locator,
      hasText: (name: string) => expect(locator.getByText(name)).toBeVisible(),
      hasNoText: (name: string) => expect(locator.getByText(name)).toBeHidden(),
    };
  };

  const getFirstListItem = async () => {
    return getListItem(0);
  };

  const hasLSizeOf = async (size: number, timeout = 300) => {
    const locator = mainPage.page.getByTestId('list-item');

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await mainPage.page.waitForTimeout(timeout);
    const count = await locator.count();

    expect(count).toBe(size);
  };

  return {
    getListItem,
    getFirstListItem,
    hasLSizeOf,
  };
};
