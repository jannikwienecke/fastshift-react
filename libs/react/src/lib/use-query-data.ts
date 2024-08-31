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

  const { data, relationalData } = useQuery();

  const updatedRef = React.useRef(false);
  React.useEffect(() => {
    if (data && relationalData) {
      updatedRef.current = true;

      updateQueryData({
        dataRaw: data || [],
        relationalDataRaw: relationalData || {},
      });
    }
  }, [data, relationalData, updateQueryData]);

  return queryStore;
};
