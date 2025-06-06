import {
  BaseViewConfigManager,
  getViewByName,
  invarant,
  HistoryType,
  parseDisplayOptionsStringForServer,
  parseFilterStringForServer,
  QueryDto,
  QueryReturnDto,
  QueryServerProps,
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

  if (args.onlyRelationalData) {
    console.debug(`Loader:OnlyRelationalData:${args.viewName}`);
  } else {
    if (args.viewId) {
      console.debug(`Loader:Detail:${args.viewName}`);
    } else if (args.parentViewName) {
      console.debug(
        `Loader:SubView:${args.viewName}:Of:${args.parentViewName}`
      );
    } else if (args.viewName) {
      console.debug(`Loader:View:${args.viewName}`);
    }
  }

  const viewConfigManager = args.viewConfigManager;
  if (!viewConfigManager) throw new Error('viewConfigManager is not defined');
  // console.info(args.parentId);
  // "filters": "filter[]=projects:is:j978hgpasa3s6pzej5j22abh2x7e86mf||Learn%20Spanish:relation;false",

  // 'filter[]=projects:is:j970tn6yxftgmjj1et2zxfwa0d7gmchk||Learn%20Spanish:relation;false&filter[]=tags:is:jd73axh3m5h8npp060fmqe1q017gne6p||Quick:relation;false'

  // 'filter[]=projects:is%20any%20of:j9709cr389477jayjet0nmwqhet0nmwqnh7gmzgk||Home%20Renovation,j970tn6yxftgmjj1et2zxfwa0d7gmchk||Learn%20Spanish:relation;false'

  if (args.tempFilter) {
    // tempFilter example: "projects:1231312312"
    const [tableName, recordId] = args.tempFilter.split(':');
    if (args.filters) {
      // Check if the tableName already exists in filters
      const filterRegex = new RegExp(`filter\\[\\]=${tableName}:[^&]*`, 'g');
      const existingFilter = args.filters.match(filterRegex);

      if (existingFilter) {
        // Replace existing filter for the same table
        args.filters = args.filters.replace(
          filterRegex,
          `filter[]=${tableName}:is:${recordId}||nolabel:relation;false`
        );
      } else {
        // Add new filter
        args.filters = `${args.filters}&filter[]=${tableName}:is:${recordId}||nolabel:relation;false`;
      }
    } else {
      args.filters = `filter[]=${tableName}:is:${recordId}||nolabel:relation;false`;
    }
  }

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
  let historyData: HistoryType[] | undefined = undefined;
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

    historyData = res.data as HistoryType[];
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

  const relationalData = args.onlyRelationalData
    ? await getRelationalData(ctx, serverProps)
    : {};

  return {
    allIds: allIds?.map((id) => id.toString()) ?? [],
    continueCursor,
    isDone,
    data,
    relationalData,
    historyData,
  };
};
