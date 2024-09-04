import { PrismaClient } from '@prisma/client';
// Import the main function from your existing seed script
import { main as seedMain } from '../../../nextjs/prisma/seed';

const prisma = new PrismaClient();

export async function seedDatabase() {
  try {
    // Call the main function from your existing seed script
    await seedMain();

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
