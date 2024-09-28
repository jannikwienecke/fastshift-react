import { getRelationTableName } from '@apps-next/core';
import {
  ComboboxInitPayload,
  LegendStore,
} from '../../legend-store/legend.store.types';
import { helper } from './feature.combobox.shared';
import { DEFAULT_COMBOBOX_STATE } from '../../legend-store/legend.store.constants';

export const ReferenceInitializer = (
  store: LegendStore['combobox'],
  payload: ComboboxInitPayload
): LegendStore['combobox'] => {
  const { id, field, selected, defaultData } = helper(payload);

  if (!Array.isArray(selected) && typeof selected !== 'object') {
    return store;
  }

  const table = getRelationTableName(payload.field);

  const defaultValues = defaultData?.rows ?? [];

  const selectedValues = Array.isArray(selected)
    ? selected
    : selected.id
    ? [selected]
    : [];

  const values = [...selectedValues, ...defaultValues];
  const uniqueIds = Array.from(new Set(values.map((v) => v.id)));
  const uniqueValues = uniqueIds
    .map((id) => values.find((v) => v.id === id))
    .filter((v) => v !== undefined);

  const multiple =
    payload.multiple !== undefined
      ? payload.multiple
      : Boolean(field?.relation?.manyToManyRelation);

  return {
    ...DEFAULT_COMBOBOX_STATE,
    ...payload,
    id,
    tableName: table,
    open: true,
    values: uniqueValues,
    selected: selectedValues,
    fallbackData: uniqueValues,
    multiple,
  };
};
