import {
  DisplayOptionsProps,
  MakeDisplayOptionsPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  derviedDisplayOptions,
  displayOptionsProps,
} from '../../legend-store/legend.store.derived.displayOptions';

export const makeDisplayOptionsProps = <T extends RecordType>(
  options?: MakeDisplayOptionsPropsOptions<T>
): DisplayOptionsProps => {
  // TODO HIER WEITER MACHEN
  // if sorting field is passed -> this must be used - currently only used for showing in ui but not actully used for sorting
  // if no sorting default field is passed -> its always sorted by creation date -> show in ui (By Creation Date)

  displayOptionsProps.set(options);
  return derviedDisplayOptions.get();
};
