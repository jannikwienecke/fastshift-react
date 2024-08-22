import { createServerViewConfig } from '@apps-next/core';
import {
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma } from '../../../db';
import { globalConfig } from '../../layout';
import { TasksClient } from './tasks-client';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const viewConfig = createServerViewConfig(
  'task',
  {
    displayField: { field: 'name' },
  },
  globalConfig.config
);

const Tasks = Prisma.dmmf.datamodel.models.find((m) => m.name === 'Task');
// console.log(Tasks?.fields);
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
