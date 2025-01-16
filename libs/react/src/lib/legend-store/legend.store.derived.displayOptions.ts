import {
  DisplayOptionsProps,
  MakeDisplayOptionsPropsOptions,
  TranslationKeys,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const displayOptionsProps = observable<
  MakeDisplayOptionsPropsOptions | undefined
>(undefined);

export const derviedDisplayOptions = observable(() => {
  const options = displayOptionsProps.get();

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
      onOpen: (...props) => store$.displayOptionsOpenSorting(...props),
      onClose: () => null,
    },
  } satisfies DisplayOptionsProps;
});
