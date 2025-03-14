import { config, tasksConfig, views } from '@apps-next/convex';
import { ClientViewProviderConvex, makeHooks } from '@apps-next/react';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';
import { getQueryKey } from '../query-client';
import { DefaultViewTemplate } from '../views/default-view-template';
import { TaskViewDataType } from '../views/tasks.components';
import { viewFieldsConfig } from '../views/tasks.viewfieldsConfig';

const Task = observer(() => {
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

  return (
    <DefaultViewTemplate<TaskViewDataType>
      listOptions={{
        fieldsLeft: ['name', 'projects', 'dueDate'],
        fieldsRight: ['tags', 'completed', 'priority'],
      }}
      filterOptions={{
        hideFields: ['subtitle'],
      }}
      displayOptions={{
        sorting: { defaultSortingField: 'name' },
        displayFieldsToShow: [
          'name',
          'completed',
          'description',
          'name',
          'priority',
          'projects',
          'tags',
        ],
      }}
      RenderInputDialog={observer(() => (
        <InputDialog.Default {...makeInputDialogProps({})} />
      ))}
    />
  );
});

export const Route = createFileRoute('/fastApp/tasks')({
  loader: async ({ context }) => context.preloadQuery(tasksConfig),
  component: () => {
    return (
      <ClientViewProviderConvex
        views={views}
        viewConfig={tasksConfig}
        globalConfig={config.config}
        viewFieldsConfig={viewFieldsConfig}
        queryKey={getQueryKey(tasksConfig)}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});
