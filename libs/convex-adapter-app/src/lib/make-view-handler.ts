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
  UserViewData,
} from '@apps-next/core';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';
import { viewMutationHandler } from './view-mutation';

export const makeViewLoaderHandler =
  (views: RegisteredViews) => async (ctx: GenericQueryCtx, args: any) => {
    let viewConfig = getViewByName(views, args.viewName);

    if (!args.viewName) return null;

    if (!viewConfig) {
      const allUserViews = (await ctx.db
        .query('views')
        .collect()) as UserViewData[];

      // TODO REFACTOR AND USE SAME IN ALL PLACES
      const userView = allUserViews.find(
        (v) => v.name.toLowerCase() === args.viewName.toLowerCase()
      );

      viewConfig = getViewByName(views, userView?.baseView ?? '');

      if (!viewConfig) {
        console.error('viewConfig is not defined', args.viewName);
        throw new Error(`viewConfig is not defined: ${args.viewName}`);
      }
    }

    const viewConfigManager = new BaseViewConfigManager(
      patchViewConfig(viewConfig)
    );

    const registeredViews = patchAllViews(views);

    const result = await viewLoaderHandler(ctx, {
      ...(args as QueryDto),
      viewConfig,
      viewConfigManager,
      registeredViews,
    } satisfies QueryDto);

    return result;
  };

export const makeViewMutationHandler =
  (views: RegisteredViews) => (ctx: any, args: MutationDto) => {
    const viewConfig = getViewByName(views, args.viewName);

    if (!viewConfig) throw new Error('viewConfig22 is not defined');

    const viewConfigManager = new BaseViewConfigManager(
      patchViewConfig(viewConfig)
    );

    const registeredViews = patchAllViews(views);

    return viewMutationHandler(ctx, {
      ...args,
      mutation: args.mutation,
      viewConfigManager,
      registeredViews,
      viewId: null,
    } satisfies MutationPropsServer);
  };
