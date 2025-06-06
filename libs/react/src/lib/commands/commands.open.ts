import {
  CommandbarItem,
  getViewLabel,
  t,
  ViewConfigType,
} from '@apps-next/core';
import { store$, uiViewConfigDict$ } from '../legend-store';
import { getViewName } from './commands.helper';
import { setCommandbarQuery } from '../legend-store/legend.commandbar.fn';

// open like -> open task -> then select which task to open
// HIER WEITER MACHEN
export const makeOpenCommands = () => {
  const activeRow = store$.commandbar.activeRow.get();
  const userViews = store$.userViews.get();

  const userView = userViews.find((v) => v.name === activeRow?.label);

  if (!activeRow) return [];

  const allViews = store$.views.get();

  const openCommands = Object.values(allViews)
    .filter((v) => v?.viewName && !v.isManyToMany)
    .map((v) => {
      if (!v) return null;

      const uiViewConfig = uiViewConfigDict$.get()?.[v.tableName];

      const openViewCommand: CommandbarItem = {
        id: `open-${v?.viewName}`,
        command: 'open-commands',
        label: t('__commands.open', {
          name: getViewLabel(v as ViewConfigType),
        }),
        header: 'navigation',
        getViewName,
        icon: v._generated ? uiViewConfig?.icon || v.icon : v.icon,
        handler: () => {
          store$.commandbar.activeOpen.tableName.set(v.tableName);
          setCommandbarQuery(store$, '');
        },
      };

      return openViewCommand;
    });

  return [...openCommands].filter(
    (cmd) => cmd !== null
  ) satisfies CommandbarItem[];
};
