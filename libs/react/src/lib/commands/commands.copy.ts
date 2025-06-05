import { CommandbarItem } from '@apps-next/core';
import { CopyIcon, LinkIcon } from 'lucide-react';
import {
  getCommandsType,
  getViewLabelOf,
  getViewName,
} from './commands.helper';

const getIsVisible = () =>
  getCommandsType() !== 'detail-row' && getCommandsType() !== 'closed';

export const makeCopyCommands = () => {
  const copyIdCommand: CommandbarItem = {
    id: 'copy-id',
    command: 'copy-model',
    label: getViewLabelOf('__commands.copyId'),
    header: '',
    getViewName: getViewName,
    icon: CopyIcon,
    getIsVisible,
    handler: () => {
      console.debug('copyIssueIdCommand - handler');
      alert('HANDLE...copyIssueIdCommand NOT IMPLEMENTED');
    },
  };

  const copyUrlCommand: CommandbarItem = {
    id: 'copy-url',
    command: 'copy-model',
    label: getViewLabelOf('__commands.copyUrl'),
    header: '',
    getViewName: getViewName,
    getIsVisible,
    icon: LinkIcon,
    handler: () => {
      console.debug('copyUrlCommand - handler');
      alert('HANDLE...copyUrlCommand NOT IMPLEMENTED');
    },
  };

  return [copyIdCommand, copyUrlCommand] satisfies CommandbarItem[];
};
