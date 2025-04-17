import {
  CommandbarProps,
  MakeConfirmationAlertPropsOption,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getCommandGroups } from '../commands';
import { getCommandbarPropsForFieldType } from '../commands/commands-field-type';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';
export const commandbarProps$ = observable<
  Partial<MakeConfirmationAlertPropsOption>
>({});

export const derivedCommandbarState$ = observable(() => {
  if (!store$.commandbar.open.get()) {
    return {
      onOpen: () => {
        const detailRow = store$.detail.row.get() as Row | undefined;
        const listRow = store$.list.rowInFocus.get()?.row as Row | undefined;
        const row = detailRow ?? listRow;
        row && store$.commandbarOpen(copyRow(row));
      },
    } as CommandbarProps;
  }

  const fieldTypeCommandbarProps = getCommandbarPropsForFieldType();

  const props = store$.commandbar.get();
  return {
    onClose: () => store$.commandbarClose(),
    onOpen: () => {
      const listRow = store$.list.rowInFocus.get()?.row as Row | undefined;
      const detailRow = store$.detail.row.get() as Row | undefined;
      const row = detailRow ?? listRow;
      row && store$.commandbarOpen(copyRow(row));
    },
    onInputChange: (...props) => store$.commandbarUpdateQuery(...props),
    onSelect: (...props) => store$.commandbarSelectItem(...props),
    onValueChange: (...props) => store$.commandbarSetValue(...props),

    open: props?.open ?? false,
    row: (store$.commandbar.activeRow.get() as Row) || undefined,
    headerLabel:
      props?.headerLabel ?? store$.commandbar.activeRow.label.get() ?? '',
    inputPlaceholder: props?.inputPlaceholder ?? '',
    query: props?.query ?? '',
    error: props?.error ?? undefined,
    groups: getCommandGroups(),

    ...(fieldTypeCommandbarProps ?? {}),
  } satisfies Omit<CommandbarProps, 'renderItem'>;
});
