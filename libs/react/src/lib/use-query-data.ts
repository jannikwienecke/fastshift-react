import { RecordType } from '@apps-next/core';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { QueryStore, queryStoreAtom, updateQueryDataAtom } from './query-store';
import { useQuery } from './use-query';
import { useView } from './use-view';
import { store$ } from './legend-store/legend.store';

export const useQueryData = <
  QueryReturnType extends RecordType[]
>(): QueryStore<QueryReturnType[0]> => {
  const queryStore = useAtomValue(queryStoreAtom);
  const updateQueryData = useSetAtom(updateQueryDataAtom);

  const { viewConfigManager } = useView();
  const { data, relationalData } = useQuery();

  React.useEffect(() => {
    store$.createDataModel(data ?? []);
    store$.createRelationalDataModel(relationalData ?? {});

    updateQueryData({
      dataRaw: data || [],
      relationalDataRaw: relationalData || {},
    });
  }, [data, relationalData, updateQueryData]);

  const queryStoreMemo = React.useMemo(() => {
    // when having two views (one is server side and one is client side)
    // when switching views, the query store is not updated yet
    const viewNameConfigManager = viewConfigManager?.getViewName();
    const viewNameStore = queryStore.viewName;

    if (viewNameConfigManager !== viewNameStore) {
      return {
        ...queryStore,
        dataModel: { rows: [] },
      };
    }

    return queryStore;
  }, [queryStore, viewConfigManager]);

  return queryStoreMemo;
};
