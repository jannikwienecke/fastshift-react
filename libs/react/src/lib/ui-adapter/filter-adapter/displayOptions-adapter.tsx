import {
  DisplayOptionsProps,
  MakeDisplayOptionsPropsOptions,
  RecordType,
  TranslationKeys,
} from '@apps-next/core';
import { store$ } from '../../legend-store';

export const makeDisplayOptionsProps = <T extends RecordType>(
  options?: MakeDisplayOptionsPropsOptions<T>
): DisplayOptionsProps => {
  const { sorting, ...props } = store$.displayOptions.get();
  const sortingDefaultField = store$.viewConfigManager.getFieldBy(
    options?.sorting.defaultSortingField.toString() ?? ''
  );

  return {
    ...props,

    onOpen: () => store$.displayOptionsOpen(),
    onClose: () => null,

    label:
      options?.label ??
      ('displayOptions.button.label' satisfies TranslationKeys),

    sorting: {
      ...sorting,
      field: sorting.field ?? sortingDefaultField,
      onOpen: store$.displayOptionsOpenSorting,
      onClose: () => null,
    },
  } satisfies DisplayOptionsProps;
};
