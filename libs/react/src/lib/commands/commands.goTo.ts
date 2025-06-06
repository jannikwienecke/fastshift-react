import {
  CommandbarItem,
  getViewLabel,
  t,
  ViewConfigType,
} from '@apps-next/core';
import { ArrowRightIcon } from 'lucide-react';
import { store$ } from '../legend-store';
import { getViewName } from './commands.helper';

export const makeGoToCommands = () => {
  const activeRow = store$.commandbar.activeRow.get();

  if (!activeRow) return [];

  const allViews = store$.views.get();

  const commands = Object.values(allViews)
    .filter((v) => v?.viewName && !v.isManyToMany)
    .map((v) => {
      if (!v) return null;

      const goToCommands: CommandbarItem = {
        id: `goTo-${v?.viewName}`,
        command: 'goTo-commands',
        label: t('__commands.goTo', {
          name: getViewLabel(v as ViewConfigType),
        }),

        header: 'navigation',
        getViewName,
        icon: ArrowRightIcon,
        handler: () => {
          store$.navigation.state.set({
            view: v?.viewName,
            type: 'navigate',
          });
        },
      };

      return goToCommands;
    });

  return [...commands].filter((cmd) => cmd !== null) satisfies CommandbarItem[];
};
