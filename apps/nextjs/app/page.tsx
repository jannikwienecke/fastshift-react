import { llinfo } from '@apps-next/core';
import Link from 'next/link';
import { prisma } from '../db';
export const dynamic = 'force-dynamic';

// const config = generateConfigFrom('prisma', Prisma.dmmf.datamodel);

export default async function Index() {
  const users = await prisma.user.findMany({});
  const posts = await prisma.post.findMany({});

  llinfo('Index Page', { users, posts });

  return (
    <div className="p-2">
      <div className="flex gap-2 text-lg border-b">
        <Link href={'/'}>Home123</Link>
      </div>

      <hr />
    </div>
  );
}
