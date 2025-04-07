import { config, tasksConfig, views } from '@apps-next/convex';
import { ClientViewProviderConvex, makeHooks, store$ } from '@apps-next/react';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { createFileRoute } from '@tanstack/react-router';
import { useCommands } from '../hooks/app.commands';
import { getQueryKey } from '../query-client';
import { DefaultViewTemplate } from '../views/default-view-template';
import { TaskViewDataType } from '../views/tasks.components';
import { uiViewConfig } from '../views/tasks.config';

const Task = observer(() => {
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

  return (
    <DefaultViewTemplate<TaskViewDataType>
      listOptions={{
        fieldsLeft: ['name', 'projects', 'dueDate'],
        fieldsRight: ['tags', 'completed', 'priority', 'todos'],
      }}
      filterOptions={{
        hideFields: [],
      }}
      displayOptions={{
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
  component: () => <TaskComponent />,
});

const TaskComponent = observer(() => {
  const { commands } = useCommands();

  return (
    <ClientViewProviderConvex
      commands={commands}
      views={views}
      viewConfig={tasksConfig}
      globalConfig={config.config}
      uiViewConfig={uiViewConfig}
      queryKey={getQueryKey(tasksConfig)}
    >
      <Task />
    </ClientViewProviderConvex>
  );
});
