import { ServerViewProvider } from '../server-view-provider';
import { TaskClient } from './tasks-client';
import { viewConfig } from './tasks.config';

export const dynamic = 'force-dynamic';

export default async function FastAppTaskPage() {
  return (
    <ServerViewProvider viewConfig={viewConfig}>
      <TaskClient />
    </ServerViewProvider>
  );
}
