import {
  invarant,
  QueryDto,
  QueryReturnDto,
  ViewConfigType,
} from '@apps-next/core';
import { getData } from './_internal/convex-get-data';
import { getRelationalData } from './_internal/convex-get-relational-data';
import { handleRelationalTableQuery } from './_internal/convex-relational-query';
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
    args.viewConfig as ViewConfigType,
    args.modelConfig
  );

  if (args.relationQuery?.tableName) {
    return handleRelationalTableQuery({ ctx, args });
  }

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  return {
    data: await getData(ctx, viewConfigManager, args),
    relationalData: await getRelationalData(ctx, viewConfigManager, args),
  };
};
