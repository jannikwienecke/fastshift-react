import { config, tasksConfig, views } from '@apps-next/convex';
import { UserViewForm } from '@apps-next/core';
import { ClientViewProviderConvex, makeHooks, store$ } from '@apps-next/react';
import { InputDialog } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import {
  createFileRoute,
  Outlet,
  useLocation,
  useMatches,
  useParams,
  useRouter,
} from '@tanstack/react-router';
import React from 'react';
import { useCommands } from '../hooks/app.commands';
import { getQueryKey, getUserViewData } from '../query-client';
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

export const Route = createFileRoute('/fastApp/$view')({
  loader: async (props) => {
    return props.context.preloadQuery(
      tasksConfig,
      props.params.view,
      null
      // (props.params as { id?: string } | undefined)?.id || null
    );
  },

  component: () => <TaskComponent />,
});

const TaskComponent = observer(() => {
  const { commands } = useCommands();
  const { view } = useParams({ from: '/fastApp/$view' });
  const { id } = useParams({ strict: false });

  const router = useRouter();

  const userViewData = getUserViewData(view);

  const navigateRef = React.useRef(router.navigate);
  React.useEffect(() => {
    store$.userViewSettings.form.onChange((v) => {
      const change = v.changes?.[0];
      if (change.prevAtPath && !change.valueAtPath) {
        const prevAtPath = change.prevAtPath;
        const viewName = (prevAtPath as UserViewForm).viewName;
        navigateRef.current({ to: `/fastApp/${viewName}` });
      }
    });

    // store$.contextMenuState.row.onChange((changes) => {
    //   const row = changes.value;
    //   const prev = changes.changes?.[0].prevAtPath;
    //   if (!row || prev) return;
    //   router.navigate({
    //     to: `${row.id}`,
    //   });
    // });
  }, [router.navigate]);

  // () => router.preloadRoute({"to": `/fastApp/${view}${id}` });

  return (
    <ClientViewProviderConvex
      commands={commands}
      views={views}
      viewConfig={tasksConfig}
      globalConfig={config.config}
      uiViewConfig={uiViewConfig}
      queryKey={getQueryKey(tasksConfig, view, null)}
      userViewData={userViewData}
      viewId={id || null}
    >
      <Task />
      <Outlet />
    </ClientViewProviderConvex>
  );
});
