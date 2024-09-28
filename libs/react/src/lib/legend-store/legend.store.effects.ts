import { Observable, observable } from '@legendapp/state';
import { LegendStore } from './legend.store.types';

export const addEffects = (store$: Observable<LegendStore>) => {
  observable(function handleResetCombobox() {
    const listRelationField = store$.list.selectedRelationField.get();
    const filterField = store$.filter.selectedField.get();
    const filterDateField = store$.filter.selectedDateField.get();
    const filterOperatorField = store$.filter.selectedOperatorField.get();

    if (
      !listRelationField &&
      !filterField &&
      !filterDateField &&
      !filterOperatorField
    ) {
      store$.combobox.selected.set([]);
      store$.combobox.values.set(null);
      store$.combobox.query.set('');
      store$.combobox.multiple.set(false);
    }
  }).onChange(() => null);
};
