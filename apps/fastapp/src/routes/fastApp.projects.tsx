import {
  Categories,
  Owner,
  projectsConfig,
  Tasks,
  tasksConfig,
} from '@apps-next/convex';
import { DataType } from '@apps-next/core';
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

type ProjectViewDataType = DataType<
  'projects',
  { categories: Categories; owner: Owner; tasks: Tasks }
>;

setViewFieldsConfig<ProjectViewDataType>('projects', {
  fields: {
    categories: {
      component: {
        list: ({ data }) => {
          return <>{data.categories?.label ?? 'Set Category'}</>;
        },
      },
    },
    tasks: {
      component: {
        list: ({ data }) => {
          const tasks = data.tasks.length;
          return (
            <div className="flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
              {tasks}
              <tasksConfig.icon className="w-4 h-4" />
            </div>
          );
        },
      },
    },
    owner: {
      component: {
        combobox: ({ data }) => {
          return <>{data?.firstname + ' ' + data.lastname}</>;
        },
        list: ({ data }) => {
          return <>{data.owner?.firstname ?? 'Set Owner'}</>;
        },
      },
    },
    label: {
      component: {
        list: ({ data }) => {
          return <>{data.label}</>;
        },
      },
    },
    dueDate: {
      component: {
        list: ({ data }) => {
          const date = new Date(data.dueDate);
          const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          });
          return (
            <div className="flex flex-col items-start">
              <span className="text-xs text-foreground/80">
                {formatter.format(date)}
              </span>
            </div>
          );
        },
      },
    },
  },
});

const ProjectPage = () => {
  const { useList } = makeHooks<ProjectViewDataType>();
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
            fieldsRight: ['categories', 'owner', 'tasks'],
            fieldsLeft: ['label', 'dueDate'],
          })}
        />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/fastApp/projects')({
  loader: async ({ context }) => context.preloadQuery(projectsConfig),
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={projectsConfig}
        globalConfig={config.config}
        views={getViews()}
        viewFieldsConfig={getViewFieldsConfig()}
      >
        <ProjectPage />
      </ClientViewProviderConvex>
    );
  },
});
