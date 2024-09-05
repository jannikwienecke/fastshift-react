import {
  ComboboxInitPayload,
  ComboboxStore,
  DEFAULT_STORE,
} from '../../ui-adapter/combox-adapter/_combobox.store/store';
import { helper } from './feature.combobox.shared';

export const ReferenceInitializer = (
  store: ComboboxStore,
  payload: ComboboxInitPayload
): ComboboxStore => {
  const { id, field, selected, defaultData } = helper(payload);

  if (!Array.isArray(selected) && typeof selected !== 'object') {
    return store;
  }

  const table = payload.field?.relation?.tableName ?? '';
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

  const multiple = Boolean(field?.relation?.manyToManyRelation);

  return {
    ...DEFAULT_STORE,
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
