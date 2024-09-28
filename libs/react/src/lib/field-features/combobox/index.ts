import {
  ComboboxInitPayload,
  LegendStore,
} from '../../legend-store/legend.store.types';
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

export const comboboInitialize = (
  store: LegendStore['combobox'],
  action: ComboboxInitPayload
) => {
  const type = action.field?.type;
  if (!type) return store;

  const initialize = ComboboInitDict[type];
  return initialize ? initialize(store, action) : store;
};
