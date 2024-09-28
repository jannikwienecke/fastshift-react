import { makeRow } from '@apps-next/core';
import { helper } from './feature.combobox.shared';
import {
  ComboboxInitPayload,
  LegendStore,
} from '../../legend-store/legend.store.types';
import { DEFAULT_COMBOBOX_STATE } from '../../legend-store/legend.store.constants';

export const BooleanInitializer = (
  store: LegendStore['combobox'],
  payload: ComboboxInitPayload
): LegendStore['combobox'] => {
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
