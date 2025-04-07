import {
  ADD_NEW_OPTION,
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeDayMonthString,
  makeNoneOption,
  makeRowFromValue,
  NONE_OPTION,
  Row,
  ViewConfigType,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import {
  dateUtils,
  getTimeValueFromDateString,
} from '../ui-adapter/filter-adapter';
import { getComponent } from '../ui-components/ui-components.helper';
import { makeComboboxStateFilterValuesDate } from './legend.combobox.helper';
import { xSelect } from './legend.select-state';
import { store$ } from './legend.store';
import { comboboxStore$ } from './legend.store.derived.combobox';

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
      onCopy: () => null,

      isDeleted: false,
    } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
  }

  const comboboxValues = comboboxStore$.values.get();
  const comboboxSelected = comboboxStore$.selected.get();

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

      const isComboboxField = comboboxStore$.field.name.get() === f.name;

      const selectedRows = isComboboxField
        ? comboboxSelected
        : values?.map((v) => {
            return (v as Row | undefined)?.raw ? v : makeRowFromValue(v, f);
          }) ?? [];

      const allOptions = isComboboxField
        ? comboboxValues
        : dateOptions
        ? dateOptions
        : enumOptions
        ? enumOptions
        : [...(relationalValuesForField?.rows ?? [])];

      return {
        ...f,
        Icon,
        options: allOptions ?? [],
        noneOptionRow: makeNoneOption(f),
        value: row,
        selected: [...selectedRows].filter((v) => !!v.id),

        onClickOption: async () => {
          store$.contextmenuClickOnField(f);
        },
        onCheckOption: async (checkedRow) => {
          xSelect.select(checkedRow);
        },
        onHover: () => {
          if (f.relation?.manyToManyTable) {
            xSelect.open(row, f);
          }
        },
        onSelectOption: async (option) => {
          const isDateField = f.isDateField;
          const addNew = option.id === ADD_NEW_OPTION;
          let value = option;
          if (addNew) {
            if (view?.viewName) {
              store$.commandformOpen(view?.viewName);
            }
            return;
          } else if (isDateField) {
            const isNone = 'No date' === option.id;
            const datetime = !isNone
              ? getTimeValueFromDateString(option.id, true)
              : null;

            value = makeRowFromValue(datetime ?? NONE_OPTION, f);
          }

          store$.updateRecordMutation({
            field: f,
            row,
            valueRow: value,
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
    onCopy: (type) => store$.contextmenuCopyRow(type),
  } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
});
