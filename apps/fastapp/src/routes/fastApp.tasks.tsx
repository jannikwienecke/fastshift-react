import { config, tasksConfig, views } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
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
  // parse this list to makeListProps -> no usage of hook
  const { useList } = makeHooks<TaskViewDataType>();
  const getListProps = useList();

  // optimize this list with the For loop from legend state lib
  // list should "neber update" if only one list item changes
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
      // write abstaction -> Application code - not lib code
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
