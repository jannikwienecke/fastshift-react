import { observer } from '@legendapp/state/react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from '../views/default-components';
import {
  _log,
  BaseViewConfigManager,
  FieldConfig,
  getViewByName,
  patchDict,
  QueryReturnOrUndefined,
  renderModelName,
  t,
  ViewFieldConfig,
} from '@apps-next/core';
import { store$ } from '@apps-next/react';
import { getQueryKey, getUserViewQuery, queryClient } from '../query-client';
import { getViewData } from '../application-store/app.store.utils';
import { views } from '@apps-next/convex';
import { pachTheViews } from '../shared/utils/app.helper';

export const Route = createFileRoute('/fastApp/$view/$id/$model')({
  async loader(ctx) {
    console.log('LOAD SUB MODEL', ctx.params.model);

    const model = ctx.params.model;
    const patched = pachTheViews();
    const view = getViewByName(patched, model);

    if (!view) throw new Error('NOT VALID MODEL');

    const viewName = view.viewName;

    await queryClient.ensureQueryData(getUserViewQuery(viewName));
    const { viewData, userViewData } = getViewData(viewName);

    if (!viewData) {
      _log.info(`View ${viewName} not found, redirecting to /fastApp`);
      return redirect({ to: '/fastApp' });
    }

    await ctx.context.preloadQuery(
      viewData.viewConfig,
      viewName,
      null,
      ctx.params.view,
      ctx.params.id
    );

    const data = queryClient.getQueryData(
      getQueryKey(
        viewData.viewConfig,
        viewName,
        null,
        ctx.params.view,
        ctx.params.id
      )
    ) as QueryReturnOrUndefined;

    console.log('DATA::', data.data);

    const viewConfigManager = new BaseViewConfigManager(
      {
        ...viewData.viewConfig,
        viewFields: patched[viewName]?.viewFields as ViewFieldConfig,
      },
      viewData.uiViewConfig
    );

    store$.init(
      data?.data ?? [],
      data?.relationalData ?? {},
      data?.continueCursor ?? null,
      data?.isDone ?? false,
      viewConfigManager,
      views,
      viewData.uiViewConfig,
      [],
      userViewData,
      null
    );

    store$.detail.parentViewName.set(ctx.params.view);
  },
  component: () => <DetailModelListViewPage />,
});

const DetailModelListViewPage = observer(() => {
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
