import { CommandbarItem, Row } from '@apps-next/core';
import { AlarmCheckIcon, StarIcon, StarOffIcon, TrashIcon } from 'lucide-react';
import { store$ } from '../legend-store';
import { getViewLabelOf, getViewName } from './commands.helper';

export const makeModelCommands = () => {
  const activeRow = store$.commandbar.activeRow.get();
  const userViews = store$.userViews.get();

  const userView = userViews.find((v) => v.name === activeRow?.label);
  const isStarred = userView?.starred ?? false;

  if (!activeRow) return [];

  const toggleFavoriteModel: CommandbarItem = {
    id: 'toggle-favorite-model',
    command: 'model-commands',
    label: getViewLabelOf(
      !isStarred ? '__commands.favoriteModel' : '__commands.unfavoriteModel'
    ),

    header: '',
    getViewName,
    icon: isStarred ? StarOffIcon : StarIcon,
    handler: () => {
      store$.updateViewMutation({ id: userView?.id, starred: !isStarred });
    },
  };

  const deleteModelCommand: CommandbarItem = {
    id: 'delete-model',
    command: 'model-commands',
    label: getViewLabelOf('__commands.deleteModel'),
    header: '',
    getViewName,
    icon: TrashIcon,
    handler: () => {
      store$.deleteRecordMutation({ row: activeRow as Row });
    },
  };

  const remindMeLaterCommand: CommandbarItem = {
    id: 'remind-me-later',
    command: 'model-commands',
    label: getViewLabelOf('__commands.remindMeLater'),
    header: '',
    getViewName,
    icon: AlarmCheckIcon,
    handler: () => {
      console.debug('remindMeLaterCommand - handler');
      alert('HANDLE...remindMeLaterCommand NOT IMPLEMENTED');
    },
  };

  return [
    toggleFavoriteModel,
    remindMeLaterCommand,
    deleteModelCommand,
  ] satisfies CommandbarItem[];
};
