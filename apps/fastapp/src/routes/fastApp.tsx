import { SidebarInset, SidebarProvider } from '@apps-next/ui';

import { views } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  ErrorDetailsDialog,
  viewActionStore,
  store$,
  perstistedStore$,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
} from '@tanstack/react-router';
import { LoaderIcon } from 'lucide-react';
import { Toaster } from 'sonner';
import { resettingDb$ } from '../application-store/app.store';
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

    console.log(localStore$.get());
    hydradatedStore$.set(true);
    perstistedStore$.set(localStore$.get());
  },

  component: () => <FastAppLayoutComponent />,
  errorComponent: (props) => {
    return <ErrorComponent {...props} />;
  },
});

const FastAppLayoutComponent = observer(() => {
  const { commands } = useCommands();

  let { viewName } = useViewParams();
  viewName = viewName as string;

  useAppEffects(viewName);

  return (
    <ClientViewProviderConvex commands={commands}>
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

      <ErrorDetailsDialog />
      <Toaster richColors duration={2000} />
    </ClientViewProviderConvex>
  );
});
