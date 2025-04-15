import { ComboxboxItem, CommandbarItem, Row, _log } from '@apps-next/core';
import { store$ } from '../legend-store';

export const handleCommand = (_command: ComboxboxItem) => {
  const command = _command as CommandbarItem;

  const options = {
    row: store$.commandbar.activeRow.get() as Row | undefined,
    field: store$.commandbar.selectedViewField.get(),
    value: command,
  };

  if (command.command === 'user-store-command') {
    _log.debug('handleCommand - user-store-command', command);
    command.handler?.(options);
    const keepOpen = command.options?.keepCommandbarOpen;
    if (!keepOpen) {
      store$.commandbarClose();
    }
  }

  if (command?.handler) {
    _log.debug('handleCommand - handler', options);

    command.handler(options);
  }

  return !!command.handler;
};
