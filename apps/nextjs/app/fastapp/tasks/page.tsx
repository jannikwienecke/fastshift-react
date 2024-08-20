import { createServerViewConfig } from '@apps-next/core';
import { QueryPrefetchProvider } from '@apps-next/query-adapter';
import { config } from '../../layout';
import { viewLoader } from './actions';
import { TasksClient } from './tasks-client';

const viewConfig = createServerViewConfig(
  'post',
  {
    displayField: { field: 'title' },
  },
  config.config
);

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider viewConfig={viewConfig} viewLoader={viewLoader}>
      <TasksClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
