import { tasksConfig } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
  useCombobox,
  useFilterAdapter,
  useHandleSelectCombobox,
  useStoreValue,
} from '@apps-next/react';
import { ComboboxPopover, Filter, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { config } from '../global-config';
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

const Task = () => {
  const { useList } = makeHooks<TaskViewDataType>();
  const getListProps = useList();

  const { handleClose, handleSelect } = useHandleSelectCombobox();

  const getFilterProps = useFilterAdapter();

  // // TODO: we should not save it on list -> but have like selected: {type: "list or whatever"}
  const { list } = useStoreValue();

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  });

  return (
    <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <Filter.Default {...getFilterProps()} />
      </div>

      <ComboboxPopover {...getComboboxProps()} />

      <div className="flex flex-col w-full ">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['tags', 'priority', 'completed'],
            fieldsLeft: ['name', 'projects'],
          })}
        />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/fastApp/tasks')({
  loader: async ({ context }) => context.preloadQuery(tasksConfig),
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

// STATE: FILTERS
// we need to handle the different operations like is in or is not in
// we need to persist the filters somewhere (own db table that we expose?)
// we need to style the ui
