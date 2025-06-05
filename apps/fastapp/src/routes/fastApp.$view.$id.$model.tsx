import { views } from '@apps-next/convex';
import { getViewByName } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import {
  getSubModelViewData,
  getViewData,
} from '../application-store/app.store.utils';
import { getUserViewsQuery, queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';

import React from 'react';
import {
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from '@apps-next/shared';

export const Route = createFileRoute('/fastApp/$view/$id/$model')({
  async loader(ctx) {
    await queryClient.ensureQueryData(getUserViewsQuery());

    const model = ctx.params.model;
    const { viewData: parentViewData, viewName: parentViewName } = getView(ctx);

    const { viewData: viewDataModel } = getSubModelViewData(
      model,
      parentViewData.viewConfig.tableName
    );

    await ctx.context.preloadQuery(
      viewDataModel.viewConfig,
      viewDataModel.viewConfig.viewName,
      null,
      parentViewName,
      ctx.params.id
    );
  },

  component: () => <DetailModelListViewPage />,
});

const DetailModelListViewPage = observer(() => {
  React.useEffect(() => console.debug('Render:SubList'));

  const { model } = useParams({ from: '/fastApp/$view/$id/$model' });

  const view = getViewByName(views, model);

  const { viewData } = getViewData(view?.viewName ?? '');

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

        <div className="flex flex-row w-full  flex-grow overflow-scroll">
          <div className="overflow-y-scroll flex-grow h-full">
            <RenderList />
          </div>
        </div>
      </div>
    </>
  );
});
