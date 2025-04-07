import { api } from '@apps-next/convex';
import { Command } from '@apps-next/core';
import { useConvexMutation } from '@convex-dev/react-query';
import { observable } from '@legendapp/state';
import { useMutation } from '@tanstack/react-query';
import { TrashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resettingDb$ } from '../application-store/app.store';

const waitFor = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const reset$ = observable(0);
export const useCommands = () => {
  const { t } = useTranslation();
  const { mutateAsync } = useMutation({
    mutationFn: useConvexMutation(api.init.default),
  });

  const command: Command = {
    icon: TrashIcon,
    id: 'reset-db',
    label: t('commands.resetDb'),
    handler: async (options) => {
      resettingDb$.set(true);
      const promises = [mutateAsync({}), waitFor(1000)];
      await Promise.all(promises);
      resettingDb$.set(false);

      reset$.set((prev) => prev + 1);
    },
  };

  return {
    commands: [command],
  };
};
