import {
  DisplayOptionsProps,
  FieldConfig,
  isSystemField,
  MakeDisplayOptionsPropsOptions,
  NO_GROUPING_FIELD,
  NO_SORTING_FIELD,
  TranslationKeys,
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

  const groupingFieldIsBoolean =
    store$.displayOptions.grouping.field.type.get() === 'Boolean';

  const showEmptyGroups =
    store$.displayOptions.showEmptyGroups.get() && !groupingFieldIsBoolean;

  const showDeleted = store$.displayOptions.showDeleted.get();

  const softDeleteField =
    store$.viewConfigManager.viewConfig.mutation.softDeleteField.get();

  const visibleFields = store$.displayOptions.viewField.visible.get();

  const viewFields = [
    ...store$.viewConfigManager.getViewFieldList({
      includeSystemFields: false,
    }),
  ]
    .filter((field) => {
      return (
        !isSystemField(field.name) &&
        (!displayOptionsProps.displayFieldsToShow.get() ||
          displayOptionsProps.displayFieldsToShow.get()?.includes(field.name))
      );
    })
    .filter((field) => {
      const show = showDeleted
        ? true
        : field.name === softDeleteField
        ? false
        : true;

      return show;
    })
    .map((field) => {
      const selected =
        visibleFields === null || visibleFields === undefined
          ? true
          : visibleFields?.includes?.(field.name) ?? false;
      return {
        ...field,
        id: field.name,
        label: field.label ?? field.name,
        selected,
      };
    });

  return {
    ...props,

    onOpen: () => store$.displayOptionsOpen(),
    onClose: () => {
      store$.displayOptionsClose();
    },

    label:
      options?.label ??
      ('displayOptions.button.label' satisfies TranslationKeys),

    viewFields,

    onSelectViewField: (...props) =>
      store$.displayOptionsSelectViewField(...props),

    onToggleShowEmptyGroups: (...props) =>
      store$.displayOptionsToggleShowEmptyGroups(...props),

    onToggleShowDeleted: (...props) =>
      store$.displayOptionsToggleShowDeleted(...props),

    showEmptyGroupsToggle:
      !!store$.displayOptions.grouping.field.name.get() &&
      !groupingFieldIsBoolean,

    showEmptyGroups,

    onReset: () => {
      store$.displayOptionsReset();
    },

    showResetButton:
      !!sorting.field ||
      !!grouping.field ||
      store$.displayOptions.viewField.visible.length !==
        store$.displayOptions.viewField.allFields.length,

    sorting: {
      ...sorting,
      field: sorting.field ?? sortingDefaultField,
      onOpen: (...props) => store$.displayOptionsOpenSorting(...props),
      onClose: (...props) => {
        store$.displayOptionsCloseCombobox(...props);
      },
      toggleSorting: (...props) => {
        store$.displayOptionsToggleSorting(...props);
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
