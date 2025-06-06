import {
  DisplayOptionsProps,
  MakeDisplayOptionsPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  derviedDisplayOptions,
  displayOptionsProps,
} from './legend.displayOptions.derived.js';

export const makeDisplayOptionsProps = <T extends RecordType>(
  options?: MakeDisplayOptionsPropsOptions<T>
): DisplayOptionsProps => {
  displayOptionsProps.set(options ?? {});

  return derviedDisplayOptions.get();
};
