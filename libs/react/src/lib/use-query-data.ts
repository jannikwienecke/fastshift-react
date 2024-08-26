import {
  QueryStore,
  queryStoreAtom,
  RecordType,
  updateQueryDataAtom,
} from '@apps-next/core';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useQuery } from './use-query';

export const useQueryData = <
  QueryReturnType extends RecordType[]
>(): QueryStore<QueryReturnType[0]> => {
  const queryStore = useAtomValue(queryStoreAtom);
  const updateQueryData = useSetAtom(updateQueryDataAtom);

  const { data } = useQuery();

  React.useEffect(() => {
    updateQueryData({
      dataRaw: data || [],
    });
  }, [data, updateQueryData]);

  return queryStore;
};
