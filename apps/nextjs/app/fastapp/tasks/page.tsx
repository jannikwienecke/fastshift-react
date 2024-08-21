import { createServerViewConfig } from '@apps-next/core';
import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { globalConfig } from '../../layout';
import { TasksClient } from './tasks-client';
import { prisma } from '../../../db';

const viewConfig = createServerViewConfig(
  'post',
  {
    displayField: { field: 'title' },
  },
  globalConfig.config
);

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={viewConfig}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <TasksClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
