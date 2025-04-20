import {
  DEFAULT_FETCH_LIMIT_QUERY,
  getViewByName,
  makeQueryKey,
  QueryDto,
  QueryProps,
  QueryReturnDto,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import {
  DefinedUseQueryResult,
  useQuery as useTanstackQuery,
} from '@tanstack/react-query';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { getParsedViewSettings } from './legend-store/legend.utils.helper';
import { PrismaContextType } from './query-context';
import { useApi } from './use-api';
import { useView } from './use-view';
import { getViewConfigManager } from './legend-store/legend.utils';

export const useStableQuery = (api: PrismaContextType, args: QueryDto) => {
  const queryOptions = api.makeQueryOptions
    ? api.makeQueryOptions({
        ...args,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registeredViews: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modelConfig: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        disabled: undefined as any,
        viewConfigManager: undefined,
        viewName: args.viewConfig?.viewName ?? '',
        relationQuery: args.relationQuery,
        filters: args.relationQuery?.tableName ? '' : args.filters ?? '',
      })
    : {
        queryKey: makeQueryKey({
          viewName: args.viewConfig?.viewName ?? '',
          query: args.query ?? null,
          relation: args.relationQuery?.tableName ?? null,
          filters: args.filters ?? null,
          displayOptions: args.displayOptions ?? null,
        }),
        queryFn: () => {
          return api.prisma?.viewLoader(args);
        },
      };

  const result = useTanstackQuery({
    ...queryOptions,
    enabled: !args.viewConfig
      ? false
      : // @ts-expect-error ---
      args.paginateOptions?.isDone
      ? false
      : args.disabled === true
      ? false
      : true,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    retry: import.meta.env.DEV ? 0 : 3,
  } as any);

  if (result.error) {
    console.error('USE QUERY', args.viewName);
    console.error('ERROR', result.error);
  }

  const stored = React.useRef(result as any);

  if (result.data !== undefined) {
    stored.current = result;
  } else {
    stored.current = {
      ...result,
      data: stored.current?.data,
    };
  }

  return stored.current;
};

export const useRelationalQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();
  const { registeredViews, viewConfigManager } = useView();

  const view = store$.commandform.view.get();

  const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
    useStableQuery(prisma, {
      registeredViews: queryProps?.registeredViews ?? registeredViews,
      query: '',
      modelConfig:
        queryProps?.viewConfigManager?.modelConfig ||
        viewConfigManager.modelConfig,
      viewConfig: getViewByName(
        registeredViews,
        view?.viewName ?? viewConfigManager?.viewConfig?.viewName ?? ''
      ),

      // registeredViews[
      //   view?.viewName ?? viewConfigManager.viewConfig.viewName
      // ],
      displayOptions: '',
      paginateOptions: undefined,
      disabled:
        view?.viewName && view.viewName !== viewConfigManager?.getViewName()
          ? false
          : true,
      viewId: null,
      onlyRelationalData: true,
    });

  return {
    ...queryReturn,
    allIds: queryReturn.data?.allIds ?? [],
    data: queryReturn.data?.data ?? [],
    relationalData: queryReturn.data?.relationalData ?? {},
    continueCursor: queryReturn.data?.continueCursor,
    isDone: queryReturn.data?.isDone,
  };
};

// export const useDetailQuery = <QueryReturnType extends RecordType[]>(
//   queryProps?: Partial<QueryProps>
// ): QueryReturnOrUndefined<QueryReturnType[0]> => {
//   const prisma = useApi();
//   const { registeredViews, viewConfigManager } = useView();

//   const detail = store$.detail.get();
//   console.log({ detail });

//   const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
//     useStableQuery(prisma, {
//       registeredViews: queryProps?.registeredViews ?? registeredViews,
//       query: '',
//       modelConfig:
//         queryProps?.viewConfigManager?.modelConfig ||
//         viewConfigManager.modelConfig,
//       viewConfig: getViewByName(
//         registeredViews,
//         viewConfigManager.getViewName()
//       ),

//       // registeredViews[
//       //   view?.viewName ?? viewConfigManager.viewConfig.viewName
//       // ],
//       displayOptions: '',
//       paginateOptions: undefined,
//       disabled: !detail?.row?.id,
//       viewId: detail?.row?.id ?? null,
//       onlyRelationalData: false,
//     });

//   // React.useEffect(() => {
//   //   console.log('USE DETAIL QUERY', queryReturn.data);
//   // }, [queryReturn.data]);

//   console.log('USE DETAIL QUERY', queryReturn.data);
//   return {
//     ...queryReturn,
//     allIds: queryReturn.data?.allIds ?? [],
//     data: queryReturn.data?.data ?? [],
//     relationalData: queryReturn.data?.relationalData ?? {},
//     continueCursor: queryReturn.data?.continueCursor,
//     isDone: queryReturn.data?.isDone,
//   };
// };

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();
  const { registeredViews } = useView();

  const viewConfigManager = store$.viewConfigManager.get();

  const query = store$.globalQueryDebounced.get();

  const parsedViewSettings = getParsedViewSettings();

  const cursor = store$.fetchMore.currentCursor.get();

  const queryPropsMerged = React.useMemo(() => {
    return {
      ...queryProps,
      query: queryProps?.query || query,
      registeredViews: queryProps?.registeredViews ?? registeredViews,
      modelConfig:
        queryProps?.viewConfigManager?.modelConfig ||
        viewConfigManager.modelConfig,
      viewConfig:
        queryProps?.viewConfigManager?.viewConfig ||
        viewConfigManager.viewConfig,
      filters: queryProps?.relationQuery ? '' : parsedViewSettings?.filters,
      displayOptions: queryProps?.relationQuery
        ? ''
        : parsedViewSettings?.displayOptions,
      paginateOptions: {
        cursor: cursor,
        numItems: DEFAULT_FETCH_LIMIT_QUERY,
        // isDone: isDone,
      },
      viewId: null,

      parentViewName: store$.detail.parentViewName.get() ?? null,
      parentId: store$.detail.row.get()?.id ?? null,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    };
  }, [
    query,
    queryProps,
    registeredViews,
    viewConfigManager.modelConfig,
    viewConfigManager.viewConfig,
    cursor,
    parsedViewSettings,
  ]);

  const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
    useStableQuery(prisma, queryPropsMerged);

  return {
    ...queryReturn,
    allIds: queryReturn.data?.allIds ?? [],
    data: queryReturn.data?.data ?? [],
    relationalData: queryReturn.data?.relationalData ?? {},
    continueCursor: queryReturn.data?.continueCursor,
    isDone: queryReturn.data?.isDone,
  };
};
