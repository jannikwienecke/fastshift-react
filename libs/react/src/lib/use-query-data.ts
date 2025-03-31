import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { useQuery } from './use-query';

export type QueryStore<T extends RecordType> = {
  dataModel: DataModelNew<T>;

  relationalDataModel: {
    [key: string]: DataModelNew<T>;
  };
};

export const useQueryData = <QueryReturnType extends RecordType[]>(): Pick<
  QueryStore<QueryReturnType>,
  'dataModel' | 'relationalDataModel'
> => {
  const queryReturn = useQuery();

  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType>;
  const relationalDataModel = store$.relationalDataModel.get();

  const queryReturnRef = React.useRef(queryReturn);
  React.useEffect(() => {
    queryReturnRef.current = queryReturn;
  }, [queryReturn]);

  React.useEffect(() => {
    if (!queryReturn.data) return;

    store$.handleIncomingData(queryReturnRef.current);
  }, [queryReturn.data]);

  return {
    dataModel,
    relationalDataModel,
  };
};
