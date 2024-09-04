import { waitFor } from '@apps-next/core';

// eslint-disable-next-line
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding Prisma database...');

  // Clear existing data
  await waitFor(500);
  await prisma.taskTag.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: 'password123',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: 'securepass',
    },
  });

  // Create owners
  const owner1 = await prisma.owner.create({
    data: {
      userId: user1.id,
      firstname: 'John',
      lastname: 'Doe',
      age: 35,
      user: { connect: { id: user1.id } },
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      userId: user2.id,
      firstname: 'Jane',
      lastname: 'Smith',
      age: 28,
      user: { connect: { id: user2.id } },
    },
  });

  // Create categories
  const categories = [
    { label: 'Work', color: 'blue' },
    { label: 'Personal', color: 'green' },
    { label: 'Health', color: 'red' },
    { label: 'Finance', color: 'yellow' },
    { label: 'Education', color: 'purple' },
  ];

  const createdCategories = await Promise.all(
    categories.map((category) => prisma.category.create({ data: category }))
  );

  // Create tags
  const tags = [
    { name: 'Urgent', color: 'red' },
    { name: 'Important', color: 'orange' },
    { name: 'Long-term', color: 'blue' },
    { name: 'Quick', color: 'green' },
    { name: 'Collaborative', color: 'purple' },
  ];

  const createdTags = await Promise.all(
    tags.map((tag) => prisma.tag.create({ data: tag }))
  );

  // Create projects
  const projects = [
    {
      label: 'Website Redesign',
      description: 'Redesign company website',
      categoryId: createdCategories[0].id,
      ownerId: owner1.id,
      dueDate: new Date('2023-12-31').getTime(),
    },
    {
      label: 'Fitness Plan',
      description: 'Create a personal fitness plan',
      categoryId: createdCategories[2].id,
      ownerId: owner2.id,
      dueDate: new Date('2023-09-30').getTime(),
    },
    {
      label: 'Budget Analysis',
      description: 'Analyze monthly budget',
      categoryId: createdCategories[3].id,
      ownerId: owner1.id,
      dueDate: new Date('2023-10-15').getTime(),
    },
  ];

  const createdProjects = await Promise.all(
    projects.map((project) => prisma.project.create({ data: project }))
  );

  // Create tasks
  const tasks = [
    {
      name: 'Design mockups',
      completed: false,
      projectId: createdProjects[0].id,
      priority: 'high',
    },
    {
      name: 'Develop frontend',
      completed: false,
      projectId: createdProjects[0].id,
      priority: 'medium',
    },
    {
      name: 'Create workout schedule',
      completed: true,
      projectId: createdProjects[1].id,
      priority: 'low',
    },
    {
      name: 'Track expenses',
      completed: false,
      projectId: createdProjects[2].id,
      priority: 'high',
    },
  ];

  const createdTasks = await Promise.all(
    tasks.map((task) => prisma.task.create({ data: task }))
  );

  // Create task tags
  await prisma.taskTag.create({
    data: {
      tagId: createdTags[0].id,
      taskId: createdTasks[0].id,
    },
  });

  await prisma.taskTag.create({
    data: {
      tagId: createdTags[1].id,
      taskId: createdTasks[0].id,
    },
  });

  console.log('Seed data created successfully');
}

// Keep the original execution for when the script is run directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
