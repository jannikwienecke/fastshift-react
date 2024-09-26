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
  useContextMenu,
  useFilterAdapter,
  useFilterStore,
  useHandleSelectCombobox,
  useInputDialogAdapter,
  useInputDialogStore,
  useStoreValue,
} from '@apps-next/react';
import {
  ComboboxPopover,
  ContextMenu,
  Filter,
  InputDialog,
  List,
} from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsCombobox,
  TagsComponent,
  TaskViewDataType,
} from '../views/tasks.components';

setViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    tags: {
      component: {
        list: TagsComponent,
        combobox: TagsCombobox,
        contextMenu: TagsCombobox,
      },
    },
    completed: {
      component: {
        list: CompletedComponent,
        combobox: CompletedComponentCombobox,
        contextMenu: CompletedComponentCombobox,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
        contextMenu: PriorityComponentCombobox,
      },
    },

    projects: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
        contextMenu: ProjectComponentCombobox,
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
    activeFilterValue,
  } = useFilterStore();

  const getInputDialogProps = useInputDialogAdapter({
    onSave: handleEnterValueFromInputDialog,
    onCancel: closeAll,
    defaultValue: activeFilterValue,
  });

  const getFilterProps = useFilterAdapter({
    onSelect: handleSelectFromFilter,
  });

  const { list, contextMenu } = useStoreValue();

  const filterComboboxProps = {
    state: propsForCombobox,
    onClose: closeAll,
    onSelect: (props) => {
      handleSelectValue(props);
    },
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

  const getContextMenuProps = useContextMenu({
    onSelectField: (field, row) => {
      console.log(field, row);
    },
    selectedRow: contextMenu?.row,
  });

  return (
    <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <Filter.Default {...getFilterProps()} />
      </div>
      <ComboboxPopover {...getComboboxProps()} />
      <InputDialog.Default {...getInputDialogProps()} />

      <div className="flex flex-col w-full relative">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['tags', 'priority', 'completed'],
            fieldsLeft: ['name', 'projects'],
          })}
          contextMenu={<ContextMenu.Default {...getContextMenuProps()} />}
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
// when filtering the field options -> the filteing process does not work. e.g.: enter "tag" , delete it and enter "project"
// we need to handle the different operations like is in or is not in
// we need to persist the filters somewhere (own db table that we expose?)
// we need to style the ui
