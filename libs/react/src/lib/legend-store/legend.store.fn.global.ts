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
  (data, relationalData, viewConfigManager, views, uiViewConfig) => {
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
      store$.uiViewConfig.set(uiViewConfig);
      store$.filter.filters.set([]);

      if (!store$.viewConfigManager.get()) return;

      const viewFields = store$.viewConfigManager
        .get()
        .getViewFieldList()
        .map((field) => field.name);

      store$.displayOptions.viewField.selected.set(viewFields);
      store$.displayOptions.viewField.allFields.set(viewFields);

      store$.displayOptions.showDeleted.set(
        !!viewConfigManager.viewConfig.query?.showDeleted
      );

      store$.displayOptions.softDeleteEnabled.set(
        !!viewConfigManager.viewConfig.mutation?.softDelete
      );

      const defaultSorting =
        store$.viewConfigManager.viewConfig.query.sorting.get();

      const defaultGrouping =
        store$.viewConfigManager.viewConfig.query.grouping.get();

      const sortingField = defaultSorting?.field
        ? viewConfigManager.getFieldByRelationFieldName(
            defaultSorting.field.toString()
          )
        : undefined;

      const groupByField = defaultGrouping?.field
        ? viewConfigManager.getFieldByRelationFieldName(
            defaultGrouping.field.toString()
          )
        : undefined;

      displayOptionsProps.set({});

      store$.displayOptions.sorting.assign({
        isOpen: false,
        rect: null,
        field: sortingField,
        order: defaultSorting?.direction || 'asc',
      });
      store$.displayOptions.grouping.assign({
        isOpen: false,
        rect: null,
        field: groupByField,
      });
    });

    createDataModel(store$)(data);
    createRelationalDataModel(store$)(relationalData);
  };
