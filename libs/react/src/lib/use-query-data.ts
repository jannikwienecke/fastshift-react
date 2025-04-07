import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { useQuery, useRelationalQuery } from './use-query';

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
  const relationalQueryReturn = useRelationalQuery();

  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType>;
  const relationalDataModel = store$.relationalDataModel.get();

  const queryReturnRef = React.useRef(queryReturn);
  const relationalQueryReturnRef = React.useRef(relationalQueryReturn);
  React.useEffect(() => {
    queryReturnRef.current = queryReturn;
  }, [queryReturn]);

  React.useEffect(() => {
    relationalQueryReturnRef.current = relationalQueryReturn;
  }, [relationalQueryReturn]);

  React.useEffect(() => {
    if (!queryReturn.data) return;

    store$.handleIncomingData(queryReturnRef.current);
  }, [queryReturn.data]);

  React.useEffect(() => {
    if (!relationalQueryReturn.relationalData) return;
    if (!store$.commandform.view.get()) return;

    store$.handleIncomingRelationalData(relationalQueryReturnRef.current);
  }, [relationalQueryReturn.relationalData]);

  return {
    dataModel,
    relationalDataModel,
  };
};
