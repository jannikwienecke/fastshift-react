import { test as base } from '@playwright/test';
// eslint-disable-next-line
import { main } from 'apps/nextjs/prisma/seed';
import { seedDatabase } from './helpers/db-seed';

type Fixtures = {
  seedDatabase: () => Promise<void>;
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
      console.log('Run: Seeding the database...');
      try {
        // await main();
        // hier
        await seedDatabase();
        console.log('Database seeded successfully');
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
});

export { expect } from '@playwright/test';
