import {
  DisplayOptionsViewField,
  DisplayOptionsProps,
  FieldConfig,
  MakeDisplayOptionsPropsOptions,
  TranslationKeys,
  INTERNAL_FIELDS,
  makeRow,
  en,
  NO_SORTING_FIELD,
  NO_GROUPING_FIELD,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';

export const displayOptionsProps = observable<
  Partial<MakeDisplayOptionsPropsOptions>
>({
  displayFieldsToShow: [],
});

export const derviedDisplayOptions = observable(() => {
  const options = displayOptionsProps.get();

  const { sorting, grouping, ...props } = store$.displayOptions.get();

  const sortingDefaultField: FieldConfig = NO_SORTING_FIELD;
  const groupingDefaultField: FieldConfig = NO_GROUPING_FIELD;

  return {
    ...props,

    onOpen: () => store$.displayOptionsOpen(),
    onClose: () => {
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
          displayOptionsProps.displayFieldsToShow.get()?.length &&
          displayOptionsProps.displayFieldsToShow.get()?.includes(field.name)
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
      field: grouping.field ?? groupingDefaultField,
      onOpen: (...props) => store$.displayOptionsOpenGrouping(...props),
      onClose: (...props) => {
        store$.displayOptionsCloseCombobox(...props);
      },
    },
  } satisfies DisplayOptionsProps;
});
