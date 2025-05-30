import {
  BaseViewConfigManagerInterface,
  CommandbarProps,
  MakeConfirmationAlertPropsOption,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getCommandGroups } from '../commands';
import { getCommandbarPropsForFieldType } from '../commands/commands-field-type';
import { store$ } from './legend.store';
import { copyRow, isDetailOverview } from './legend.utils';
import { getCommandsOpenModelList } from '../commands/commands.open.list';
export const commandbarProps$ = observable<
  Partial<MakeConfirmationAlertPropsOption>
>({});

const openCommandbar = () => {
  if (isDetailOverview()) {
    const detailRow = store$.detail.row.get() as Row | undefined;
    const viewConfigManager =
      store$.detail.viewConfigManager.get() as BaseViewConfigManagerInterface;
    if (viewConfigManager && detailRow) {
      store$.commandbarOpen(copyRow(detailRow, viewConfigManager));
    }
  } else {
    const listRow = store$.list.rowInFocus.get()?.row as Row | undefined;
    listRow && store$.commandbarOpen(copyRow(listRow));
  }
};
export const derivedCommandbarState$ = observable(() => {
  if (!store$.commandbar.open.get()) {
    return {
      onOpen: openCommandbar,
    } as CommandbarProps;
  }

  const fieldTypeCommandbarProps = getCommandbarPropsForFieldType();
  const openModelListProps = getCommandsOpenModelList();

  const props = store$.commandbar.get();
  return {
    onClose: () => store$.commandbarClose(),
    onOpen: openCommandbar,
    onInputChange: (...props) => store$.commandbarUpdateQuery(...props),
    onSelect: (...props) => store$.commandbarSelectItem(...props),
    onValueChange: (...props) => store$.commandbarSetValue(...props),

    activeItem: store$.commandbar.activeItem.get(),
    open: props?.open ?? false,
    row: (store$.commandbar.activeRow.get() as Row) || undefined,
    headerLabel:
      props?.headerLabel ?? store$.commandbar.activeRow.label.get() ?? '',
    inputPlaceholder: props?.inputPlaceholder ?? '',
    query: props?.query ?? '',
    error: props?.error ?? undefined,
    groups: getCommandGroups(),

    ...(fieldTypeCommandbarProps ?? {}),
    ...(openModelListProps ?? {}),
  } satisfies Omit<CommandbarProps, 'renderItem'>;
});
