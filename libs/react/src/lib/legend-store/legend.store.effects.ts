import { _log, FilterType } from '@apps-next/core';
import { Observable, observable } from '@legendapp/state';
import { comboboxDebouncedQuery$ } from './legend.combobox.helper';
import { selectState$, xSelect } from './legend.select-state';
import { comboboxStore$ } from './legend.store.derived.combobox';
import { LegendStore } from './legend.store.types';
import { _hasOpenDialog$, hasOpenDialog$ } from './legend.utils';

export const addEffects = (store$: Observable<LegendStore>) => {
  const timeout$ = observable<number | null>(null);

  const normalizeFilters = (filters: FilterType[]) => {
    return filters
      .sort((a, b) => a.field.name.localeCompare(b.field.name))
      .map((f) => {
        const { field, operator, type } = f;

        if (type === 'relation') {
          const sortedValues = f.values.sort((a, b) =>
            a.label.localeCompare(b.label)
          );
          const ids = sortedValues.map((v) => v.id).join(';');
          return `field:${f.field.name},operator:${operator.label},ids:${ids}`;
        } else {
          return `field:${field.name},operator:${operator.label},value:${f.value.id}`;
        }
      });
  };

  observable(function handleResetCombobox() {
    const listRelationField = store$.list.selectedRelationField.get();
    const filterField = store$.filter.selectedField.get();
    const filterDateField = store$.filter.selectedDateField.get();
    const filterOperatorField = store$.filter.selectedOperatorField.get();
    const commandbarField = store$.commandbar.selectedViewField.get();

    if (
      !listRelationField &&
      !filterField &&
      !filterDateField &&
      !filterOperatorField &&
      !commandbarField
    ) {
      store$.combobox.selected.set([]);
      store$.combobox.values.set(null);
      store$.combobox.query.set('');
      store$.combobox.multiple.set(false);
      store$.combobox.datePicker.set(null);
      xSelect.close();
    }

    let timeout: NodeJS.Timeout;
    store$.combobox.query.onChange(() => {
      clearTimeout(timeout);

      if (store$.combobox.query.get() === '') {
        comboboxDebouncedQuery$.set('');
      } else {
        timeout = setTimeout(() => {
          comboboxDebouncedQuery$.set(store$.combobox.query.get());
        }, 200);
      }
    });
  }).onChange(() => null);

  observable(function handleQueryCommandbarChange() {
    const query = store$.commandbar.query.get();

    const fieldCommandbar = store$.commandbar.selectedViewField.get();

    if (!fieldCommandbar?.name) return;

    comboboxStore$.query.set(query ?? '');
    store$.combobox.query.set(query ?? '');
  }).onChange(() => null);

  observable(function handleFilterChange() {
    const filters = store$.filter.filters.get();

    _log.debug('handleFilterChange: ', filters);

    store$.state.set('filter-changed');

    if (store$.viewConfigManager.localModeEnabled.get()) {
      _log.debug('handleFilterChange: local mode. No fetchMore');
    } else {
      store$.fetchMore.assign({
        isDone: false,
        currentCursor: { cursor: null, position: null },
        nextCursor: { cursor: null, position: null },
      });
    }
  }).onChange(() => null);

  observable(function handleDisplayOptionsChange() {
    const showDeleted = store$.displayOptions.showDeleted.get();
    const field = store$.displayOptions.sorting.field.get();
    const order = store$.displayOptions.sorting.order.get();
    const grouping = store$.displayOptions.grouping.field.get();
    const showEmptyGroups = store$.displayOptions.showEmptyGroups.get();

    if (field?.name || grouping?.name || showEmptyGroups || showDeleted) {
      _log.debug(
        'handleDisplayOptionsChange: ',
        field?.name,
        order,
        grouping?.name,
        showEmptyGroups,
        showDeleted
      );
    }

    store$.state.set('updating-display-options');

    if (store$.viewConfigManager.localModeEnabled.get()) {
      _log.debug('handleDisplayOptionsChange: local mode. No fetchMore');
    } else {
      store$.fetchMore.assign({
        isDone: false,
        currentCursor: { cursor: null, position: null },
        nextCursor: { cursor: null, position: null },
      });
    }
  }).onChange(() => null);

  _hasOpenDialog$.onChange((state) => {
    clearTimeout(timeout$.get() ?? 0);
    timeout$.set(null);

    if (state.value) {
      hasOpenDialog$.set(true);
    } else {
      const timeout = window.setTimeout(() => {
        hasOpenDialog$.set(false);
      }, 1);

      timeout$.set(timeout);
    }
  });

  store$.state.onChange((changes) => {
    const userViewSettings = store$.userViewSettings.get();

    if (userViewSettings.initialSettings !== null) return;

    const filters = store$.filter.filters.get();
    const displayOptions = {
      ...store$.displayOptions.get(),
      isOpen: undefined,
    };

    const copyOfDisplayOptions = JSON.parse(JSON.stringify(displayOptions));
    const copyOfFilters = JSON.parse(JSON.stringify(filters));

    store$.userViewSettings.initialSettings.set({
      displayOptions: copyOfDisplayOptions,
      filters: copyOfFilters,
    });
  });

  store$.displayOptions.onChange((changes) => {
    const initial =
      store$.userViewSettings.initialSettings.displayOptions.get();
    const value = {
      ...changes.value,
      isOpen: undefined,
    };

    const groupingField = value.grouping.field?.name;
    const sortingField = value.sorting.field?.name;
    const sortingOrder = value.sorting.order;
    const showEmptyGroups = value.showEmptyGroups;
    const showDeleted = value.showDeleted;
    const selectedViewFields = value.viewField.hidden;

    const initialGroupingField = initial?.grouping.field?.name;
    const initialSortingField = initial?.sorting.field?.name;
    const initialSortingOrder = initial?.sorting.order;
    const initialShowEmptyGroups = initial?.showEmptyGroups;
    const initialShowDeleted = initial?.showDeleted;
    const initialSelectedViewFields = initial?.viewField.hidden;

    const anythingChanged = () => {
      let changed = false;

      if (groupingField !== initialGroupingField) {
        _log.debug('groupingField changed:', {
          from: initialGroupingField,
          to: groupingField,
        });
        changed = true;
      }
      if (sortingField !== initialSortingField) {
        _log.debug('sortingField changed:', {
          from: initialSortingField,
          to: sortingField,
        });
        changed = true;
      }
      if (sortingOrder !== initialSortingOrder) {
        _log.debug('sortingOrder changed:', {
          from: initialSortingOrder,
          to: sortingOrder,
        });
        changed = true;
      }
      if (showEmptyGroups !== initialShowEmptyGroups) {
        _log.debug('showEmptyGroups changed:', {
          from: initialShowEmptyGroups,
          to: showEmptyGroups,
        });
        changed = true;
      }
      if (showDeleted !== initialShowDeleted) {
        _log.debug('showDeleted changed:', {
          from: initialShowDeleted,
          to: showDeleted,
        });
        changed = true;
      }

      if (
        (selectedViewFields &&
          !selectedViewFields?.every((field) =>
            initialSelectedViewFields?.includes(field)
          )) ||
        (initialSelectedViewFields &&
          !initialSelectedViewFields?.every((field) =>
            selectedViewFields?.includes(field)
          ))
      ) {
        _log.debug('selectedViewFields changed:', {
          from: initialSelectedViewFields,
          to: selectedViewFields,
        });
        changed = true;
      }

      return changed;
    };

    store$.userViewSettings.hasChanged.set(anythingChanged());
  });

  store$.filter.filters.onChange((changes) => {
    const initial = normalizeFilters(
      store$.userViewSettings.initialSettings.filters.get() ?? []
    );
    const currentFilters = normalizeFilters(changes.value);

    const filtersChanged =
      JSON.stringify(initial) !== JSON.stringify(currentFilters);

    store$.userViewSettings.hasChanged.set(filtersChanged);
  });

  store$.filter.filters.onChange((changes) => {
    _log.debug('filters: ', changes);

    const valuesChanged = changes.changes?.[0].path?.[1] === 'values';
    const index = +changes.changes?.[0].path?.[0];
    const newFilter =
      changes.changes?.[0].valueAtPath?.length &&
      changes.changes?.[0].valueAtPath.length > 0;

    if (newFilter && !valuesChanged) {
      const filter = changes.value.slice(-1)[0];
      if (!filter) return;
      if (filter.type === 'relation') {
        selectState$.selectedFilterRows.set(filter.values);
      }
    }

    if (valuesChanged) {
      const filter = changes.value[index];

      if (!filter) return;

      if (filter.type === 'relation') {
        selectState$.selectedFilterRows.set(filter.values);
      }
    }
  });
};
