import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../packages/convex/convex/_generated/api';
import { _log } from '@apps-next/core';

export async function seedDatabase() {
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
  const CONVEX_URL =
    isGithubActions || true
      ? 'https://deafening-marmot-647.convex.cloud'
      : 'http://127.0.0.1:3210';

  if (!CONVEX_URL) {
    throw new Error('VITE_CONVEX_URL is not set');
  }

  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    await convex.mutation(api.init.default);
    _log.info('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
