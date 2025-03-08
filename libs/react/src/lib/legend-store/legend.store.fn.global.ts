import { getViewByName, makeData, RelationalDataModel } from '@apps-next/core';
import { StoreFn } from './legend.store.types';
import { batch } from '@legendapp/state';
import { displayOptionsProps } from './legend.store.derived.displayOptions';

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
      store$.viewConfigManager.get().getTableName?.()
    )(data);

    store$.dataModel.set(dataModel);
  };

export const init: StoreFn<'init'> =
  (store$) =>
  (data, relationalData, viewConfigManager, views, viewFieldsConfig) => {
    batch(() => {
      store$.fetchMore.assign({
        isDone: false,
        currentCursor: {
          position: null,
          cursor: null,
        },
        nextCursor: {
          position: null,
          cursor: null,
        },
        isFetched: false,
        isFetching: true,
      });
      store$.views.set(views);
      store$.viewConfigManager.set(viewConfigManager);
      store$.viewFieldsConfig.set(viewFieldsConfig);
      store$.filter.filters.set([]);

      store$.displayOptions.viewField.selected.set(
        store$.viewConfigManager.getViewFieldList().map((field) => field.name)
      );

      displayOptionsProps.set({});

      store$.displayOptions.sorting.assign({
        isOpen: false,
        rect: null,
        field: undefined,
        order: 'asc',
      });
      store$.displayOptions.grouping.assign({
        isOpen: false,
        rect: null,
        field: undefined,
      });
    });

    createDataModel(store$)(data);
    createRelationalDataModel(store$)(relationalData);
  };
