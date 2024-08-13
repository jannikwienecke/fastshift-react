// import { prisma } from '../db';

import { prisma } from '../db';

export const dynamic = 'force-dynamic';

export default async function Index() {
  const posts = await prisma.user.findMany({});

  // await prisma.user.create({
  //   data: {
  //     email: 'test@test.com',
  //     name: 'Test',
  //   },
  // });

  console.log({ posts });

  return (
    <div className="bg-blue-300">
      <div>Hello Nextjs App !</div>

      <div>
        {posts.map((post) => (
          <div key={post.id}>{post.email}</div>
        ))}
      </div>
    </div>
  );
}
