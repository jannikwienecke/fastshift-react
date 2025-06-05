import { RecordType } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  Outlet,
  useParams,
  useRouteContext,
} from '@tanstack/react-router';
import React from 'react';
import { pageLoaderIsLoading } from '../application-store/app.store';
import {
  dispatchLoadDetailOverviewView,
  dispatchLoadDetailSubView,
  dispatchLoadView,
} from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { useGlobalSearch } from '../shared/hooks/use-global-search';
import { getView } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '@apps-next/shared';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    console.debug('/fastApp/view::loader', props.params, props.cause);

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { id, view, model } = props.params as RecordType;

    if (id && view && model) {
      if (props.cause === 'preload') {
        // dispatchLoadDetailSubView(props, true);
        // dispatchLoadDetailOverviewView(props, true);
      } else {
        await dispatchLoadDetailSubView(props, true);
        await dispatchLoadDetailOverviewView(props, true);
      }

      pageLoaderIsLoading.set(false);
      return;
    }

    if (id && view && !model) {
      if (props.cause === 'preload') {
        // dispatchLoadDetailOverviewView(props, true);
      } else {
        await dispatchLoadDetailOverviewView(props);
      }
      pageLoaderIsLoading.set(false);
    } else if (view) {
      if (props.cause !== 'preload') {
        pageLoaderIsLoading.set(true);
      }

      await dispatchLoadView(props, true);

      pageLoaderIsLoading.set(false);
    }
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);

  const params = useParams({ strict: false });
  const context = useRouteContext({ strict: false });

  useGlobalSearch();

  const prevViewRef = React.useRef<string | null>(
    (params.view as string) + (params.id ?? '') + (params.model ?? '')
  );

  const viewKey = params.view + (params.id ?? '') + (params.model ?? '');
  if (params.model && viewKey !== prevViewRef.current) {
    dispatchLoadDetailSubView({ params, cause: '', context });
    dispatchLoadDetailOverviewView({ params, cause: '', context });

    prevViewRef.current = viewKey;
  }
  if (params.id && viewKey !== prevViewRef.current) {
    dispatchLoadDetailOverviewView({ params, cause: '', context });
    prevViewRef.current = viewKey;
  } else if (!pageLoaderIsLoading.get() && viewKey && !params.id) {
    prevViewRef.current = viewKey;

    dispatchLoadView({
      params,
      cause: '',
      context,
    });
  }

  const { viewData } = getView({ params });
  const ViewComponent = viewData?.main;

  if (!viewData || pageLoaderIsLoading.get()) {
    return null;
  }

  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
