import { ContextMenuProps, getViewByName, makeRow } from '@apps-next/core';
import { ContextMenuValue } from '../../ui-components';
import { useQueryData } from '../../use-query-data';
import { useView } from '../../use-view';

export const useContextMenu = (): (() => ContextMenuProps) => {
  const { viewConfigManager, registeredViews } = useView();
  const fields = viewConfigManager.getViewFieldList();
  const { relationalDataModel } = useQueryData();

  return () => {
    return {
      items: fields.map((field) => {
        const viewOfField = field.relation
          ? getViewByName(registeredViews, field.name)
          : undefined;

        const dataRows = relationalDataModel?.[field.name]?.rows;
        const enumRows = field.enum?.values.map((value) =>
          makeRow(value.name, value.name, value.name, field)
        );
        const rows = field.enum ? enumRows : dataRows;

        const options = rows?.map((row) => {
          return {
            id: row.id,
            label: row.label,
            render: () => <ContextMenuValue field={field} row={row} />,
          };
        });

        return {
          id: field.name,
          label: field.name,
          icon: viewOfField?.icon,
          shortcut: field.name.toUpperCase().slice(0, 1),
          options,
        };
      }),
    };
  };
};
