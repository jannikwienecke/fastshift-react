import {
  CommandbarProps,
  MakeConfirmationAlertPropsOption,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import {
  getCommandbarCommandGroups,
  getCommandbarDefaultListProps,
  getCommandbarSelectedViewField,
} from './legend.commandbar.helper';
import { store$ } from './legend.store';
import { copyRow } from './legend.utils';

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

  const defaultCommandbarProps = getCommandbarDefaultListProps();
  const commandbarPropsSelectedViewField = getCommandbarSelectedViewField();
  const commandsGroups = getCommandbarCommandGroups();

  const commands: CommandbarProps['itemGroups'] = [[...store$.commands.get()]];

  const props = {
    ...store$.commandbar.get(),
    ...defaultCommandbarProps,
    ...commandbarPropsSelectedViewField,

    onClose: () => store$.commandbarClose(),
    onOpen: () => {
      const row = store$.list.rowInFocus.get()?.row;
      row && store$.commandbarOpen(copyRow(row));
    },
    onInputChange: (...props) => store$.commandbarUpdateQuery(...props),
    onSelect: (...props) => store$.commandbarSelectItem(...props),
    onValueChange: (...props) => store$.commandbarSetValue(...props),
  } satisfies Omit<CommandbarProps, 'renderItem'>;

  return {
    ...props,
    itemGroups: [...props.itemGroups, ...(commandsGroups ?? []), ...commands],
  };
});
