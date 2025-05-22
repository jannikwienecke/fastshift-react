import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { QueryReturnOrUndefined, RecordType } from '@apps-next/core';
import { store$, viewActionStore } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import { getQueryKey, getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import { DefaultViewTemplate } from '../views/default-view-template';
import { isInDetailView$ } from '../application-store/app.store.utils';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderCommandform,
  RenderConfirmationAlert,
  RenderContextmenu,
  RenderDatePickerDialog,
} from '../views/default-components';

const loading$ = observable(false);
const loadingEnter$ = observable(false);
export const Route = createFileRoute('/fastApp/$view')({
  onEnter: async (props) => {
    if ((props.params as any)?.id) return;

    console.debug('::::onEnter:ListPage:', props.params.view);

    loadingEnter$.set(true);
    store$.detail.set(undefined);

    await props.loaderPromise;
    await props.loadPromise;

    const { viewData, userViewData } = getView(props);

    const data = (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        viewData.viewConfig,
        userViewData ?? null,
        null,
        null,
        null
      )
    )) as QueryReturnOrUndefined;

    viewActionStore.dispatchViewAction({
      type: 'LOAD_VIEW',
      viewData,
      userViewData,
      data,
    });
    loadingEnter$.set(false);
  },
  loader: async (props) => {
    console.debug('::::onLoad:ListPage', props.params.view, props.cause);
    if (props.cause === 'enter') {
      loading$.set(true);
    }
    await queryClient.ensureQueryData(getUserViewsQuery());

    const { viewData, viewName, userViewData } = getView(props);

    const data = await props.context.preloadQuery?.(
      viewData.viewConfig,
      viewName,
      null,
      null,
      null
    );

    if (props.cause === 'enter') {
      loading$.set(false);

      if (!(props.params as RecordType).id) {
        viewActionStore.dispatchViewAction({
          type: 'LOAD_VIEW',
          viewData,
          userViewData,
          data,
        });
      }
    }

    console.debug('::::onLoad:ListPage:done', props.params.view);
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  const params = useParams({ strict: false });
  const { viewData } = getView({ params });

  React.useEffect(() => console.debug(':Render:ListPage'), []);
  console.debug(':Render:ListPage', params);

  const ViewComponent = viewData?.main;

  if (loading$.get() || loadingEnter$.get()) return null;
  if (!store$.viewConfigManager.viewConfig.get()) return null;

  if (!viewData) return null;

  return (
    <>
      <DispatchComponent />

      <RenderContextmenu />
      <RenderConfirmationAlert />
      <RenderCommandbar />
      <RenderCommandform />
      <RenderDatePickerDialog />
      <RenderComboboxPopover />

      {isInDetailView$.get() ? (
        <>
          <Outlet />
        </>
      ) : (
        <>{ViewComponent ? <ViewComponent /> : <DefaultViewTemplate />}</>
      )}
    </>
  );
});

const DispatchComponent = observer(() => {
  const params = useParams({ strict: false });
  const { viewData, userViewData, viewName } = getView({ params });

  React.useEffect(() => {
    if (isInDetailView$.get()) return;

    if (!params.model && !params.id) {
      const data = queryClient.getQueryData(
        getQueryKey(viewData.viewConfig, viewName, null, null, null)
      ) as QueryReturnOrUndefined;

      viewActionStore.dispatchViewAction({
        type: 'LOAD_VIEW',
        viewData,
        userViewData,
        data,
      });
    }
  }, [params.id, params.model, userViewData, viewData, viewName]);
  return <></>;
});
