// eslint-disable-next-line
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Prisma database...');

  // Clear existing data
  //   await prisma.$executeRaw`delete from "Post"`;
  // await prisma.$executeRaw`delete from "User"`;

  await prisma.taskTag.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'wienecke.jannik@gmail.com',
      password: 'admin',
    },
  });

  // Create an owner
  const owner = await prisma.owner.create({
    data: {
      userId: user.id,
      firstname: 'Jannik',
      lastname: 'Wiencek',
      age: 32,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  // Create categories
  const categories = [];
  for (let i = 0; i < 10; i++) {
    const category = await prisma.category.create({
      data: {
        label: faker.vehicle.manufacturer(),
        color: faker.color.human(),
      },
    });
    categories.push(category);
  }

  // Create tags
  const tags = [];
  for (let i = 0; i < 10; i++) {
    const tag = await prisma.tag.create({
      data: {
        name: faker.hacker.verb(),
        color: faker.color.human(),
      },
    });
    tags.push(tag);
  }

  // Create projects
  const projects = [];
  for (let i = 0; i < 10; i++) {
    const project = await prisma.project.create({
      data: {
        label: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        categoryId: categories[0].id,
        ownerId: owner.id,
        dueDate: faker.date.future().getTime(),
      },
    });
    projects.push(project);
  }

  // Create tasks
  const tasks = [];
  for (let i = 0; i < 50; i++) {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const task = await prisma.task.create({
      data: {
        name: faker.person.fullName(),
        completed: faker.datatype.boolean(),
        projectId: randomProject.id,
        priority: 'low',
      },
    });
    tasks.push(task);
  }

  // Create task-tag associations
  for (let i = 0; i < 10; i++) {
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    await prisma.taskTag.create({
      data: {
        tagId: randomTag.id,
        taskId: randomTask.id,
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seed data created successfully');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
