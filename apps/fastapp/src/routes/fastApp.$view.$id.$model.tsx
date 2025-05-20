import { views } from '@apps-next/convex';
import { getViewByName } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { getViewData } from '../application-store/app.store.utils';
import { getUserViews, getUserViewsQuery, queryClient } from '../query-client';
import { getViewParms } from '../shared/utils/app.helper';
import {
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from '../views/default-components';

export const Route = createFileRoute('/fastApp/$view/$id/$model')({
  async loader(ctx) {
    await queryClient.ensureQueryData(getUserViewsQuery());

    const model = ctx.params.model;
    const view = getViewByName(views, model);

    if (!view) throw new Error('NOT VALID MODEL');

    const { viewName: parentViewName } = getViewParms(ctx.params);

    if (!parentViewName) throw new Error('NOT VALID VIEW');

    const userViews = getUserViews();
    const { viewData } = getViewData(view.viewName, userViews);

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
  const { model } = useParams({ from: '/fastApp/$view/$id/$model' });

  const view = getViewByName(views, model);

  const userViews = getUserViews();

  const { viewData } = getViewData(view?.viewName ?? '', userViews);

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
