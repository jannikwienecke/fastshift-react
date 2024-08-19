import { QueryPrefetchProvider } from '@apps-next/query-adapter';
import { viewLoader } from './actions';
import { TasksClient } from './tasks-client';

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider viewLoader={viewLoader} viewName={'post'}>
      <TasksClient />
    </QueryPrefetchProvider>
  );
}
