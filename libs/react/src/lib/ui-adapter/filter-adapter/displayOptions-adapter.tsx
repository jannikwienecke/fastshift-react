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
  console.log('set: options', options);

  displayOptionsProps.set(options);
  return derviedDisplayOptions.get();
};
