import {
  ComboxboxItem,
  CommandbarProps,
  MakeConfirmationAlertPropsOption,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { store$ } from './legend.store';
import { CubeIcon } from '@radix-ui/react-icons';
import { getViewFieldsOptions } from './legend.combobox.helper';

export const commandbarProps$ = observable<
  Partial<MakeConfirmationAlertPropsOption>
>({});

export const derivedCommandbarState$ = observable(() => {
  if (!store$.commandbar.open.get()) {
    return {
      onOpen: () => {
        console.log('Commandbar is closed');
        store$.commandbarOpen();
      },
    } as CommandbarProps;
  }

  const viewConfigManager = store$.viewConfigManager.get();
  const viewName = viewConfigManager.getViewName();
  const rowInFocus = store$.list.rowInFocus.row.get();

  const viewgetViewFieldsOptions = getViewFieldsOptions({ useEditLabel: true });

  const items: ComboxboxItem[] =
    viewgetViewFieldsOptions?.values?.map((item) => item) ?? [];

  return {
    ...store$.commandbar.get(),

    headerLabel: `${viewName} - ${rowInFocus?.label ?? ''}`,

    inputPlaceholder: 'Type a command or search....',
    itemGroups: [items].map((group) => group),
    onClose: () => store$.commandbarClose(),
    onOpen: () => store$.commandbarOpen(),
    onInputChange: (...props) => store$.commandbarUpdateQuery(...props),
    onSelect: (...props) => store$.commandbarSelectItem(...props),
  } satisfies Omit<CommandbarProps, 'renderItem'>;
});
