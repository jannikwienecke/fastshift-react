import { createServerViewConfig } from '@apps-next/core';
import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { globalConfig } from '../../layout';
import { TasksClient } from './tasks-client';

export const dynamic = 'force-dynamic';

const viewConfig = createServerViewConfig(
  'post',
  {
    displayField: { field: 'title' },
  },
  globalConfig.config
);

export default function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={viewConfig}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <TasksClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
