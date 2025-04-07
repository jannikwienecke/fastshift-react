import {
  convertDisplayOptionsForBackend,
  convertFiltersForBackend,
  DEFAULT_FETCH_LIMIT_QUERY,
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
import { PrismaContextType } from './query-context';
import { useApi } from './use-api';
import { useView } from './use-view';

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
    // @ts-expect-error ---
    enabled: args.paginateOptions?.isDone
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
      viewConfig:
        registeredViews[
          view?.viewName ?? viewConfigManager.viewConfig.viewName
        ],
      displayOptions: '',
      paginateOptions: undefined,
      disabled: view?.viewName ? false : true,
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

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();
  const { registeredViews, viewConfigManager } = useView();

  const query = store$.globalQueryDebounced.get();
  const filters = store$.filter.filters.get();
  const displayOptions = store$.displayOptions.get();
  const parsedFilters = convertFiltersForBackend(filters);
  const parsedDisplayOptions = convertDisplayOptionsForBackend(displayOptions);

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
      filters: parsedFilters,
      displayOptions: parsedDisplayOptions,
      paginateOptions: {
        cursor: cursor,
        numItems: DEFAULT_FETCH_LIMIT_QUERY,
        // isDone: isDone,
      },

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
    parsedFilters,
    cursor,
    parsedDisplayOptions,
    // isDone,
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
