import { makeRow } from '@apps-next/core';
import { DEFAULT_COMBOBOX_STATE } from '../../legend-store/legend.store.constants';
import {
  ComboboxInitPayload,
  ComboboxState,
} from '../../legend-store/legend.store.types';
import { helper } from './feature.combobox.shared';

export const BooleanInitializer = (
  payload: ComboboxInitPayload
): ComboboxState => {
  const { id, field, selected } = helper(payload);

  const values = [
    makeRow('true', 'true', true, field),
    makeRow('false', 'false', false, field),
  ];

  return {
    ...DEFAULT_COMBOBOX_STATE,
    ...payload,
    id,
    open: true,
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
