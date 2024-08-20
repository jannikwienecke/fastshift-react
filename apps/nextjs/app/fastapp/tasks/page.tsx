import { createViewConfig } from '@apps-next/core';
import { QueryPrefetchProvider } from '@apps-next/query-adapter';
import { viewLoader } from './actions';
import { TasksClient } from './tasks-client';

const viewConfig = createViewConfig('post', {
  displayField: { field: 'title' },
});

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider viewConfig={viewConfig} viewLoader={viewLoader}>
      <TasksClient viewConfig={viewConfig} />
    </QueryPrefetchProvider>
  );
}
