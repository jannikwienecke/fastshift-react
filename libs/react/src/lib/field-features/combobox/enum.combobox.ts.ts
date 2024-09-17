import { makeRow } from '@apps-next/core';
import {
  ComboboxInitPayload,
  ComboboxStore,
  DEFAULT_STORE,
} from '../../ui-adapter/combox-adapter/_combobox.store/store';
import { helper } from './feature.combobox.shared';

export const EnumInitializer = (
  store: ComboboxStore,
  payload: ComboboxInitPayload
): ComboboxStore => {
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

  return {
    ...DEFAULT_STORE,
    ...payload,
    id,
    open: true,
    values,
    fallbackData: values,

    multiple,
    selected: [
      makeRow(
        selected.toString(),
        selected.toString(),
        selected.toString(),
        field
      ),
    ],
  };
};
