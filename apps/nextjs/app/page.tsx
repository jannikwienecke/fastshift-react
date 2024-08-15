import { info } from '@apps-next/core';
import { prisma } from '../db';
export const dynamic = 'force-dynamic';

export default async function Index() {
  const users = await prisma.user.findMany({});
  const posts = await prisma.post.findMany({});

  info('Index Page', { users, posts });

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="text-3xl font-bold line-clamp-2">User & Posts</div>

      <div className="bg-gray-50 p-2 rounded-md">
        <div className="text-xl font-bold">Users</div>
        {users.map((user) => (
          <div key={user.id}>{user.email}</div>
        ))}
      </div>

      <div>
        <div className="text-xl font-bold">Posts</div>
        {posts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  );
}
