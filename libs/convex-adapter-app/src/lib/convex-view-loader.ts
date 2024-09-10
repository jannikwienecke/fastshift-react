import { invarant, QueryDto, QueryReturnDto } from '@apps-next/core';
import { getData } from './_internal/convex-get-data';
import { getRelationalData } from './_internal/convex-get-relational-data';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';
import { ConvexViewConfigManager } from './convex-view-config';

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<QueryReturnDto> => {
  const args = _args as QueryDto;

  const viewConfigManager = new ConvexViewConfigManager(
    args.viewConfig as any,
    args.modelConfig
  );

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  return {
    data: await getData(ctx, viewConfigManager, args),
    relationalData: await getRelationalData(ctx, viewConfigManager, args),
  };
};
