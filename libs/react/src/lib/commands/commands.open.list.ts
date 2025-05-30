import { CommandbarProps } from '@apps-next/core';
import { comboboxStore$, getView, store$ } from '../legend-store';

type PropsType = Partial<CommandbarProps>;

export const getCommandsOpenModelList = (): PropsType | null => {
  const tableName = store$.commandbar.activeOpen.tableName.get();
  const combobox = comboboxStore$.get();
  if (!tableName) return null;

  return {
    inputPlaceholder: `Open ${tableName}...`,
    groups: [
      {
        header: '',
        items:
          combobox.values?.map((value) => ({
            id: 'open-model-list' + value.id,
            label: `${value.label}`,
            icon: getView(tableName)?.icon,
            command: 'open-commands',
            handler: () => {
              store$.navigation.state.set({
                view: tableName,
                type: 'navigate',
                id: value.id,
              });
            },
          })) ?? [],
      },
    ],
  };
};
