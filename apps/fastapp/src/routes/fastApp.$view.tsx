import { api } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { QueryReturnOrUndefined, RecordType } from '@apps-next/core';
import { store$, viewActionStore } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import React from 'react';
import { isInDetailView$ } from '../application-store/app.store.utils';
import { getQueryKey, getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderCommandform,
  RenderConfirmationAlert,
  RenderContextmenu,
  RenderDatePickerDialog,
} from '../views/default-components';
import { DefaultViewTemplate } from '../views/default-view-template';

const loadingStay$ = observable(false);
const loading$ = observable(false);
const loadingEnter$ = observable(false);
const isInLoader$ = observable(false);

export const Route = createFileRoute('/fastApp/$view')({
  onStay: async (props) => {
    console.debug('::::onStay:ListPage:', props.params);
    const params = props.params as RecordType;
    // const isListView = props.pathname === `/fastApp/${params.view}`;

    // console.log({ params, path: props.pathname, props });
    if (!(params as any)?.id) {
      loadingStay$.set(true);
      console.debug('::::onStay:ListPage:load:', params.view);
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

      console.debug('::::onStay:ListPage:Dispatch:LOAD_VIEW');

      viewActionStore.dispatchViewAction({
        type: 'LOAD_VIEW',
        viewData,
        userViewData,
        data,
      });
      loadingStay$.set(false);
    }
  },
  onEnter: async (props) => {
    if ((props.params as any)?.id) {
      isInDetailView$.set(true);
      return;
    }

    const isListView = !(props.params as RecordType)?.id;
    if (!isListView) return;

    console.debug('::::onEnter:ListPage:', props.params.view);

    // loadingEnter$.set(true);
    // store$.detail.set(undefined);

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

    console.debug('::::onEnter:ListPage:load:', data);
    console.debug('::::onEnter:ListPage:Dispatch:LOAD_VIEW2');

    viewActionStore.dispatchViewAction({
      type: 'LOAD_VIEW',
      viewData,
      userViewData,
      data,
    });
    // loadingEnter$.set(false);
  },
  loader: async (props) => {
    console.debug('::::onLoad:ListPage', props.params.view, props.cause);
    await queryClient.ensureQueryData(getUserViewsQuery());
    const { viewData, viewName, userViewData } = getView(props);

    const data = await props.context.preloadQuery?.(
      viewData.viewConfig,
      viewName,
      null,
      null,
      null
    );

    const params = props.params as RecordType;
    const isListView = !(params as any)?.id;
    if (!isListView) {
      isInDetailView$.set(true);
      return;
    }

    if (!(props.params as RecordType).id) {
      isInLoader$.set(true);
    }

    if (props.cause !== 'preload' && isListView) {
      loading$.set(false);
      isInLoader$.set(false);
      viewActionStore.dispatchViewAction({
        type: 'LOAD_VIEW',
        viewData,
        userViewData,
        data,
      });
    }

    console.debug('::::onLoad:ListPage:done', props.params.view);
  },

  component: () => <ViewMainComponent />,
});

const ViewMainComponent = observer(() => {
  const params = useParams({ strict: false });

  const { viewData } = getView({
    params: {
      view:
        store$.userViewData.name.get() ||
        store$.viewConfigManager.viewConfig.get()?.viewName ||
        params.view,
    },
  });

  React.useEffect(() => console.debug(':Render:ListPage'), []);

  const ViewComponent = viewData?.main;

  if (loading$.get() || loadingEnter$.get())
    return <div aria-label="loading"></div>;

  if (!store$.viewConfigManager.viewConfig.get())
    return <div aria-label="no view"></div>;

  if (!viewData) return <div aria-label="no view data"></div>;

  const isSame = !store$.detail.row.get();

  return (
    <>
      <DispatchComponent />

      <RenderContextmenu />
      <RenderConfirmationAlert />
      <RenderCommandbar />
      <RenderCommandform />
      <RenderDatePickerDialog />
      <RenderComboboxPopover />

      {params.id ? (
        <>
          <Outlet />
        </>
      ) : (
        <>
          {isSame ? (
            ViewComponent ? (
              <ViewComponent />
            ) : (
              <DefaultViewTemplate />
            )
          ) : (
            <></>
          )}
        </>
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
      if (!data) return;

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
