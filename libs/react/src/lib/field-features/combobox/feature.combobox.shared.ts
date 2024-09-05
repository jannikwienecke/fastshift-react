import { FieldType } from '@apps-next/core';
import {
  ComboboxInitPayload,
  ComboboxStore,
} from '../../ui-adapter/combox-adapter/_combobox.store/store';

type ComboboxInitialize = (
  store: ComboboxStore,
  action: ComboboxInitPayload
) => ComboboxStore;

export type ComboboxInitDict = Partial<{
  [key in FieldType]: ComboboxInitialize;
}>;

export const helper = (payload: ComboboxInitPayload) => {
  const { row, field } = payload;

  if (!row || !field) throw new Error('Invalid payload');
  const id = row.id + field.name;

  return {
    ...payload,
    row,
    field,
    id,
  };
};
