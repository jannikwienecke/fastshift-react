import {
  DisplayOptionsViewField,
  DisplayOptionsProps,
  FieldConfig,
  MakeDisplayOptionsPropsOptions,
  TranslationKeys,
  INTERNAL_FIELDS,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const displayOptionsProps = observable<
  MakeDisplayOptionsPropsOptions | undefined
>(undefined);

export const derviedDisplayOptions = observable(() => {
  const options = displayOptionsProps.get();

  const { sorting, grouping, ...props } = store$.displayOptions.get();

  let sortingDefaultField: FieldConfig | undefined = undefined;

  try {
    sortingDefaultField = store$.viewConfigManager.getFieldBy(
      options?.sorting.defaultSortingField.toString() ?? ''
    );
  } catch (e) {
    //
  }

  return {
    ...props,

    onOpen: () => store$.displayOptionsOpen(),
    onClose: () => {
      console.log('onClose');
      store$.displayOptionsClose();
    },

    label:
      options?.label ??
      ('displayOptions.button.label' satisfies TranslationKeys),

    viewFields: store$.viewConfigManager
      .getViewFieldList()
      .filter((field) => {
        return (
          field.name !== INTERNAL_FIELDS.creationTime.fieldName &&
          displayOptionsProps.displayFieldsToShow.length &&
          displayOptionsProps.displayFieldsToShow?.includes(field.name)
        );
      })
      .map((field) => ({
        ...field,
        id: field.name,
        label: field.label ?? field.name,
        selected: store$.displayOptions.viewField.selected.includes(field.name),
      })),

    onSelectViewField: (...props) =>
      store$.displayOptionsSelectViewField(...props),

    sorting: {
      ...sorting,
      field: sorting.field ?? sortingDefaultField,
      onOpen: (...props) => store$.displayOptionsOpenSorting(...props),
      onClose: (...props) => {
        store$.displayOptionsCloseCombobox(...props);
      },
    },
    grouping: {
      ...grouping,
      field: grouping.field ?? sortingDefaultField,
      onOpen: (...props) => store$.displayOptionsOpenGrouping(...props),
      onClose: (...props) => {
        store$.displayOptionsCloseCombobox(...props);
      },
    },
  } satisfies DisplayOptionsProps;
});
