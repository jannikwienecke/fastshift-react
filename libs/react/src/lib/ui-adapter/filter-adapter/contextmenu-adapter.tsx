import {
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeRowFromValue,
  NONE_OPTION,
  RecordType,
} from '@apps-next/core';
import {
  contextMenuProps,
  derviedContextMenuOptions,
} from '../../legend-store/legend.contextmenu.derived';
import { ContextmenuFieldOption } from '../../ui-components/render-contextmenu-field-option';
import { ContextmenuFieldLabel } from '../../ui-components/render-contextmenu-field';
import { ComboboxNoneValue } from '../../ui-components/render-combobox-none-value';

export const makeContextMenuProps = <T extends RecordType>(
  options?: MakeContextMenuPropsOptions<T>
): ContextMenuUiOptions => {
  contextMenuProps.set(options ?? {});

  return {
    ...derviedContextMenuOptions.get(),
    renderOption(row, field) {
      if (row.id === NONE_OPTION) {
        return <ComboboxNoneValue field={field} />;
      }
      return <ContextmenuFieldOption value={row} field={field} />;
    },
    renderField(field) {
      return (
        <ContextmenuFieldLabel
          field={field}
          value={makeRowFromValue(field.name.firstUpper(), field)}
        />
      );
    },
  };
};
