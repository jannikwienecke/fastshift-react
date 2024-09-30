import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { QueryStore } from './query-store';
import { useQuery } from './use-query';

export const useQueryData = <QueryReturnType extends RecordType[]>(): Pick<
  QueryStore<QueryReturnType>,
  'dataModel' | 'relationalDataModel'
> => {
  const { data, relationalData } = useQuery();
  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType>;
  const relationalDataModel = store$.relationalDataModel.get();

  React.useEffect(() => {
    store$.createDataModel(data ?? []);
    store$.createRelationalDataModel(relationalData ?? {});
  }, [data, relationalData]);

  return {
    dataModel,
    relationalDataModel,
  };
};
