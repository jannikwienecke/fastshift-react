import { UserStoreCommand } from '@apps-next/core';
import {
  renderError,
  store$,
  tablenameLabel$,
  viewName$,
} from '@apps-next/react';
import { Id, MakeServerFnRef } from '@apps-next/shared';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { PlusSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MakeTaskCommand } from '../../tasks.types';

import {
  CopyTaskArgs,
  CopyTaskReturn,
} from './tasks.feature.server.copy-tasks';

export const useCopyTask = (
  mutationFn: MakeServerFnRef<CopyTaskArgs, CopyTaskReturn>
) => {
  // TODO -> THIS MUST BE CHANGED -> USE THE ONE FROM THE APPS -> MOVE INTO LIB (SHARED)
  const { t } = useTranslation();

  const { mutateAsync: copyTask } = useMutation({
    mutationFn: useConvexMutation(mutationFn),
  });

  // TODO -> THIS MUST BE CHANGED
  const defaultArgs = {
    apiKey: 'API_KEY_LOCAL',
    viewName: viewName$.get(),
  };

  const makeCopyCommand: MakeTaskCommand = ({ rows }) => {
    const isCommandbar = store$.commandsDisplay.type.get() === 'commandbar';

    const command: UserStoreCommand = {
      icon: PlusSquareIcon,
      id: 'duplicate-record',
      label: !isCommandbar
        ? t('commands.makeACopy')
        : t('commands.makeACopyOf', { model: tablenameLabel$.get() }),
      command: 'duplicate-record',
      header: '',
      requiredRow: true,
      tableCommand: 'tasks',
      allowMultiple: false,
      rows,

      handler: async (options) => {
        const row = rows?.[0];
        if (!row) {
          console.warn('No row provided for copy command');
          return;
        }

        const res = await copyTask({
          taskId: row?.id as Id<'tasks'>,
          name: options.value?.label ?? '',
          ...defaultArgs,
        });

        if (res.error) {
          renderError(res.error);
        } else {
          store$.navigation.state.set({
            type: 'navigate',
            view: viewName$.get() ?? '',
            id: res.success.data?.newTaskId,
          });
        }
      },
    };

    return command;
  };

  return { makeCommand: makeCopyCommand, copyTask };
};
