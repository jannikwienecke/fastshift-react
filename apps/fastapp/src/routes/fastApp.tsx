import {
  Button,
  EmojiPicker,
  EmojiPickerDialog,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SidebarInset,
  SidebarProvider,
} from '@apps-next/ui';

import React from 'react';

import { views } from '@apps-next/convex';
import { _log, QueryReturnOrUndefined } from '@apps-next/core';
import {
  ClientViewProviderConvex,
  ErrorDetailsDialog,
  globalStore,
  store$,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  ErrorComponent,
  Outlet,
  redirect,
  useParams,
} from '@tanstack/react-router';
import { LoaderIcon } from 'lucide-react';
import { Toaster } from 'sonner';
import { resettingDb$ } from '../application-store/app.store';
import { getViewData, wait } from '../application-store/app.store.utils';
import { AppSidebar } from '../components/sidebar/app-sidebar';
import {
  getQueryKey,
  getUserViews,
  getUserViewsQuery,
  queryClient,
} from '../query-client';
import { useCommands, useViewParams } from '../shared/hooks';
import { useAppEffects } from '../shared/hooks/app.effects';
import { getViewParms } from '../shared/utils/app.helper';

export const Route = createFileRoute('/fastApp')({
  loader: async (props) => {
    await wait();

    const userViewsQuery = getUserViewsQuery();
    await queryClient.ensureQueryData(userViewsQuery);

    const userViews = getUserViews();

    const { viewName, slug, id, model } = getViewParms(props.params);

    globalStore.setViews(views);
    store$.api.getUserViewQueryKey.set(userViewsQuery.queryKey);

    if (!viewName) {
      return redirect({ to: '/fastApp/task' });
    }

    if (store$.viewConfigManager.viewConfig.get()) {
      return;
    }

    _log.debug(`Loader for view: ${viewName} - slug: ${slug}`);

    const { viewData, userViewData } = getViewData(viewName, userViews);

    if (!viewData) {
      _log.warn(`View ${viewName} not found, redirecting to /fastApp`);
      return redirect({ to: '/fastApp' });
    }

    let data: QueryReturnOrUndefined | null = null;

    await props.context.preloadQuery(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      null,
      null,
      null
    );

    data = queryClient.getQueryData(
      getQueryKey(
        viewData.viewConfig,
        userViewData?.name ?? viewName,
        null,
        null,
        null
      )
    ) as QueryReturnOrUndefined;

    globalStore.dispatch({
      type: 'INIT_LOAD_STORE',
      payload: {
        viewName,
        data,
        userViews,
        views,
        id: id ?? null,
        model: model ?? null,
        userView: userViewData,
      },
    });
  },

  component: () => <FastAppLayoutComponent />,
  errorComponent: (props) => {
    return <ErrorComponent {...props} />;
  },
});

const FastAppLayoutComponent = observer(() => {
  const { commands } = useCommands();

  const { id } = useParams({ strict: false });
  let { viewName, model } = useViewParams();
  viewName = viewName as string;
  model = model as string | undefined;

  useAppEffects(viewName);

  React.useEffect(() => {
    return () => {
      if (!id) return;
      if (modelRef.current) return;
      if (!hasNoIdRef.current) return;

      globalStore.dispatch({
        type: 'CHANGE_VIEW',
        payload: {
          data: dataRef.current,
          viewName: modelRef.current || viewNameRef.current,
          resetDetail: true,
        },
      });
    };
  }, [id]);

  const userViews = getUserViews();

  const { viewData, userViewData } = getViewData(viewName, userViews);

  const data = queryClient.getQueryData(
    getQueryKey(
      viewData.viewConfig,
      userViewData?.name ?? viewName,
      null,
      null,
      null
    )
  ) as QueryReturnOrUndefined;

  const doOnceForViewRef = React.useRef('');

  if (
    (!doOnceForViewRef.current || doOnceForViewRef.current !== viewName) &&
    !id &&
    data
  ) {
    globalStore.dispatch({
      type: 'CHANGE_VIEW',
      payload: { data, viewName },
    });
    doOnceForViewRef.current = viewName;
  }

  const viewNameRef = React.useRef(viewName);
  const modelRef = React.useRef(model);
  const dataRef = React.useRef(data);

  if (viewNameRef.current !== viewName) {
    viewNameRef.current = viewName;
  }

  if (dataRef.current !== data) {
    dataRef.current = data;
  }

  if (modelRef.current !== model) {
    modelRef.current = model;
  }

  const hasNoIdRef = React.useRef(true);
  if (!id) {
    hasNoIdRef.current = true;
  } else {
    hasNoIdRef.current = false;
  }

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
