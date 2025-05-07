import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import { useDetailQuery, useQuery, useRelationalQuery } from './use-query';

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

  const detailQueryReturn = useDetailQuery();

  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType[0]>;
  const relationalDataModel = store$.relationalDataModel.get();

  const queryReturnRef = React.useRef(queryReturn);
  const relationalQueryReturnRef = React.useRef(relationalQueryReturn);
  const detailQueryReturnRef = React.useRef(detailQueryReturn);

  React.useEffect(() => {
    queryReturnRef.current = queryReturn;
  }, [queryReturn]);

  React.useEffect(() => {
    relationalQueryReturnRef.current = relationalQueryReturn;
  }, [relationalQueryReturn]);

  React.useEffect(() => {
    detailQueryReturnRef.current = detailQueryReturn;
  }, [detailQueryReturn]);

  React.useEffect(() => {
    if (!queryReturn.data || queryReturn.isPending) return;

    store$.handleIncomingData(queryReturnRef.current);
  }, [queryReturn.data, queryReturn.isPending]);

  React.useEffect(() => {
    if (!relationalQueryReturn.relationalData) return;
    if (
      !store$.commandform.view.get() &&
      !store$.detail.useTabsForComboboxQuery.get()
    )
      return;

    store$.handleIncomingRelationalData(relationalQueryReturnRef.current);
  }, [relationalQueryReturn.relationalData]);

  React.useEffect(() => {
    if (!detailQueryReturn.data || detailQueryReturn.data.length !== 1) return;
    if (!store$.detail.row.get()) return;

    store$.handleIncomingDetailData(detailQueryReturnRef.current);
  }, [detailQueryReturn.data]);

  return {
    dataModel,
    relationalDataModel,
  };
};
