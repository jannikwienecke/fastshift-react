import {
  DEFAULT_FETCH_LIMIT_QUERY,
  makeQueryKey,
  NONE_OPTION,
  QueryDto,
  QueryProps,
  QueryReturnDto,
  QueryReturnOrUndefined,
  RecordType,
  RelationalFilterQueryDto,
} from '@apps-next/core';
import {
  DefinedUseQueryResult,
  useQuery as useTanstackQuery,
} from '@tanstack/react-query';
import {} from 'convex-helpers/react';
import React from 'react';
import { currentView$ } from './legend-store';
import { rightSidebarProps$ } from './legend-store/legend.rightsidebar.derived';
import { listRowIds$ } from './legend-store/legend.rightsidebar.state';
import { store$ } from './legend-store/legend.store';
import {
  getParsedViewSettings,
  localModeEnabled$,
} from './legend-store/legend.utils.helper';
import { PrismaContextType } from './query-context';
import { useApi } from './use-api';
import { useView } from './use-view';
export const useStableQuery = (api: PrismaContextType, args: QueryDto) => {
  const viewName = args.viewName ?? args.viewConfig?.viewName ?? '';

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
        viewName,
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
    ...(queryOptions ?? {}),
    enabled: !viewName
      ? false
      : args.disabled
      ? false
      : !args.viewConfig
      ? false
      : // @ts-expect-error ---
      args.paginateOptions?.isDone
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

  const { registeredViews } = useView();

  const viewConfig = store$.viewConfigManager?.viewConfig.get() ?? null;

  const parsedViewSettings = getParsedViewSettings();

  const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
    useStableQuery(prisma, {
      registeredViews: queryProps?.registeredViews ?? registeredViews,
      query: '',
      filters: parsedViewSettings?.filters,
      // filters: '',
      displayOptions: parsedViewSettings?.displayOptions,
      // displayOptions: '',
      modelConfig: undefined,
      viewConfig: viewConfig,
      paginateOptions: undefined,
      disabled: viewConfig ? false : true,
      viewId: null,
      onlyRelationalData: true,
      parentViewName: null,
      parentId: null,
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

export const useDetailQuery = <
  QueryReturnType extends RecordType[]
>(): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();

  const detail = store$.detail.get();

  const queryPropsMerged = React.useMemo(() => {
    return {
      registeredViews: store$.views.get(),
      viewConfig: detail?.viewConfigManager?.viewConfig,
      query: '',
      filters: '',
      displayOptions: '',
      paginateOptions: undefined,
      disabled: !detail?.row?.id,
      viewId: detail?.row?.id ?? null,
      parentId: undefined,
      modelConfig: undefined,
      parentViewName: undefined,
    };
  }, [detail?.row?.id, detail?.viewConfigManager?.viewConfig]);

  const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
    useStableQuery(prisma, queryPropsMerged);

  return {
    ...queryReturn,
    allIds: queryReturn.data?.allIds ?? [],
    data: queryReturn.data?.data ?? [],
    historyData: queryReturn.data?.historyData ?? [],
    relationalData: queryReturn.data?.relationalData ?? {},
    continueCursor: queryReturn.data?.continueCursor,
    isDone: queryReturn.data?.isDone,
  };
};

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const prisma = useApi();
  const { registeredViews } = useView();

  const viewConfigManager = store$.viewConfigManager.get();

  const query = store$.debouncedViewQuery.get();

  const parsedViewSettings = getParsedViewSettings();

  const cursor = store$.fetchMore.currentCursor.get();

  const parentId = store$.detail.row.get()?.id ?? null;
  const parentViewName = store$.detail.parentViewName.get() ?? null;

  const localMode = localModeEnabled$.get();

  const righSidebarFilter = store$.rightSidebar.filter.get();

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
      filters:
        queryProps?.relationQuery ||
        store$.detail.parentViewName.get() ||
        localMode
          ? ''
          : parsedViewSettings?.filters,
      displayOptions:
        queryProps?.relationQuery ||
        store$.detail.parentViewName.get() ||
        localMode
          ? ''
          : parsedViewSettings?.displayOptions,
      paginateOptions: {
        cursor: cursor,
        numItems: DEFAULT_FETCH_LIMIT_QUERY,
        // isDone: isDone,
      },
      viewId: null,
      // disabled: localMode ? true : false,
      parentViewName,
      parentId,
      tempFilter:
        righSidebarFilter?.id === NONE_OPTION
          ? `${righSidebarFilter?.tableName}:${righSidebarFilter?.id}`
          : righSidebarFilter?.id
          ? `${righSidebarFilter?.tableName}:${righSidebarFilter?.id}`
          : undefined,

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      viewConfigManager: undefined,
    };
  }, [
    queryProps,
    query,
    registeredViews,
    localMode,
    viewConfigManager.modelConfig,
    viewConfigManager.viewConfig,
    parsedViewSettings?.filters,
    parsedViewSettings?.displayOptions,
    cursor,
    parentViewName,
    parentId,
    righSidebarFilter,
  ]);

  const queryReturn: { data: QueryReturnDto } & DefinedUseQueryResult =
    useStableQuery(prisma, queryPropsMerged);

  const mergedPropsRef = React.useRef(queryPropsMerged);
  React.useEffect(() => {
    mergedPropsRef.current = queryPropsMerged;
  }, [queryPropsMerged]);

  React.useEffect(() => {
    if (!queryReturn?.data?.data) return;

    console.debug(
      '____USE QUERY NORMAL:: ',
      queryReturn?.data.data.length,
      'First:',
      queryReturn?.data?.data?.[0]
    );
  }, [queryReturn?.data?.data, queryReturn?.data?.relationalData]);

  return {
    ...queryReturn,
    allIds: queryReturn.data?.allIds ?? [],
    data: queryReturn.data?.data ?? [],
    relationalData: queryReturn.data?.relationalData ?? {},
    continueCursor: queryReturn.data?.continueCursor,
    isDone: queryReturn.data?.isDone,
  };
};

export const useRelationalFilterQuery = () => {
  const listRowIds = listRowIds$.get();

  const prisma = useApi();

  const result = useTanstackQuery({
    ...prisma.makeRelationalFilterOptions({
      ids: rightSidebarProps$.isOpen ? listRowIds : [],
      tableName: currentView$.tableName.get() || '',
      withCount: true,
    }),
    enabled: rightSidebarProps$.isOpen.get(),
  } as any);

  const stored = React.useRef(result as any);

  if (result.data !== undefined) {
    stored.current = result;
  } else {
    stored.current = {
      ...result,
      data: stored.current?.data,
    };
  }

  return stored.current as {
    data: RelationalFilterQueryDto;
  } & DefinedUseQueryResult<RelationalFilterQueryDto>;
};
