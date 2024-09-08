import { dehydrate } from '@tanstack/react-query';
import { ClientViewProvider } from '../client-view-provider';
import { prefetchView } from '../prefetch';
import { ProjectsClient } from './projects-client';
import { viewConfig } from './projects.config';

export const dynamic = 'force-dynamic';

export default async function FastAppTasksPage() {
  const queryClient = await prefetchView(viewConfig);

  return (
    <ClientViewProvider
      queryClientState={dehydrate(queryClient)}
      viewConfig={viewConfig}
    >
      <ProjectsClient />
    </ClientViewProvider>
  );
}

// hier weiter machen -> siehe diese page als beispiel
// create a clientViewProvider -> One that is used for all pages
// then import it here and wrap the client page view in it
// check registered views -> currently we only use the global config default views
// check if we can remove the global  provider or if we can remove some duplicated code
// when updating state -> and the before/after state is the same -> do notjhing. Example checkbox project
