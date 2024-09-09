import { ServerViewProvider } from '../server-view-provider';
import { ProjectsClient } from './projects-client';
import { viewConfig } from './projects.config';

export const dynamic = 'force-dynamic';

export default async function FastAppProjectPage() {
  return (
    <ServerViewProvider viewConfig={viewConfig}>
      <ProjectsClient />
    </ServerViewProvider>
  );
}
