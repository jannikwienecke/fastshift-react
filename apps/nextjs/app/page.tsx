import Link from 'next/link';
import { prisma } from '../db';
export const dynamic = 'force-dynamic';

export default async function Index() {
  return (
    <div className="p-2">
      <div className="flex gap-2 text-lg border-b">
        <Link href={'/'}>Home</Link>
      </div>

      <hr />
    </div>
  );
}
