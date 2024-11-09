import { expect, test } from './fixtures';

test.beforeEach(async ({ taskPage, seedDatabase }) => {
  await seedDatabase();
  await taskPage.goto();
});

test.setTimeout(10000);

test.describe.configure({ mode: 'serial' });

test.describe('Project management', () => {
  test('Dummy Test', async ({ taskPage, page }) => {
    expect(true).toBe(true);
  });
});
