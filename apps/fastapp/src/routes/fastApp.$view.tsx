import { RecordType } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  Outlet,
  useParams,
  useRouteContext,
} from '@tanstack/react-router';
import React from 'react';
import { loading$ } from '../application-store/app.store';
import {
  dispatchLoadDetailOverviewView,
  dispatchLoadDetailSubView,
  dispatchLoadView,
} from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    console.debug('/fastApp/view::loader', props.params, props.cause);

    await queryClient.ensureQueryData(getUserViewsQuery());

    const { id, view, model } = props.params as RecordType;

    if (id && view && model) {
      console.log('dispatchLoadDetailSubView2');

      if (props.cause === 'preload') {
        dispatchLoadDetailSubView(props, true);
        dispatchLoadDetailOverviewView(props, true);
      } else {
        await dispatchLoadDetailSubView(props, true);
        await dispatchLoadDetailOverviewView(props, true);
      }

      loading$.set(false);
    }

    if (id && view && !model) {
      console.debug('dispatchLoadDetailOverviewView1');
      if (props.cause === 'preload') {
        dispatchLoadDetailOverviewView(props, true);
      } else {
        await dispatchLoadDetailOverviewView(props);
      }
      loading$.set(false);
    } else if (view) {
      props.cause !== 'preload' && loading$.set(true);
      await dispatchLoadView(props, true);

      loading$.set(false);
    }
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  React.useEffect(() => console.debug('Render:ListPage'), []);

  const params = useParams({ strict: false });
  const context = useRouteContext({ strict: false });

  const prevViewRef = React.useRef<string | null>(
    (params.view as string) + (params.id ?? '') + (params.model ?? '')
  );

  const viewKey = params.view + (params.id ?? '') + (params.model ?? '');
  if (params.model && viewKey !== prevViewRef.current) {
    dispatchLoadDetailSubView({ params, cause: '', context });
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');
  }
  if (params.id && viewKey !== prevViewRef.current) {
    dispatchLoadDetailOverviewView({ params, cause: '', context });
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');
  } else if (
    !loading$.get() &&
    params.view + (params.id ?? '') + (params.model ?? '')
  ) {
    prevViewRef.current =
      params.view + (params.id ?? '') + (params.model ?? '');

    dispatchLoadView({
      params,
      cause: '',
      context,
    });
  }

  const { viewData } = getView({ params });
  const ViewComponent = viewData?.main;

  if (!viewData || loading$.get()) return null;
  return (
    <>
      {ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}
      <Outlet />
    </>
  );
});
