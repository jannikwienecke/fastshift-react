import { api } from '@apps-next/convex';
import { MakeUserStoreCommand, UserStoreCommand } from '@apps-next/core';
import { renderError, viewName$ } from '@apps-next/react';
import { TaskViewDataType, useCopyTask } from '@apps-next/tasks';
import { useConvexMutation } from '@convex-dev/react-query';
import { observable } from '@legendapp/state';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { CheckCheckIcon, TrashIcon } from 'lucide-react';
import { Id } from 'packages/convex/convex/_generated/dataModel';
import { useTranslation } from 'react-i18next';
import { resettingDb$ } from '../../application-store/app.store';

const waitFor = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const reset$ = observable(0);

export type MakeTaskCommand = MakeUserStoreCommand<TaskViewDataType>;

export const useCommands = () => {
  const router = useRouter();

  const { t } = useTranslation();
  const { mutateAsync } = useMutation({
    mutationFn: useConvexMutation(api.init.default),
  });

  const { makeCommand } = useCopyTask(api.query.doSomething);

  const { mutateAsync: toggleComplete } = useMutation({
    mutationFn: useConvexMutation(api.query.toggleComplete),
  });

  const defaultArgs = {
    apiKey: 'API_KEY_LOCAL',
    viewName: viewName$.get(),
  };

  // const makeCopyCommand: MakeTaskCommand = ({ rows }) => {
  //   const command: UserStoreCommand = {
  //     icon: PlusSquareIcon,
  //     id: 'duplicate-record',
  //     label: !isCommandbar
  //       ? t('commands.makeACopy')
  //       : t('commands.makeACopyOf', { model: tablenameLabel$.get() }),
  //     command: 'duplicate-record',
  //     header: '',
  //     requiredRow: true,
  //     tableCommand: 'tasks',
  //     allowMultiple: false,
  //     rows,

  //     handler: async (options) => {
  //       const row = rows?.[0];
  //       if (!row) {
  //         console.warn('No row provided for copy command');
  //         return;
  //       }

  //       const res = await copyTask({
  //         taskId: row?.id as Id<'tasks'>,
  //         name: options.value?.label ?? '',
  //         ...defaultArgs,
  //       });

  //       if (res.error) {
  //         renderError(res.error);
  //       } else {
  //         store$.navigation.state.set({
  //           type: 'navigate',
  //           view: view$.get()?.viewName ?? '',
  //           id: res.success.data?.newTaskId,
  //         });
  //       }
  //     },
  //   };

  //   return command;
  // };

  const makeToggleCompleteTaskCommand: MakeTaskCommand = ({
    rows,
    optimisticUpdateStore,
  }) => {
    const row = rows?.[0];

    const command: UserStoreCommand = {
      icon: CheckCheckIcon,
      id: 'toggle-complete-task',
      label: !row?.raw.completed
        ? t('commands.toggleCompleteTask')
        : t('commands.untoggleCompleteTask'),
      command: 'toggle-complete-task',
      header: '',

      primaryCommand: row?.raw.completed ? false : true,
      primaryCommandOptions: {
        style: { type: row?.raw.completed ? 'danger' : 'success' },
      },
      requiredRow: true,
      tableCommand: 'tasks',
      allowMultiple: true,

      handler: async (options) => {
        if (!row) {
          console.warn('No row provided for toggle complete command');
          return;
        }

        optimisticUpdateStore({
          updatedRecord: { ...row?.raw, completed: !row?.raw.completed },
        });

        const res = await toggleComplete({
          taskId: options.row?.id as Id<'tasks'>,
          completed: !options.row?.raw.completed,
          name: options.value?.label ?? '',
          ...defaultArgs,
        });

        if (res.error) {
          renderError(res.error);
        }
      },
    };

    return command;
  };

  const makeResetDbCommand: MakeUserStoreCommand = () => {
    const resetDb: UserStoreCommand = {
      icon: TrashIcon,
      id: 'reset-db',
      label: t('commands.resetDb'),
      command: 'reset-db',
      header: 'admin',
      tableCommand: false,

      handler: async (options) => {
        resettingDb$.set(true);
        const promises = [mutateAsync({}), waitFor(1000)];
        await Promise.all(promises);
        resettingDb$.set(false);
        router.navigate({ to: '/fastApp' });

        reset$.set((prev) => prev + 1);
      },
    };
    return resetDb;
  };

  return {
    makeCommands: [
      makeToggleCompleteTaskCommand,
      makeCommand,
      makeResetDbCommand,
    ] as MakeUserStoreCommand[],
  };
};
