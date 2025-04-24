import { views } from '@apps-next/convex';
import { _log, getViewByName, QueryReturnOrUndefined } from '@apps-next/core';
import { globalStore, store$ } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect, useParams } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import {
  getQueryKey,
  getUserViews,
  getUserViewsQuery,
  queryClient,
} from '../query-client';
import { getViewParms } from '../shared/utils/app.helper';
import {
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from '../views/default-components';
import { useViewParams } from '../shared/hooks';
import React from 'react';

export const Route = createFileRoute('/fastApp/$view/$id/$model')({
  async loader(ctx) {
    console.warn('____LOAD SUB MODEL', ctx.params.model);
    await queryClient.ensureQueryData(getUserViewsQuery());

    const model = ctx.params.model;
    const view = getViewByName(views, model);

    if (!view) throw new Error('NOT VALID MODEL');

    const { viewName: parentViewName } = getViewParms(ctx.params);

    if (!parentViewName) throw new Error('NOT VALID VIEW');

    const userViews = getUserViews();
    const { viewData } = getViewData(view.viewName, userViews);

    if (!viewData) {
      _log.info(`View ${view.viewName} not found, redirecting to /fastApp`);
      return redirect({ to: '/fastApp' });
    }

    await ctx.context.preloadQuery(
      viewData.viewConfig,
      view.viewName,
      null,
      parentViewName,
      ctx.params.id
    );
  },
  component: () => <DetailModelListViewPage />,
});

const DetailModelListViewPage = observer(() => {
  const { model, id } = useParams({ from: '/fastApp/$view/$id/$model' });
  const { viewName: parentViewName } = useViewParams();

  const view = getViewByName(views, model);

  const userViews = getUserViews();

  const { viewData } = getViewData(view?.viewName ?? '', userViews);

  const doOnceForModelID = React.useRef('');

  const modelId = model + id;
  if (model && id && modelId !== doOnceForModelID.current && view?.viewName) {
    doOnceForModelID.current = modelId;

    const data = queryClient.getQueryData(
      getQueryKey(
        viewData.viewConfig,
        view?.viewName ?? '',
        null,
        parentViewName ?? null,
        id ?? null
      )
    ) as QueryReturnOrUndefined;

    globalStore.dispatch({
      type: 'LOAD_SUB_VIEW_LIST_PAGE',
      payload: {
        id,
        viewName: view?.viewName ?? '',
        parentViewName: parentViewName ?? '',
        data,
      },
    });
  }

  if (viewData.main) {
    return <viewData.main isSubView={true} />;
  }

  return (
    <>
      <div className="p-2 flex flex-col gap-2 grow h-[50%] overflow-scroll">
        <div className="flex flex-row w-full justify-between">
          <div className="grow pr-12 pl-8">
            <RenderFilter options={{ hideFields: [] }} />
          </div>

          <div className="flex flex-row gap-2 mr-4 items-center">
            <RenderDisplayOptions options={{}} />
          </div>
        </div>

        <RenderInputDialog />

        <div className="flex flex-col w-full ">
          <RenderList options={undefined} />
        </div>
        <hr />
      </div>
    </>
  );
});
