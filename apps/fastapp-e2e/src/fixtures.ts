import { test as base } from '@playwright/test';
import { seedDatabase } from './helpers/db-seed';
import { TaskPage } from './task-page';
import { _log } from '@apps-next/core';

type Fixtures = {
  seedDatabase: () => Promise<void>;
  taskPage: TaskPage;
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

  taskPage: async ({ page }, use) => {
    const taskPage = new TaskPage(page);
    await use(taskPage);
  },
});

export { expect } from '@playwright/test';
