import { config, tasksConfig, views } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
  useInputDialogStore,
} from '@apps-next/react';
import { ComboboxPopover, Filter, InputDialog, List } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getQueryKey } from '../main';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TaskViewDataType,
} from '../views/tasks.components';

setViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    tags: {
      component: {
        list: TagsComponent,
      },
    },
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

    projects: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
      },
    },
  },
});

const Task = observer(() => {
  useInputDialogStore();

  // HIER WEITER MACHEN
  // then: opmtimize list view with the For loop from legend state lib

  const { makeFilterProps, makeInputDialogProps, makeComboboxProps } =
    makeHooks<TaskViewDataType>();

  return (
    <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <Filter.Default {...makeFilterProps({ hideFields: ['subtitle'] })} />
      </div>

      <ComboboxPopover {...makeComboboxProps()} />

      <InputDialog.Default {...makeInputDialogProps()} />

      <div className="flex flex-col w-full ">
        <QueryInput />

        <RenderList />
      </div>
      <hr />

      <Outlet />
    </div>
  );
});

const RenderList = observer(() => {
  const { useList } = makeHooks<TaskViewDataType>();
  const getListProps = useList();

  return (
    <>
      <List.Default
        {...getListProps({
          fieldsRight: ['tags', 'priority', 'completed'],
          fieldsLeft: ['name', 'projects'],
        })}
      />
    </>
  );
});

export const Route = createFileRoute('/fastApp/tasks')({
  loader: async ({ context }) => context.preloadQuery(tasksConfig),
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={tasksConfig}
        globalConfig={config.config}
        views={views}
        viewFieldsConfig={getViewFieldsConfig()}
        queryKey={getQueryKey(tasksConfig)}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});
