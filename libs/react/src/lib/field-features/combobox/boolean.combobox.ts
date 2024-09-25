import { makeRow } from '@apps-next/core';
import {
  ComboboxInitPayload,
  ComboboxStore,
  DEFAULT_STORE,
} from '../../ui-adapter/combox-adapter/_combobox.store/store';
import { helper } from './feature.combobox.shared';

export const BooleanInitializer = (
  store: ComboboxStore,
  payload: ComboboxInitPayload
): ComboboxStore => {
  const { id, field, selected } = helper(payload);

  const values = [
    makeRow('true', 'true', true, field),
    makeRow('false', 'false', false, field),
  ];

  return {
    ...DEFAULT_STORE,
    ...payload,
    id,
    open: true,
    values,
    fallbackData: values,

    multiple: false,
    searchable: false,
    selected: Array.isArray(selected)
      ? selected
      : [
          makeRow(
            selected ? 'true' : 'false',
            selected ? 'true' : 'false',
            selected,
            field
          ),
        ],
  };
};
