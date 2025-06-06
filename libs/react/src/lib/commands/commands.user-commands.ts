import { CommandbarItem, makeData, RecordType, Row } from '@apps-next/core';
import {
  detailView$,
  isDetail,
  store$,
  tablename$,
  view$,
  viewName$,
} from '../legend-store';
import {
  ignoreNewDetailData$,
  isRunning$,
} from '../legend-store/legend.mutationts';
import { getCommandsType } from './commands.helper';
import { observable } from '@legendapp/state';

const onUserCommandSuccess = (props: { updatedRecord?: RecordType }) => {
  const detailView = detailView$.get();
  if (!props.updatedRecord) return;

  if (isDetail() && detailView) {
    const updatedRow = makeData(
      store$.views.get(),
      detailView.viewName
    )([props.updatedRecord]).rows?.[0];

    store$.detail.row.set(updatedRow);

    if (isRunning$.get()) {
      ignoreNewDetailData$.set((prev) => prev + 1);
    }

    isRunning$.set(true);
  } else {
    alert('NOT IMPLEMENTED YET: onUserCommandSuccess for non-detail views');
  }
};

// export const getUserStoreCommands = (): CommandbarItem[] => {};

export const userStoreCommands$ = observable<CommandbarItem[]>(() => {
  const storeCommands = store$.commands.get();

  const detailRow = store$.detail.row.get();
  const commandRow = store$.commandbar.activeRow.get();
  const selectedListRows = store$.list.selected.get();
  const rows = (
    commandRow
      ? [commandRow]
      : detailRow
      ? [detailRow]
      : selectedListRows.length
      ? selectedListRows
      : undefined
  ) as Row[] | undefined;

  const table = tablename$.get();

  return storeCommands
    .map((makeCommand) => {
      const command = makeCommand({
        rows,
        optimisticUpdateStore: onUserCommandSuccess,
      });
      return {
        ...command,
        command: 'user-store-command',
      } satisfies CommandbarItem;
    })
    .filter((command) => {
      if (rows && rows?.length > 1) {
        if (command.allowMultiple !== true) {
          return false;
        }
      }

      if (command.getIsVisible?.() === false) return false;

      if (command.tableCommand && command.tableCommand !== table) return false;

      const requiredRow = command.requiredRow ?? false;

      if (requiredRow && !rows?.length) {
        return false;
      }

      if (!requiredRow && store$.commandsDisplay.type.get() === 'detail-row') {
        return false;
      }

      if (getCommandsType() === 'closed') return !!command.primaryCommand;
      return true;
    });
});
