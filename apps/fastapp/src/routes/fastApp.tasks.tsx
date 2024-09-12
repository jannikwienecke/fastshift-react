import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
  useCombobox,
  useHandleSelectCombobox,
  useStoreValue,
} from '@apps-next/react';
import { ComboboxPopover, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { config } from '../global-config';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  TagsComponent,
  TaskViewDataType,
} from '../views/tasks.components';
import { tasksConfig } from '@apps-next/convex';

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

    // project: {
    //   component: {
    //     list: ProjectComponent,
    //     combobox: ProjectComponentCombobox,
    //   },
    // },
  },
});

const Task = () => {
  const { useList } = makeHooks(tasksConfig);
  const getListProps = useList();

  const { handleClose, handleSelect } = useHandleSelectCombobox();

  // TODO: we should not save it on list -> but have like selected: {type: "list or whatever"}
  const { list } = useStoreValue();

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  });

  return (
    <div className="p-2 flex gap-2 grow overflow-scroll">
      <ComboboxPopover {...getComboboxProps()} />

      <div className="flex flex-col w-full ">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['tags', 'priority', 'completed'],
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
