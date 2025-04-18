/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseViewConfigManager,
  getViewByName,
  MutationDto,
  MutationPropsServer,
  patchAllViews,
  patchViewConfig,
  QueryDto,
  RegisteredViews,
} from '@apps-next/core';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';
import { viewMutationHandler } from './view-mutation';

export const makeViewLoaderHandler =
  (views: RegisteredViews) => (ctx: GenericQueryCtx, args: any) => {
    const viewConfig = getViewByName(views, args.viewName);

    if (!viewConfig) throw new Error('viewConfig is not defined');

    const viewConfigManager = new BaseViewConfigManager(
      patchViewConfig(viewConfig)
    );

    const registeredViews = patchAllViews(views, viewConfig);

    return viewLoaderHandler(ctx, {
      ...(args as QueryDto),
      viewConfig,
      viewConfigManager,
      registeredViews,
    } satisfies QueryDto);
  };

export const makeViewMutationHandler =
  (views: RegisteredViews) => (ctx: any, args: MutationDto) => {
    const viewConfig = getViewByName(views, args.viewName);

    if (!viewConfig) throw new Error('viewConfig is not defined');

    const viewConfigManager = new BaseViewConfigManager(
      patchViewConfig(viewConfig)
    );

    const registeredViews = patchAllViews(views, viewConfig);

    return viewMutationHandler(ctx, {
      ...args,
      mutation: args.mutation,
      viewConfigManager,
      registeredViews,
    } satisfies MutationPropsServer);
  };
