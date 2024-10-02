import { DEFAULT_COMBOBOX_STATE } from '../../legend-store/legend.store.constants';
import { ComboboxInitPayload } from '../../legend-store/legend.store.types';
import { BooleanInitializer } from './boolean.combobox';
import { EnumInitializer } from './enum.combobox.ts';
import { ComboboxInitDict } from './feature.combobox.shared';
import { ReferenceInitializer } from './reference.combobox';

export * from './feature.combobox.shared';

export const ComboboInitDict: ComboboxInitDict = {
  Boolean: BooleanInitializer,
  Reference: ReferenceInitializer,
  OneToOneReference: ReferenceInitializer,
  Enum: EnumInitializer,
};

export const comboboInitialize = (action: ComboboxInitPayload) => {
  const type = action.field?.type;
  if (!action.field) return DEFAULT_COMBOBOX_STATE;
  if (!type) throw new Error('Combobox type is required');

  const initialize = ComboboInitDict[type];
  return initialize ? initialize(action) : DEFAULT_COMBOBOX_STATE;
};
