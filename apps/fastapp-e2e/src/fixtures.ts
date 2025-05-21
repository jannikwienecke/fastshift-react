import { test as base, Browser } from '@playwright/test';
import { seedDatabase } from './helpers/db-seed';
import { MainViewPage } from './view-pom';
import { _log } from '@apps-next/core';
import { makeNavigationHelper, NavigationE2eHelper } from './helpers';
import { ListE2eHelper, makeListHelper } from './helpers/e2e.helper.list';

export type Fixtures = {
  seedDatabase: () => Promise<void>;
  mainPage: MainViewPage;
  helper: {
    navigation: NavigationE2eHelper;
    list: ListE2eHelper;
  };
};

export type PartialFixtures = {
  mainPage: MainViewPage;
  helper: {
    navigation: NavigationE2eHelper;
    list: ListE2eHelper;
  };
};

export const test = base.extend<Fixtures>({
  // Define a new fixture
  seedDatabase: [
    // eslint-disable-next-line
    async (
      // eslint-disable-next-line
      {},
      use
    ) => {
      // This will run before each test that uses this fixture
      try {
        // await main();
        // hier
        await seedDatabase();
        _log.info('Database seeded successfully');
      } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
      }

      // Use an empty function as we don't need to return anything
      await use(() => {
        return Promise.resolve();
      });

      // This will run after each test that uses this fixture
      // You can add cleanup logic here if needed
    },
    { auto: true },
  ], // Setting auto: true makes this fixture run for every test

  mainPage: async ({ page }, use) => {
    const mainPage = new MainViewPage(page);
    await use(mainPage);
  },

  helper: async ({ mainPage }, use) => {
    const listHelper = makeListHelper(mainPage);
    const navigationHelper = makeNavigationHelper(mainPage);
    await use({ list: listHelper, navigation: navigationHelper } as const);
  },
});

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('test', 'true');
  });
});

export { expect } from '@playwright/test';
