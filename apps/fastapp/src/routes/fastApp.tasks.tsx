import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
} from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { config, makeViewConfig } from '../global-config';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  TaskViewDataType,
} from '../views/tasks.components';
import { tasksConfig } from '@apps-next/convex';

setViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    completed: {
      component: {
        list: CompletedComponent,
        // combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
      },
    },

    // tag: {
    //   component: {
    //     list: TagsComponent,
    //     combobox: TagsCombobox,
    //   },
    // },
    // project: {
    //   component: {
    //     list: ProjectComponent,
    //     combobox: ProjectComponentCombobox,
    //   },
    // },
  },
});

const Task = () => {
  const { useList, useQueryData } = makeHooks(tasksConfig);
  const getListProps = useList();

  return (
    <div className="p-2 flex gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['priority', 'completed'],
            fieldsLeft: [],
          })}
        />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={tasksConfig}
        globalConfig={config.config}
        views={getViews()}
        viewFieldsConfig={getViewFieldsConfig()}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});
