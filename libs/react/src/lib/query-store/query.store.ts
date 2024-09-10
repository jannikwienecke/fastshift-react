import { atom } from 'jotai';

import { QueryStore } from './query.types';
import {
  RecordType,
  QueryRelationalData,
  DataModelNew,
  makeData,
} from '@apps-next/core';
import { getViewConfigAtom, registeredViewsAtom } from '../stores';

export const queryStoreAtom = atom<QueryStore<RecordType>>({
  dataModel: {} as DataModelNew<RecordType>,
  relationalDataModel: {} as {
    [key: string]: DataModelNew<RecordType>;
  },
  loading: false,
  error: null,
  page: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  isInitialized: false,
  viewName: '',
});

export const updateQueryDataAtom = atom<
  null,
  [
    {
      dataRaw: RecordType[];
      relationalDataRaw: QueryRelationalData;
    }
  ],
  void
>(null, (get, set, { dataRaw, relationalDataRaw }) => {
  const registeredViews = get(registeredViewsAtom);
  const viewConfigManager = get(getViewConfigAtom);

  const dataModel = makeData(
    registeredViews,
    viewConfigManager.getViewName()
  )(dataRaw);

  const relationalDataModel = Object.entries(relationalDataRaw).reduce(
    (acc, [tableName, data]) => {
      const viewConfig = registeredViews[tableName];

      acc[tableName] = makeData(registeredViews, viewConfig?.tableName)(data);
      return acc;
    },
    {} as { [key: string]: DataModelNew }
  );

  set(queryStoreAtom, {
    ...get(queryStoreAtom),
    viewName: viewConfigManager.getViewName(),
    dataModel,
    relationalDataModel: {
      ...get(queryStoreAtom).relationalDataModel,
      ...relationalDataModel,
    },
  });
});
