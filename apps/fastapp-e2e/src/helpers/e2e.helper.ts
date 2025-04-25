import { Page } from '@playwright/test';

export const waitFor = async (page: Page, duration: number) => {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(duration);
};

export const pressEscape = async (page: Page) => {
  await page.keyboard.press('Escape');
};

export const isDev = () => {
  return process.env.NODE_ENV === 'development';
};
