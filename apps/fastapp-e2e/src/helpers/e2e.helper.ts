import { Page } from '@playwright/test';
import { PartialFixtures } from '../fixtures';
import { CON } from './e2e.helper.constants';

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

export const goToProjectsTask = ({ helper }: PartialFixtures) => {
  helper.navigation.goToDetailSubList(
    'my-projects',
    CON.project.values.websiteRedesign,
    'Tasks'
  );
};
