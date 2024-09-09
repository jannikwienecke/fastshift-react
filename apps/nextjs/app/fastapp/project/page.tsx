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

// one e2e test is failing -> check it
// when updating state -> and the before/after state is the same -> do notjhing. Example checkbox project
