import { api, views } from '@apps-next/convex';
import { preloadQuery } from '@apps-next/convex-adapter-app';
import { getViewByName, QueryReturnOrUndefined } from '@apps-next/core';
import { store$, viewActionStore } from '@apps-next/react';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import React from 'react';
import {
  getSubModelViewData,
  getViewData,
} from '../application-store/app.store.utils';
import { queryClient } from '../query-client';
import { getView } from '../shared/utils/app.helper';
import {
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from '../views/default-components';

const loading$ = observable(false);
const loadingEnter$ = observable(false);
export const Route = createFileRoute('/fastApp/$view/$id/$model')({
  onEnter: async (props) => {
    loadingEnter$.set(true);

    await props.loaderPromise;
    await props.loadPromise;

    console.debug(':::onEnter:Sub Model Page');

    const model = props.params.model;

    const {
      viewData: parentViewData,
      viewName: parentViewName,
      userViewData: userViewDataDetail,
    } = getView(props);

    const { viewData: viewDataModel, userViewData } = getSubModelViewData(
      model,
      parentViewData.viewConfig.tableName
    );

    const id = props.params.id as string;

    const data = (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        viewDataModel.viewConfig,
        userViewData ?? null,
        null,
        parentViewName,
        id
      )
    )) as QueryReturnOrUndefined;

    const dataDetail = (await queryClient.ensureQueryData(
      preloadQuery(
        api.query.viewLoader,
        parentViewData.viewConfig,
        userViewDataDetail ?? null,
        id,
        null,
        null
      )
    )) as QueryReturnOrUndefined;

    viewActionStore.dispatchViewAction({
      type: 'LOAD_DETAIL_SUB_VIEW',
      userViewData,
      viewData: viewDataModel,
      data,
      detailData: dataDetail,
      detailUserViewData: userViewDataDetail,
      detailViewData: parentViewData,
      id,
      parentViewName,
    });
    loadingEnter$.set(false);
  },

  async loader(ctx) {
    if (ctx.cause === 'enter') {
      loading$.set(true);
    }
    console.debug(':::LOADER:SubModelPage', ctx.params.model);

    await ctx.parentMatchPromise;

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

    if (ctx.cause === 'enter') {
      loading$.set(false);
    }
  },

  component: () => <DetailModelListViewPage />,
});

const DetailModelListViewPage = observer(() => {
  React.useEffect(() => console.debug('Render:SubList'));

  const { model } = useParams({ from: '/fastApp/$view/$id/$model' });

  const view = getViewByName(views, model);

  const { viewData } = getViewData(view?.viewName ?? '');

  if (loading$.get() || loadingEnter$.get()) return null;

  if (viewData.main) {
    return <viewData.main isSubView={true} />;
  }
  if (!store$.viewConfigManager.viewConfig.get()) return;

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
