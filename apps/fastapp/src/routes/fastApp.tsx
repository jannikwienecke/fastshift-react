import { SidebarInset, SidebarProvider } from '@apps-next/ui';

import { views } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  ErrorDetailsDialog,
  perstistedStore$,
  store$,
  viewActionStore,
} from '@apps-next/react';
import { Memo, observer } from '@legendapp/state/react';
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
} from '@tanstack/react-router';
import { LoaderIcon } from 'lucide-react';
import React from 'react';
import { Toaster } from 'sonner';
import {
  pageLoaderIsLoading,
  resettingDb$,
} from '../application-store/app.store';
import { AppSidebar } from '../components/sidebar/app-sidebar';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
import {
  hydradatedStore$,
  localStore$,
  useCommands,
  useViewParams,
} from '../shared/hooks';
import { useAppEffects } from '../shared/hooks/app.effects';
viewActionStore.setViews(views);

export const Route = createFileRoute('/fastApp')({
  loader: async (props) => {
    if (store$.userViews.get().length) return;

    const userViewsQuery = getUserViewsQuery();

    await queryClient.ensureQueryData(userViewsQuery);

    const userViews = getUserViews();

    store$.api.getUserViewQueryKey.set(userViewsQuery.queryKey);
    store$.userViews.set(userViews);

    console.debug('Persisted Storage: ', localStore$.get());
    hydradatedStore$.set(true);
    perstistedStore$.set(localStore$.get());
  },

  component: () => <FastAppLayoutComponent />,
  errorComponent: (props) => {
    return <ErrorComponent {...props} />;
  },
});

const FastAppLayoutComponent = observer(() => {
  let { viewName } = useViewParams();
  viewName = viewName as string;

  useAppEffects(viewName);

  return (
    <ClientViewProviderConvex commands={[]}>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      {resettingDb$.get() ? (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/50 flex items-center justify-center z-50">
          <LoaderIcon className="animate-spin h-10 w-10 text-white" />
        </div>
      ) : (
        <></>
      )}

      <Memo>{() => <RenderCommandsHook />}</Memo>

      <ErrorDetailsDialog />
      <Toaster richColors duration={2000} />

      {pageLoaderIsLoading.get() ? (
        <div className="fixed right-4 bottom-4 z-40">
          <div className="animate-spin">
            <LoaderIcon className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
      ) : (
        <></>
      )}
    </ClientViewProviderConvex>
  );
});

const RenderCommandsHook = observer(() => {
  const { makeCommands } = useCommands();

  if (store$.commands.get().length === 0 && makeCommands.length) {
    store$.commands.set(makeCommands);
  }

  React.useEffect(() => {
    store$.commands.set(makeCommands);
  }, [makeCommands]);

  return null;
});
