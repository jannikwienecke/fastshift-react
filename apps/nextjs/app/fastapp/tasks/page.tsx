import {
  configurePrismaLoader,
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma, PrismaClientType } from '../../../db';
import { TasksClient } from './tasks-client';
import { viewConfig } from './tasks.config';

export const dynamic = 'force-dynamic';

const configWithCustomLoader = configurePrismaLoader(
  viewConfig
)<PrismaClientType>({
  include: {
    tags: {
      include: { tag: true },
    },
  },
});

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={configWithCustomLoader}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <TasksClient />
    </QueryPrefetchProvider>
  );
}
