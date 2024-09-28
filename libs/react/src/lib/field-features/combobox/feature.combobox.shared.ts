import { FieldType } from '@apps-next/core';
import {
  ComboboxInitPayload,
  ComboboxState,
} from '../../legend-store/legend.store.types';

type ComboboxInitialize = (action: ComboboxInitPayload) => ComboboxState;

export type ComboboxInitDict = Partial<{
  [key in FieldType]: ComboboxInitialize;
}>;

export const helper = (payload: ComboboxInitPayload) => {
  const { row, field } = payload;

  if (!field) throw new Error('Invalid payload');
  const id = row ? row.id : 'no-id' + field.name;

  return {
    ...payload,
    row,
    field,
    id,
  };
};
