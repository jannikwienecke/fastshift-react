import {
  BaseViewConfigManager,
  invarant,
  parseFilterStringForServer,
  QueryDto,
  QueryReturnDto,
  QueryServerProps,
  ViewConfigType,
} from '@apps-next/core';
import { getData } from './_internal/convex-get-data';
import { getRelationalData } from './_internal/convex-get-relational-data';
import { handleRelationalTableQuery } from './_internal/convex-relational-query';
import {
  DefaultFunctionArgs,
  GenericQueryCtx,
} from './_internal/convex.server.types';

export const viewLoaderHandler = async (
  ctx: GenericQueryCtx,
  _args: DefaultFunctionArgs
): Promise<QueryReturnDto> => {
  const args = _args as QueryDto;

  if (args.relationQuery && !args.relationQuery.tableName) {
    return {
      data: [],
    };
  }

  console.log('LOADER::: ', args.query);

  const viewConfigManager = new BaseViewConfigManager(
    args.viewConfig as ViewConfigType,
    args.modelConfig
  );

  const parsedFilters = parseFilterStringForServer(
    args.filters ?? '',
    viewConfigManager
  );

  const serverProps: QueryServerProps = {
    ...args,
    viewConfigManager,
    filters: parsedFilters,
  };

  if (args.relationQuery?.tableName) {
    return handleRelationalTableQuery({ ctx, args: serverProps });
  }

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  return {
    data: await getData(ctx, serverProps),
    relationalData: await getRelationalData(ctx, serverProps),
  };
};
