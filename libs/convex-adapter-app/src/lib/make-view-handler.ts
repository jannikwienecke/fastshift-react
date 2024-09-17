/* eslint-disable @typescript-eslint/no-explicit-any */
import { MutationProps, QueryDto, RegisteredViews } from '@apps-next/core';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';
import { viewMutationHandler } from './view-mutation';
import { getViewByName } from '@apps-next/react';

export const makeViewLoaderHandler =
  (views: RegisteredViews) => (ctx: GenericQueryCtx, args: any) => {
    const viewConfig = views[args['viewName'] as any as keyof typeof views];

    return viewLoaderHandler(ctx, {
      ...(args as QueryDto),
      viewConfig,
      registeredViews: views,
    } satisfies QueryDto);
  };

export const makeViewMutationHandler =
  (views: RegisteredViews) => (ctx: any, args: any) => {
    return viewMutationHandler(ctx, {
      ...(args as MutationProps),
      viewConfig: getViewByName(views, args['viewName']),
      registeredViews: views,
    } satisfies QueryDto);
  };
