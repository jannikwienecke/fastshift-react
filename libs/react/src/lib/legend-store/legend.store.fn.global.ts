import { getViewByName, makeData, RelationalDataModel } from '@apps-next/core';
import { StoreFn } from './legend.store.types';

export const createRelationalDataModel: StoreFn<'createRelationalDataModel'> =
  (store$) => (data) => {
    const relationalDataModel = Object.entries(data).reduce(
      (acc, [tableName, data]) => {
        const viewConfig = getViewByName(store$.views.get(), tableName);
        const _data = makeData(store$.views.get(), viewConfig?.viewName)(data);

        acc[tableName] = _data;
        return acc;
      },
      {} as RelationalDataModel
    );

    store$.relationalDataModel.set({
      ...store$.relationalDataModel.get(),
      ...relationalDataModel,
    });
  };

export const createDataModel: StoreFn<'createDataModel'> =
  (store$) => (data) => {
    const dataModel = makeData(
      store$.views.get(),
      store$.viewConfigManager.get().getTableName()
    )(data);

    store$.dataModel.set(dataModel);
  };

export const init: StoreFn<'init'> =
  (store$) =>
  (data, relationalData, viewConfigManager, views, viewFieldsConfig) => {
    store$.views.set(views);
    store$.viewConfigManager.set(viewConfigManager);
    store$.viewFieldsConfig.set(viewFieldsConfig);

    createDataModel(store$)(data);
    createRelationalDataModel(store$)(relationalData);
  };
