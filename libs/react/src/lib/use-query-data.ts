import { DataModelNew, RecordType } from '@apps-next/core';
import { useSetAtom } from 'jotai';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { QueryStore, updateQueryDataAtom } from './query-store';
import { useQuery } from './use-query';

export const useQueryData = <QueryReturnType extends RecordType[]>(): Pick<
  QueryStore<QueryReturnType>,
  'dataModel' | 'relationalDataModel'
> => {
  const updateQueryData = useSetAtom(updateQueryDataAtom);

  const { data, relationalData } = useQuery();
  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType>;
  const relationalDataModel = store$.relationalDataModel.get();

  React.useEffect(() => {
    store$.createDataModel(data ?? []);
    store$.createRelationalDataModel(relationalData ?? {});

    updateQueryData({
      dataRaw: data || [],
      relationalDataRaw: relationalData || {},
    });
  }, [data, relationalData, updateQueryData]);

  // const queryStoreMemo = React.useMemo(() => {
  //   // when having two views (one is server side and one is client side)
  //   // when switching views, the query store is not updated yet
  //   const viewNameConfigManager = viewConfigManager?.getViewName();
  //   const viewNameStore = queryStore.viewName;

  //   if (viewNameConfigManager !== viewNameStore) {
  //     return {
  //       ...queryStore,
  //       dataModel: { rows: [] },
  //     };
  //   }

  //   return queryStore;
  // }, [queryStore, viewConfigManager]);

  return {
    dataModel,
    relationalDataModel,
  };
};
