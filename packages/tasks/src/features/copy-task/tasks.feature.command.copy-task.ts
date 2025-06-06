import { UserStoreCommand } from '@apps-next/core';
import {
  renderError,
  store$,
  tablenameLabel$,
  viewName$,
} from '@apps-next/react';
import { getDefaultMutationArgs, Id, MakeServerFnRef } from '@apps-next/shared';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { PlusSquareIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MakeTaskCommand, TaskCommandHandler } from '../../tasks.types';

import {
  CopyTaskArgs,
  CopyTaskReturn,
} from './tasks.feature.server.copy-tasks';

export const useCopyTask = (
  mutationFn: MakeServerFnRef<CopyTaskArgs, CopyTaskReturn>
) => {
  const { t } = useTranslation();

  const { mutateAsync: copyTask } = useMutation({
    mutationFn: useConvexMutation(mutationFn),
  });

  const makeCopyHandler: TaskCommandHandler = async (options) => {
    const row = options?.rows?.[0];
    if (!row) throw new Error('No row provided for copy task command');

    const res = await copyTask({
      taskId: row?.id as Id<'tasks'>,
      name: options.value?.label ?? '',
      ...getDefaultMutationArgs(),
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

      handler: (args) => makeCopyHandler({ rows, ...args }),
    };

    return command;
  };

  return { makeCommand: makeCopyCommand, copyTask };
};
