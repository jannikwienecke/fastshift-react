import { config, tasksConfig } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
  useCombobox,
  UseComboboxProps,
  useFilterAdapter,
  useFilterStore,
  useHandleSelectCombobox,
  useInputDialogAdapter,
  useInputDialogStore,
  useStoreValue,
} from '@apps-next/react';
import { ComboboxPopover, Filter, InputDialog, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
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

  const { handleSelectFromFilter } = useInputDialogStore();

  const {
    closeAll,
    propsForCombobox,
    handleSelectValue,
    handleEnterValueFromInputDialog,
  } = useFilterStore();

  const getInputDialogProps = useInputDialogAdapter({
    onSave: handleEnterValueFromInputDialog,
    onCancel: closeAll,
  });

  const getFilterProps = useFilterAdapter({
    onSelect: handleSelectFromFilter,
  });

  const { list } = useStoreValue();

  const filterComboboxProps = {
    state: propsForCombobox,
    onClose: closeAll,
    onSelect: handleSelectValue,
  } satisfies UseComboboxProps;

  const listComboboxProps = {
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  } satisfies UseComboboxProps;

  // // TODO: we should not save it on list -> but have like selected: {type: "list or whatever"}

  const getComboboxProps = useCombobox(
    list?.focusedRelationField ? listComboboxProps : filterComboboxProps
  );

  return (
    <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <Filter.Default {...getFilterProps()} />
      </div>

      <ComboboxPopover {...getComboboxProps()} />

      <InputDialog.Default {...getInputDialogProps()} />

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
