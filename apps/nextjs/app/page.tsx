import { Prisma } from '@prisma/client';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default async function Index() {
  console.log(
    'hier',
    Prisma.dmmf.datamodel.models.find((model) => model.name === 'Task')
  );
  return (
    <div className="p-2">
      <div className="flex gap-2 text-lg border-b">
        <Link href={'/'}>Home1</Link>
      </div>

      <hr />
    </div>
  );
}
