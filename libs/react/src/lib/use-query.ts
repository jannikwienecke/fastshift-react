'use client';

import {
  QueryProps,
  QueryReturnOrUndefined,
  RecordType,
} from '@apps-next/core';
import { atom, useAtomValue } from 'jotai';
import React from 'react';
import { debouncedQueryAtom } from './ui-components';
import { useView } from './use-view';

export const queryDataAtom = atom<QueryReturnOrUndefined<RecordType>>({
  data: [],
  relationalData: {},
  isLoading: false,
  isError: false,
  error: undefined,
  isFetching: false,
  isFetched: false,
  refetch: () => null,
} as QueryReturnOrUndefined<RecordType>);

export const queryPropsAtom = atom<{
  [queryKey: string]: Partial<QueryProps>;
}>({});

export const useQueryAtom = atom<typeof useQuery>();

export const useQuery = <QueryReturnType extends RecordType[]>(
  queryProps?: Partial<QueryProps>
): QueryReturnOrUndefined<QueryReturnType[0]> => {
  const useQueryAdapter = useAtomValue(useQueryAtom) as typeof useQuery;

  const { viewConfigManager, registeredViews } = useView();
  const query = useAtomValue(debouncedQueryAtom);

  const resturnData = useQueryAdapter<QueryReturnType>({
    ...queryProps,
    registeredViews,
    modelConfig: viewConfigManager.modelConfig,
    query: queryProps?.query || query,
    viewConfigManager: queryProps?.viewConfigManager ?? viewConfigManager,
  });

  React.useEffect(() => {
    if (resturnData.error) {
      console.error('Use Query Error: ', resturnData.error);
    }
  }, [resturnData.error]);

  return resturnData;
};
