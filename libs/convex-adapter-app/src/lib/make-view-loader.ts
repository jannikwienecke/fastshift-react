import { RegisteredViews, QueryDto } from '@apps-next/core';
import { GenericQueryCtx } from './_internal/convex.server.types';
import { viewLoaderHandler } from './convex-view-loader';

export const makeViewLoaderHandler =
  (views: RegisteredViews) => (ctx: GenericQueryCtx, args: any) => {
    const viewConfig = views[args['viewName'] as any as keyof typeof views];

    return viewLoaderHandler(ctx, {
      ...(args as QueryDto),
      viewConfig,
      registeredViews: views,
    } satisfies QueryDto);
  };
