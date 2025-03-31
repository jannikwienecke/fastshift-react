import {
  BaseViewConfigManager,
  invarant,
  parseDisplayOptionsStringForServer,
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
      allIds: [],
      continueCursor: { position: null, cursor: null },
      isDone: true,
    };
  }

  const viewConfigManager = new BaseViewConfigManager(
    args.viewConfig as ViewConfigType
  );

  const parsedFilters = parseFilterStringForServer(
    args.filters ?? '',
    viewConfigManager
  );

  const parsedDisplayOptions = parseDisplayOptionsStringForServer(
    args.displayOptions ?? '',
    viewConfigManager
  );

  const serverProps: QueryServerProps = {
    ...args,
    viewConfigManager,
    filters: parsedFilters,
    displayOptions: parsedDisplayOptions,
  };

  if (args.relationQuery?.tableName) {
    const { data } = await handleRelationalTableQuery({
      ctx,
      args: serverProps,
    });
    return {
      data,
      continueCursor: { position: null, cursor: null },
      isDone: true,
      allIds: [],
    };
  }

  invarant(Boolean(viewConfigManager), 'viewConfig is not defined');

  const { data, continueCursor, isDone, allIds } = await getData(
    ctx,
    serverProps
  );

  return {
    allIds: allIds?.map((id) => id.toString()) ?? [],
    continueCursor,
    isDone,
    data,
    relationalData: await getRelationalData(ctx, serverProps),
  };
};
