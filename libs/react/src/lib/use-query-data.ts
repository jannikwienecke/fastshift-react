import { DataModelNew, RecordType } from '@apps-next/core';
import React from 'react';
import { store$ } from './legend-store/legend.store';
import {
  useDetailQuery,
  useQuery,
  useRelationalFilterQuery,
  useRelationalQuery,
} from './use-query';
import { currentView$ } from './legend-store';

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

  const relationalFilterQueryReturn = useRelationalFilterQuery();

  const dataModel = store$.dataModel.get() as DataModelNew<QueryReturnType[0]>;
  const relationalDataModel = store$.relationalDataModel.get();

  const queryReturnRef = React.useRef(queryReturn);
  const relationalQueryReturnRef = React.useRef(relationalQueryReturn);
  const detailQueryReturnRef = React.useRef(detailQueryReturn);
  const relationalFilterQueryReturnRef = React.useRef(
    relationalFilterQueryReturn
  );

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
    relationalFilterQueryReturnRef.current = relationalFilterQueryReturn;
  }, [relationalFilterQueryReturn]);

  React.useEffect(() => {
    if (!queryReturn.data || queryReturn.isPending) {
      // if (store$.state.get() === 'invalidated') {
      //   setTimeout(() => {
      //     store$.state.set('mutating');
      //   }, 10);
      // }
      return;
    }

    store$.handleIncomingData(queryReturnRef.current);
  }, [queryReturn.data, queryReturn.isPending]);

  React.useEffect(() => {
    if (!relationalQueryReturn.relationalData) return;

    store$.handleIncomingRelationalData(relationalQueryReturnRef.current);
  }, [relationalQueryReturn.relationalData]);

  React.useEffect(() => {
    if (!detailQueryReturn.data || detailQueryReturn.data.length !== 1) return;
    if (!store$.detail.row.get()) return;

    store$.handleIncomingDetailData(detailQueryReturnRef.current);
  }, [detailQueryReturn.data]);

  const viewName = currentView$.get()?.viewName;
  React.useEffect(() => {
    if (!relationalFilterQueryReturn.data) return;

    store$.handleIncomingRelationalFilterData(
      relationalFilterQueryReturnRef.current.data
    );
  }, [relationalFilterQueryReturn.data, viewName]);

  return {
    dataModel,
    relationalDataModel,
  };
};
