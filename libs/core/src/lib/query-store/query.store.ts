'use client';

import { atom } from 'jotai';
import { QueryStore } from './query.types';
import {
  DataModel,
  getViewConfigAtom,
  Model,
  QueryRelationalData,
  RecordType,
  registeredViewsAtom,
  viewConfigManagerAtom,
} from '@apps-next/core';

export const queryStoreAtom = atom<QueryStore<RecordType>>({
  dataRaw: [] as RecordType[],
  dataModel: {} as Model<RecordType>,
  relationalDataRaw: {} as QueryRelationalData,
  relationalDataModel: {} as {
    [key: string]: Model<RecordType>;
  },
  loading: false,
  error: null,
  page: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  isInitialized: false,
});

export const updateQueryDataAtom = atom<
  null,
  [Pick<QueryStore<RecordType>, 'dataRaw' | 'relationalDataRaw'>],
  void
>(null, (get, set, queryStore) => {
  const registeredViews = get(registeredViewsAtom);
  const viewConfigManager = get(getViewConfigAtom);

  const dataModel = Model.create(
    queryStore.dataRaw,
    viewConfigManager,
    registeredViews
  );

  const relationalDataModel = Object.entries(
    queryStore.relationalDataRaw
  ).reduce((acc, [key, data]) => {
    acc[key] = Model.create(data, viewConfigManager, registeredViews);
    return acc;
  }, {} as { [key: string]: Model<RecordType> });

  set(queryStoreAtom, {
    ...get(queryStoreAtom),
    dataRaw: queryStore.dataRaw,
    dataModel,
    relationalDataRaw: queryStore.relationalDataRaw,
    relationalDataModel,
  });
});
