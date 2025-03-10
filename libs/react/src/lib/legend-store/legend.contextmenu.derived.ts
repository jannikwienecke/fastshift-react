import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  getRelationTableName,
  MakeContextMenuPropsOptions,
  makeData,
  makeNoneOption,
  makeRow,
  makeRowFromValue,
  Mutation,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getComponent } from '../ui-components/ui-components.helper';
import { store$ } from './legend.store';

export const contextMenuProps = observable<
  Partial<MakeContextMenuPropsOptions>
>({});

export const derviedContextMenuOptions = observable(() => {
  const contextmenuState = store$.contextMenuState.get();
  const viewConfigManager = store$.viewConfigManager.get();
  const relationalValues = store$.relationalDataModel;
  const row = contextmenuState.row;

  if (!row || !contextmenuState.rect) {
    return {
      ...contextmenuState,
      isOpen: false,
      onClose: () => store$.contextMenuClose(),
      fields: null,
    } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
  }

  const fieldsToRender = viewConfigManager
    .getViewFieldList()
    .sort((a, b) => {
      const hasEnumOrRelationalA = a.enum || a.relation;
      const hasEnumOrRelationalB = b.enum || b.relation;

      if (hasEnumOrRelationalA && !hasEnumOrRelationalB) {
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

      const relationalValuesForField = relationalValues[f.name]?.get();

      const valueOrValues = row?.getValue(f.name);

      console.log('valueOrValues', valueOrValues);

      const values = !valueOrValues
        ? null
        : Array.isArray(valueOrValues)
        ? valueOrValues
        : [valueOrValues];

      const selectedRows =
        values?.map((v) => {
          return (v as Row | undefined)?.raw ? v : makeRowFromValue(v, f);
        }) ?? [];

      const allOptions = enumOptions
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
          store$.updateRecordMutation({ field: f, row, valueRow: option });
        },
      } satisfies ContextMenuFieldItem;
    });

  return {
    ...contextmenuState,
    isOpen: !!contextmenuState.rect,
    onClose: () => store$.contextMenuClose(),
    fields: fieldsToRender,
  } satisfies Omit<ContextMenuUiOptions, 'renderOption' | 'renderField'>;
});
