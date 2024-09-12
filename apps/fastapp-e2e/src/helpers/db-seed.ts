import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../packages/convex/convex/_generated/api';

export async function seedDatabase() {
  // const CONVEX_URL = process.env.VITE_CONVEX_URL;
  const CONVEX_URL = 'https://deafening-marmot-647.convex.cloud';
  if (!CONVEX_URL) {
    throw new Error('VITE_CONVEX_URL is not set');
  }

  const convex = new ConvexHttpClient(CONVEX_URL);

  try {
    await convex.mutation(api.init.default);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
