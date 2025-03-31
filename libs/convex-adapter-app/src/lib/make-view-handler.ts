/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseViewConfigManager,
  getViewByName,
  MutationDto,
  MutationPropsServer,
  QueryDto,
  RegisteredViews,
} from '@apps-next/core';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';
import { viewMutationHandler } from './view-mutation';

export const makeViewLoaderHandler =
  (views: RegisteredViews) => (ctx: GenericQueryCtx, args: any) => {
    const viewConfig = views[args['viewName'] as any as keyof typeof views];

    console.log('MakeViewLoaderHandler', { views, args, viewConfig });

    return viewLoaderHandler(ctx, {
      ...(args as QueryDto),
      viewConfig,
      registeredViews: views,
    } satisfies QueryDto);
  };

export const makeViewMutationHandler =
  (views: RegisteredViews) => (ctx: any, args: MutationDto) => {
    const viewConfig = getViewByName(views, args.viewName);
    const viewConfigManager = new BaseViewConfigManager(viewConfig);

    return viewMutationHandler(ctx, {
      ...args,
      mutation: args.mutation,
      viewConfigManager,
      registeredViews: views,
    } satisfies MutationPropsServer);
  };
