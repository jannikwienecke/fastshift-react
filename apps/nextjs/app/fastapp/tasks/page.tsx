import { createServerViewConfig } from '@apps-next/core';
import {
  configurePrismaLoader,
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma, PrismaClientType } from '../../../db';
import { globalConfig } from '../../layout';
import { TasksClient } from './tasks-client';

export const dynamic = 'force-dynamic';

export const viewConfig = createServerViewConfig(
  'task',
  {
    displayField: { field: 'name' },
  },
  globalConfig.config
);

const configWithCustomLoader = configurePrismaLoader(
  viewConfig
)<PrismaClientType>({
  include: {
    tags: {
      include: { tag: true },
    },
  },
});

export default function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={configWithCustomLoader}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <TasksClient viewConfig={configWithCustomLoader} />
    </QueryPrefetchProvider>
  );
}
