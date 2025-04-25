import { Page } from '@playwright/test';

export const waitFor = async (page: Page, duration: number) => {
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(duration);
};
