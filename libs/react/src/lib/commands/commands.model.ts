import { CommandbarItem, Row } from '@apps-next/core';
import { AlarmCheckIcon, StarIcon, StarOffIcon, TrashIcon } from 'lucide-react';
import { store$, viewActions } from '../legend-store';
import {
  getCommandsType,
  getViewLabelOf,
  getViewName,
} from './commands.helper';

const isNotShowingDetailCommands = () =>
  getCommandsType() !== 'detail-row' && getCommandsType() !== 'closed';

export const makeModelCommands = () => {
  const activeRow =
    store$.commandbar.activeRow.get() || store$.detail.row.get();
  const userViews = store$.userViews.get();

  const userView = userViews.find((v) => v.name === activeRow?.label);
  const isStarred = userView?.starred ?? false;

  const toggleFavoriteModel: CommandbarItem = {
    id: 'toggle-favorite-model',
    command: 'model-commands',
    label: getViewLabelOf(
      !isStarred ? '__commands.favoriteModel' : '__commands.unfavoriteModel'
    ),

    header: '',
    getViewName,
    getIsVisible: isNotShowingDetailCommands,
    icon: isStarred ? StarOffIcon : StarIcon,
    handler: () => {
      viewActions().toggleFavorite();
    },
  };

  const deleteModelCommand: CommandbarItem = {
    id: 'delete-model',
    command: 'model-commands',
    label: getViewLabelOf('__commands.deleteModel'),
    header: '',
    getViewName,
    getIsVisible: isNotShowingDetailCommands,
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
    getIsVisible: isNotShowingDetailCommands,
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
