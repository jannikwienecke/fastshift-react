import { atom } from 'jotai';

import {
  DataModelNew,
  getViewByName,
  makeData,
  QueryRelationalData,
  RecordType,
} from '@apps-next/core';
import { getViewConfigAtom, registeredViewsAtom } from '../stores';
import { QueryStore } from './query.types';

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
      const viewConfig = getViewByName(registeredViews, tableName);
      const _data = makeData(registeredViews, viewConfig?.viewName)(data);

      acc[tableName] = _data;
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
