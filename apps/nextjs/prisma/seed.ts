// import { Post } from '@prisma/client';
// import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`delete from "Post"`;
  await prisma.$executeRaw`delete from "User"`;

  await prisma.user.create({
    data: {
      id: 1,
      email: 'jannik@gmail.com',
      name: 'Jannik Wiencek',
    },
  });

  const posts = [
    {
      id: 1,
      title: 'Incredible Metal Towels',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      published: true,
      authorId: 1,
    },
    {
      id: 2,
      title: 'The Football Is Good For Training And Recreational Purposes',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      published: true,
      authorId: 1,
    },
  ];

  Promise.all(
    posts.map(async (post) => {
      return await prisma.post.create({
        data: post,
      });
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
