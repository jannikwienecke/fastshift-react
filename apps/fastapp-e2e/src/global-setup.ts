import { seedDatabase } from './helpers/db-seed';

async function globalSetup() {
  await seedDatabase();
}

export default globalSetup;
