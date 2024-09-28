import { makeRow } from '@apps-next/core';
import {
  ComboboxInitPayload,
  LegendStore,
} from '../../legend-store/legend.store.types';
import { helper } from './feature.combobox.shared';
import { DEFAULT_COMBOBOX_STATE } from '../../legend-store/legend.store.constants';

export const EnumInitializer = (
  store: LegendStore['combobox'],
  payload: ComboboxInitPayload
): LegendStore['combobox'] => {
  const { selected } = payload;

  const { id, field } = helper(payload);
  if (!field?.enum) throw new Error('Invalid field');

  const values = field.enum.values.map((v) => {
    return makeRow(v.name, v.name, v.name, field);
  });

  const multiple =
    payload.multiple !== undefined
      ? payload.multiple
      : Boolean(field?.relation?.manyToManyRelation);

  const _selected =
    typeof selected === 'string'
      ? [makeRow(selected, selected, selected, field)]
      : Array.isArray(selected)
      ? selected
      : [selected];

  return {
    ...DEFAULT_COMBOBOX_STATE,
    ...payload,
    id,
    open: true,
    values,
    fallbackData: values,
    multiple,
    selected: _selected,
  };
};
