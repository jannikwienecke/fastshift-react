import {
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  makeRowFromValue,
  NONE_OPTION,
  RecordType,
  renderModelName,
  t,
} from '@apps-next/core';
import {
  contextMenuProps,
  derviedContextMenuOptions,
} from '../../legend-store/legend.contextmenu.derived';
import { ComboboxNoneValue } from '../../ui-components/render-combobox-none-value';
import { ContextmenuFieldLabel } from '../../ui-components/render-contextmenu-field';
import { ContextmenuFieldOption } from '../../ui-components/render-contextmenu-field-option';

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
          value={makeRowFromValue(renderModelName(field.name, t), field)}
        />
      );
    },
  };
};
