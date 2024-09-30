import {
  FilterPrimitiveType,
  FilterRelationType,
  makeRow,
  Row,
} from '@apps-next/core';
import { Observable } from '@legendapp/state';
import {
  FILTER_SPECIFIC,
  filterUtil,
  operator,
} from '../ui-adapter/filter-adapter';
import { StoreFn } from './legend.store.types';

export const filterOpen: StoreFn<'filterOpen'> = (store$) => (rect) => {
  store$.filter.open.set(true);
  store$.filter.rect.set(rect);
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
  store$.filter.showDatePicker.set(false);
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
      const row = makeRow(
        selected.id.toString(),
        selected.id.toString(),
        selected.id,
        selectedField
      );

      const thisId = selected.id.toString();
      const currentIds = store$.filter.selectedIds.get();
      store$.filter.selectedIds.set(
        currentIds.includes(thisId)
          ? currentIds.filter((id) => id !== thisId)
          : [...currentIds, thisId]
      );
      store$.filterSelectFilterValue(row);
    } else if (selectedDateField && selected.id === FILTER_SPECIFIC) {
      store$.filter.showDatePicker.set(true);
    } else if (selectedDateField) {
      const row = makeRow(
        selected.id.toString(),
        selected.id.toString(),
        selected.id,
        selectedDateField
      );

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
        store$.filter.selectedDateField.set(field);
      } else {
        store$.filter.selectedField.set(field);
        store$.filter.open.set(false);
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
    if (field?.type === 'Date' && value.id === FILTER_SPECIFIC) {
      store$.filter.showDatePicker.set(true);
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
      const filter = getByIndex(existingFilterIndex).get();

      if (!exitingFilter || exitingFilter.type !== 'relation') return;
      if (filter.type !== 'relation') return;

      const _ = (
        getByIndex(existingFilterIndex) as Observable<FilterRelationType>
      ).values.set([...exitingFilter.values, value]);

      getByIndex(existingFilterIndex).operator.set(operator().value(filter));
    };

    const removeFilterValue = (value: Row) => {
      const filter = getByIndex(existingFilterIndex).get();
      if (!exitingFilter || exitingFilter.type !== 'relation') return;
      if (filter.type !== 'relation') return;

      (
        store$.filter.filters[
          existingFilterIndex
        ] as Observable<FilterRelationType>
      ).values.set(exitingFilter.values.filter((v) => v.id !== value.id));
    };

    const resetFilter = () => {
      if (field.type !== 'Date') return;
      if (store$.filter.showDatePicker.get()) return;

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
    store$.filter.rect.set(rect);

    if (filter.field.type === 'Date') {
      store$.filter.selectedDateField.set(filter.field);
    } else {
      store$.filter.selectedField.set(filter.field);
    }

    if (!filter.field.relation) {
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
