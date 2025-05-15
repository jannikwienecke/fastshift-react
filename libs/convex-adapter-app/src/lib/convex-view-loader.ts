import {
  BaseViewConfigManager,
  getViewByName,
  invarant,
  parseDisplayOptionsStringForServer,
  parseFilterStringForServer,
  QueryDto,
  QueryReturnDto,
  QueryServerProps,
  RecordType,
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

  // console.warn('____'VIEW LOADER START', {
  //   ...args,
  //   modelConfig: undefined,
  //   viewConfigManager: undefined,
  //   registeredViews: undefined,
  //   viewConfig: undefined,
  // });

  const viewConfigManager = args.viewConfigManager;
  if (!viewConfigManager) throw new Error('viewConfigManager is not defined');

  // console.info(args.parentId);
  // "filters": "filter[]=projects:is:j978hgpasa3s6pzej5j22abh2x7e86mf||Learn%20Spanish:relation;false",

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

  invarant(Boolean(viewConfigManager), 'viewConfig.... is not defined');

  // let historyDataForView:
  let historyData: RecordType[] | undefined = undefined;
  const viewConfig = getViewByName(serverProps.registeredViews, 'history');
  if (args.viewId && viewConfig) {
    const filter = `filter[]=entityId:contains:${args.viewId}||${args.viewId}:primitive;false`;

    const viewConfigManager = new BaseViewConfigManager({
      ...viewConfig,
      localMode: { enabled: true },
    });
    const parsedFilters = parseFilterStringForServer(filter, viewConfigManager);

    const res = await getData(ctx, {
      ...serverProps,
      filters: parsedFilters,
      viewName: 'history',
      viewConfigManager,
      viewId: null,
    });

    historyData = res.data;
  }

  const getDataRes =
    args.onlyRelationalData === true
      ? {
          continueCursor: { position: null, cursor: null },
          isDone: true,
          allIds: [],
          data: [],
        }
      : await getData(ctx, serverProps);

  const { data, continueCursor, isDone, allIds } = getDataRes;

  const relationalData = await getRelationalData(ctx, serverProps);

  return {
    allIds: allIds?.map((id) => id.toString()) ?? [],
    continueCursor,
    isDone,
    data,
    relationalData,
    historyData,
  };
};
