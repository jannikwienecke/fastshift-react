import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { QueryClientProvider, QueryOptions } from '@tanstack/react-query';
import { ConvexProvider } from 'convex/react';
import { ConvexQueryProviderProps, ViewLoader } from './_internal/types.convex';

import {
  BaseViewConfigManager,
  convertDisplayOptionsForBackend,
  DEFAULT_FETCH_LIMIT_QUERY,
  QueryProps,
  ViewConfigType,
} from '@apps-next/core';
import { QueryContext } from '@apps-next/react';
import React from 'react';

export const ConvexQueryProvider = (props: ConvexQueryProviderProps) => {
  const { queryClient, convex } = props;

  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <ProviderContent {...props} />
      </QueryClientProvider>
    </ConvexProvider>
  );
};

const ProviderContent = (props: ConvexQueryProviderProps) => {
  const mutationFn = useConvexMutation(props.viewMutation);

  const makeQueryOptions = React.useCallback(
    (args: QueryProps) => {
      const return_ = convexQuery(props.viewLoader, {
        ...args,
        viewConfig: undefined,
        registeredViews: undefined,
      });

      return return_ as QueryOptions;
    },
    [props.viewLoader]
  );

  return (
    <QueryContext.Provider
      value={{
        mutationFn,

        makeQueryOptions,

        config: props.globalConfig.config,
        provider: 'default',
      }}
    >
      {props.children}
    </QueryContext.Provider>
  );
};

const makeQuery = (viewLoader: ViewLoader, viewConfig: ViewConfigType) => {
  const sorting = viewConfig.query?.sorting;
  const sortingFieldName = sorting?.field;
  const groupingFieldName = viewConfig.query?.grouping?.field;

  const viewConfigManager = new BaseViewConfigManager(viewConfig, {});

  const sortingField = viewConfigManager.getSortingField(
    sortingFieldName?.toString()
  );

  const groupingField = groupingFieldName
    ? viewConfigManager.getFieldByRelationFieldName(
        groupingFieldName?.toString()
      )
    : undefined;

  const parsedDisplayOptions = convertDisplayOptionsForBackend({
    sorting: {
      isOpen: false,
      rect: null,
      field: sortingField,
      order: sorting?.direction ?? 'asc',
    },
    grouping: { isOpen: false, rect: null, field: groupingField },
    isOpen: false,
    showEmptyGroups: false,
    showDeleted: false,
    softDeleteEnabled: false,
    viewField: { allFields: [], selected: [] },
    viewType: { type: 'list' },
  });

  return convexQuery(viewLoader, {
    viewName: viewConfig.viewName,
    query: '',
    filters: '',
    displayOptions: parsedDisplayOptions ?? null,
    paginateOptions: {
      cursor: { position: null, cursor: null },
      numItems: DEFAULT_FETCH_LIMIT_QUERY,
    },
  });
};

// const makeQuery = (viewLoader: ViewLoader, viewConfig: ViewConfigType) => {
//   const sortingFieldName = viewConfig.query?.sorting?.field;
//   const groupingFieldName = viewConfig.query?.grouping?.field;

//   const viewConfigManager = new BaseViewConfigManager(viewConfig, {});

//   const sortingField = sortingFieldName
//     ? viewConfigManager.getFieldByRelationFieldName(
//         sortingFieldName?.toString()
//       )
//     : undefined;

//   const groupingField = groupingFieldName
//     ? viewConfigManager.getFieldByRelationFieldName(
//         groupingFieldName?.toString()
//       )
//     : undefined;

//   const parsedDisplayOptions = convertDisplayOptionsForBackend({
//     sorting: { isOpen: false, rect: null, field: sortingField, order: 'asc' },
//     grouping: { isOpen: false, rect: null, field: groupingField },
//     isOpen: false,
//     showEmptyGroups: false,
//     showDeleted: false,
//     softDeleteEnabled: false,
//     viewField: { allFields: [], selected: [] },
//     viewType: { type: 'list' },
//   });

//   return convexQuery(viewLoader, {
//     viewName: viewConfig.viewName,
//     query: '',
//     filters: '',
//     displayOptions: parsedDisplayOptions ?? null,
//     paginateOptions: {
//       cursor: { position: null, cursor: null },
//       numItems: DEFAULT_FETCH_LIMIT_QUERY,
//       // isDone: false,
//     },
//   });
// };

export const preloadQuery = (
  viewLoader: ConvexContext['viewLoader'],
  viewConfig: ViewConfigType
) => makeQuery(viewLoader, viewConfig);

// then -> we need to fetch data -> then add data to prev data
// and then handle the same for id based queries

export const getQueryKeyFn =
  (viewLoader: ViewLoader) => (viewConfig: ViewConfigType) =>
    makeQuery(viewLoader, viewConfig).queryKey;

export type ConvexContext = {
  viewLoader: ViewLoader;
};

export type ConvexPreloadQuery = (viewConfig: ViewConfigType) => void;
