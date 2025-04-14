import {
  FilterPrimitiveType,
  FilterRelationType,
  makeRow,
  makeRowFromValue,
  Row,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import {
  SELECT_FILTER_DATE,
  filterUtil,
  operator,
} from '../ui-adapter/filter-adapter';
import { StoreFn } from './legend.store.types';
import { selectState$ } from './legend.select-state';

export const filterOpen: StoreFn<'filterOpen'> = (store$) => (rect) => {
  store$.openSpecificModal('filter', () => {
    store$.filter.open.set(true);
    store$.filter.rect.set(rect);
  });
};

export const filterClose: StoreFn<'filterClose'> = (store$) => () => {
  store$.filter.open.set(false);
  store$.filter.query.set('');
  store$.filter.values.set([]);
  store$.filter.rect.set(null);
};

export const filterCloseAll: StoreFn<'filterCloseAll'> = (store$) => () => {
  store$.filterClose();
  store$.filter.selectedField.set(null);
  store$.filter.selectedOperatorField.set(null);
  store$.filter.selectedDateField.set(null);
};

export const filterUpdateQuery: StoreFn<'filterUpdateQuery'> =
  (store$) => (query) => {
    store$.filter.query.set(query);
  };

// handle filtering from filter list
export const filterSelectFilterType: StoreFn<'filterSelectFilterType'> =
  (store$) => (selected) => {
    const id = selected.id.toString();
    const viewConfigManager = store$.viewConfigManager.get();

    const selectedOperatorField = store$.filter.selectedOperatorField.get();
    const selectedDateField = store$.filter.selectedDateField.get();
    const selectedField = store$.filter.selectedField.get();

    if (selectedField?.type === 'Boolean' || selectedField?.enum) {
      const row = makeRowFromValue(selected.id.toString(), selectedField);

      const thisId = selected.id.toString();
      const currentIds = store$.filter.selectedIds.get();
      store$.filter.selectedIds.set(
        currentIds.includes(thisId)
          ? currentIds.filter((id) => id !== thisId)
          : [...currentIds, thisId]
      );
      store$.filterSelectFilterValue(row);
    } else if (selectedDateField) {
      const row = makeRowFromValue(selected.id.toString(), selectedDateField);

      store$.filterSelectFilterValue(row);
    } else if (selectedOperatorField) {
      store$.filter.filters.set(
        store$.filter.filters.get().map((f) => {
          if (f.field.name === selectedOperatorField.name) {
            return filterUtil().update(f, selected);
          }
          return f;
        })
      );

      filterCloseAll(store$)();
    } else {
      const field = viewConfigManager.getFieldBy(id);

      if (field.type === 'Boolean' || field.enum) {
        store$.filter.selectedField.set(field);
      } else if (field.type === 'Date') {
        store$.filter.selectedField.set(field);
      } else {
        store$.filter.selectedField.set(field);
        store$.filter.query.set('');
      }
    }
  };

export const filterSelectFilterValue: StoreFn<'filterSelectFilterValue'> =
  (store$) => (value) => {
    const field =
      store$.filter.selectedField.get() ||
      store$.filter.selectedDateField.get();

    if (!field) return;
    if (field?.type === 'Date' && value.id === SELECT_FILTER_DATE) {
      store$.filter.open.set(false);
      store$.filter.selectedField.set(null);
      return;
    }

    const filter = {
      field,
      value,
    };

    const filters = store$.filter.filters.get();

    const exitingFilter = filters.find(
      (f) => f.field.name === filter.field.name
    );

    const existingFilterIndex = filters.findIndex(
      (f) => f.field.name === filter.field.name
    );

    const getByIndex = (index: number) => {
      return store$.filter.filters[index];
    };

    const updateFilterValue = (value: Row) => {
      const filter = getByIndex(existingFilterIndex)?.get();

      if (!exitingFilter || exitingFilter.type !== 'relation') return;
      if (!filter || filter.type !== 'relation') return;

      const _ = (
        getByIndex(existingFilterIndex) as Observable<FilterRelationType>
      ).values.set([...exitingFilter.values, value]);

      const newOperator = operator().value(filter);
      getByIndex(existingFilterIndex)?.operator.set(newOperator);
    };

    const removeFilterValue = (value: Row) => {
      const filter = getByIndex(existingFilterIndex)?.get();
      if (!exitingFilter || exitingFilter.type !== 'relation') return;
      if (filter?.type !== 'relation') return;

      (
        store$.filter.filters[
          existingFilterIndex
        ] as Observable<FilterRelationType>
      ).values.set(exitingFilter.values.filter((v) => v.id !== value.id));

      const newOperator = operator().value(filter);
      getByIndex(existingFilterIndex)?.operator.set(newOperator);
    };

    const resetFilter = () => {
      if (field.type !== 'Date') return;

      filterCloseAll(store$)();
    };

    if (!exitingFilter) {
      const newFilter = filterUtil().create(filter);
      store$.filter.filters.set([...filters, newFilter]);
    }

    if (exitingFilter && exitingFilter.type === 'relation') {
      const exitingValue = exitingFilter.values.find(
        (v) => v.id === filter.value.id
      );

      if (exitingValue) {
        removeFilterValue(filter.value);

        if (exitingFilter.values.length === 0) {
          store$.filter.filters.set(
            filters.filter((f) => f.field.name !== filter.field.name)
          );
        }
      } else {
        updateFilterValue(filter.value);
      }
    }

    if (exitingFilter && exitingFilter.type === 'primitive') {
      const newFilter = filterUtil().create(filter);

      (
        store$.filter.filters[
          existingFilterIndex
        ] as Observable<FilterPrimitiveType>
      ).set({
        ...exitingFilter,
        ...newFilter,
        type: 'primitive',
      });
    }
    resetFilter();
  };

export const filterRemoveFilter: StoreFn<'filterRemoveFilter'> =
  (store$) => (filterToRemove) => {
    const name = filterToRemove.field.name;

    const filters = store$.filter.filters.get();
    const filter = filters.find((f) => f.field.name === name);

    if (filter) {
      store$.filter.filters.set(filters.filter((f) => f.field.name !== name));
    }
  };

export const filterOpenExisting: StoreFn<'filterOpenExisting'> =
  (store$) => (filter, rect) => {
    const currentFilters = store$.filter.filters.get();
    const selectedFilter = currentFilters.find(
      (f) => f.field.name === filter.field.name
    );

    setTimeout(() => {
      if (selectedFilter?.type === 'relation') {
        selectState$.initialSelectedFilterRows.set(selectedFilter.values);
      }
    }, 0);

    store$.filter.rect.set(rect);

    store$.filter.selectedField.set(filter.field);

    if (filter.field.type !== 'String') {
      store$.filter.open.set(true);
    }
  };

export const filterOpenOperator: StoreFn<'filterOpenOperator'> =
  (store$) => (filter, rect) => {
    store$.filter.rect.set(rect);
    store$.filter.selectedOperatorField.set(filter.field);
    store$.filter.selectedField.set(null);
    store$.filter.open.set(true);
  };

export const filterSelectFromDatePicker: StoreFn<
  'filterSelectFromDatePicker'
> = (store$) => (date) => {
  const field = store$.filter.selectedDateField.get();
  if (!field) return;

  filterSelectFilterValue(store$)(
    makeRow(date.toISOString(), date.toDateString(), date.toISOString(), field)
  );
};
