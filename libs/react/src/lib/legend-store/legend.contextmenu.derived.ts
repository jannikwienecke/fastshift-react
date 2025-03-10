import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  getRelationTableName,
  MakeContextMenuPropsOptions,
  makeData,
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

      const values =
        valueOrValues === undefined || valueOrValues === null
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
        : relationalValuesForField?.rows ?? null;

      const optionsToRender = allOptions?.filter((option) => {
        return !selectedRows?.map((v) => v.id).includes(option.id);
      });

      return {
        ...f,
        Icon,
        options: optionsToRender ?? [],
        value: row,
        selected: selectedRows,
        onCheckOption: async (checkedRow) => {
          store$.contextMenuState.mutating.set(true);

          const runMutation = store$.api?.mutateAsync;
          const selectedIds = values?.map((v) => v.id) ?? [];
          const checkedId = checkedRow.id;
          const idsToDelete =
            selectedIds.filter((id) => id === checkedId) ?? [];

          const newRows = values?.length
            ? idsToDelete.length
              ? values.filter((v) => v.id !== checkedId)
              : [...values, checkedRow]
            : [checkedRow];

          const originalRawRow = { ...store$.contextMenuState.row.raw.get() };
          const updatedRowData = {
            ...originalRawRow,
            [f.name]: newRows.map((r) => r.raw),
          };

          const updatedRow = makeData(
            store$.views.get(),
            store$.viewConfigManager.get().getViewName()
          )([updatedRowData]).rows[0];

          updatedRow && store$.contextMenuState.row.set(updatedRow);

          const mutation: Mutation = {
            type: 'SELECT_RECORDS',
            payload: {
              id: row.id,
              table: getRelationTableName(f),
              idsToDelete: idsToDelete,
              newIds: idsToDelete.length ? [] : [checkedId],
            },
          };

          const { error } = await runMutation({
            mutation: mutation,
            viewName: store$.viewConfigManager.viewConfig.viewName.get(),
            query: store$.globalQuery.get(),
          });

          if (error) {
            store$.contextMenuState.row.set(row);
          }
        },
        onSelectOption: async (option: Row) => {
          const runMutation = store$.api?.mutateAsync;

          const mutation: Mutation = {
            type: 'UPDATE_RECORD',
            payload: {
              id: row.id,
              record: {
                [f.relation?.fieldName ?? f.name]: f.relation
                  ? option.id
                  : option.raw,
              },
            },
          };

          await runMutation({
            mutation: mutation,
            viewName: store$.viewConfigManager.viewConfig.viewName.get(),
            query: store$.globalQuery.get(),
          });
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
