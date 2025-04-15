import {
  CommandbarProps,
  MakeConfirmationAlertPropsOption,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';
import { getCommandbarPropsForFieldType } from '../commands/commands-field-type';
import { getCommandGroups } from '../commands';
export const commandbarProps$ = observable<
  Partial<MakeConfirmationAlertPropsOption>
>({});

export const derivedCommandbarState$ = observable(() => {
  if (!store$.commandbar.open.get()) {
    return {
      onOpen: () => {
        const row = store$.list.rowInFocus.get()?.row;
        row && store$.commandbarOpen(copyRow(row));
      },
    } as CommandbarProps;
  }

  const fieldTypeCommandbarProps = getCommandbarPropsForFieldType();

  const props = store$.commandbar.get();
  return {
    onClose: () => store$.commandbarClose(),
    onOpen: () => {
      const row = store$.list.rowInFocus.get()?.row;
      row && store$.commandbarOpen(copyRow(row));
    },
    onInputChange: (...props) => store$.commandbarUpdateQuery(...props),
    onSelect: (...props) => store$.commandbarSelectItem(...props),
    onValueChange: (...props) => store$.commandbarSetValue(...props),

    open: props?.open ?? false,
    row: store$.list.rowInFocus.get()?.row ?? undefined,
    headerLabel:
      props?.headerLabel ?? store$.commandbar.activeRow.label.get() ?? '',
    inputPlaceholder: props?.inputPlaceholder ?? '',
    query: props?.query ?? '',
    error: props?.error ?? undefined,
    groups: getCommandGroups(),

    ...(fieldTypeCommandbarProps ?? {}),
  } satisfies Omit<CommandbarProps, 'renderItem'>;
});
