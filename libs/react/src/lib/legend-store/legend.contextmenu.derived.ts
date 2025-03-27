import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeDayMonthString,
  makeNoneOption,
  makeRowFromValue,
  NONE_OPTION,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getComponent } from '../ui-components/ui-components.helper';
import { store$ } from './legend.store';
import { makeComboboxStateFilterValuesDate } from './legend.combobox.helper';
import {
  dateUtils,
  getOptionsForDateField,
  getTimeValueFromDateString,
} from '../ui-adapter/filter-adapter';
import { DEFAULT_DATE_OPTIONS_FOR_EDIT } from '../ui-adapter/filter-adapter/filter.constants';

export const contextMenuProps = observable<
  Partial<MakeContextMenuPropsOptions>
>({});

export const derviedContextMenuOptions = observable(() => {
  const contextmenuState = store$.contextMenuState.get();
  const viewConfigManager = store$.viewConfigManager.get();
  const relationalValues = store$.relationalDataModel;
  const row = contextmenuState.row;

  const { softDelete, softDeleteField } =
    viewConfigManager.viewConfig.mutation ?? {};

  const isDeleted =
    softDelete && softDeleteField ? row?.getValue(softDeleteField) : false;

  if (!row || !contextmenuState.rect) {
    return {
      ...contextmenuState,
      isOpen: false,
      onClose: () => store$.contextMenuClose(),
      fields: null,
      modelName: viewConfigManager.viewConfig.tableName,
      onDelete: () => null,
      onEdit: () => null,

      isDeleted: false,
    } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
  }

  const fieldsToRender = viewConfigManager
    .getViewFieldList()
    .sort((a, b) => {
      const hasEnumDateOrRelationalA = a.enum || a.relation || a.isDateField;
      const hasEnumDateOrRelationalB = b.enum || b.relation || b.isDateField;

      if (hasEnumDateOrRelationalA && !hasEnumDateOrRelationalB) {
        return -1;
      }

      return 0;
    })
    .map((f) => {
      const views = store$.views.get();
      const view = Object.values(views).find((v) => v?.tableName === f.name);
      const iconForComponent = getComponent({
        componentType: 'icon',
        fieldName: f.name,
      });

      const Icon = iconForComponent ?? view?.icon;

      const enumOptions = f.enum
        ? f.enum.values.map((v) => makeRowFromValue(v.name, f))
        : null;

      // const dateOptions = mak
      const getDateOptionsList = dateUtils.getOptionsForEdit;
      const { values: dateOptions } =
        makeComboboxStateFilterValuesDate(f, getDateOptionsList) ?? {};

      const relationalValuesForField = relationalValues[f.name]?.get();

      const valueOrValues = row?.getValue(f.name);

      const values = !valueOrValues
        ? null
        : Array.isArray(valueOrValues)
        ? valueOrValues
        : f.isDateField && typeof valueOrValues === 'number'
        ? [makeDayMonthString(new Date(valueOrValues))]
        : [valueOrValues];

      const selectedRows =
        values?.map((v) => {
          return (v as Row | undefined)?.raw ? v : makeRowFromValue(v, f);
        }) ?? [];

      const allOptions = dateOptions
        ? dateOptions
        : enumOptions
        ? enumOptions
        : [...(relationalValuesForField?.rows ?? [])];

      const optionsToRender = allOptions?.filter((option) => {
        return !selectedRows?.map((v) => v.id).includes(option.id);
      });

      return {
        ...f,
        Icon,
        options: optionsToRender ?? [],
        noneOptionRow: makeNoneOption(f),
        value: row,
        selected: [...selectedRows].filter((v) => !!v.id),
        onClickOption: async () => {
          store$.contextmenuClickOnField(f);
        },
        onCheckOption: async (checkedRow) => {
          store$.selectRowsMutation({
            row,
            field: f,
            existingRows: selectedRows,
            checkedRow,
            // deleteIds: idsToDelete,
          });
        },
        onSelectOption: async (option) => {
          const isNone = 'No date' === option.id;
          const datetime = !isNone
            ? getTimeValueFromDateString(option.id, true)
            : null;
          store$.updateRecordMutation({
            field: f,
            row,
            valueRow: makeRowFromValue(datetime ?? NONE_OPTION, f),
          });
        },
      } satisfies ContextMenuFieldItem;
    });

  return {
    ...contextmenuState,
    isOpen: !!contextmenuState.rect,
    fields: fieldsToRender,
    modelName: viewConfigManager.viewConfig.tableName,
    isDeleted,
    onClose: () => store$.contextMenuClose(),
    onDelete: () => store$.contextmenuDeleteRow(row),
    onEdit: () => store$.contextmenuEditRow(row),
  } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
});
