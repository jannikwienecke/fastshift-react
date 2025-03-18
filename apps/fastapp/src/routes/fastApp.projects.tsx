import {
  Categories,
  config,
  Owner,
  projectsConfig,
  Tasks,
  tasksConfig,
  views,
} from '@apps-next/convex';
import {
  DataType,
  makeDayMonthString,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  ClientViewProviderConvex,
  MakeComboboxPropsOptions,
  makeHooks,
  MakeInputDialogPropsOptions,
  makeViewFieldsConfig,
  QueryInput,
  useComboboxQuery,
} from '@apps-next/react';
import {
  ComboboxPopover,
  ContextMenuDefault,
  Filter,
  InputDialog,
  List,
} from '@apps-next/ui';
import { Memo, observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { getQueryKey } from '../query-client';

type ProjectViewDataType = DataType<
  'projects',
  { categories: Categories; owner: Owner; tasks: Tasks }
>;

const uiViewConfig = makeViewFieldsConfig<ProjectViewDataType>('projects', {
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
        comboboxListValue: ({ data }) => {
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

          return (
            <div className="flex flex-col items-start">
              <span className="text-xs text-foreground/80">
                {makeDayMonthString(date)}
              </span>
            </div>
          );
        },
      },
    },
  },
});

const Project = observer(() => {
  console.warn('Render Project View');
  const { useQueryData } = makeHooks();
  const data = useQueryData();

  return (
    <DefaultTemplate<ProjectViewDataType>
      listOptions={{
        fieldsLeft: ['label', 'description'],
        fieldsRight: ['tasks'],
      }}
    />
  );
});

const DefaultTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    RenderInputDialog?: React.FC;
    // ...render methods for all components
    // ...options for all components
  }) => {
    return (
      <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
        <div className="flex flex-col w-full ">
          <RenderFilter options={props.filterOptions} />
        </div>

        <RenderComboboxPopover options={props.comboboOptions} />

        {props.RenderInputDialog ? (
          <props.RenderInputDialog />
        ) : (
          <RenderInputDialog />
        )}

        <RenderContextmenu />

        <div className="flex flex-col w-full ">
          {/* <RenderQueryInput /> */}

          <RenderList options={props.listOptions} />
        </div>
        <hr />

        <Outlet />
      </div>
    );
  }
);

const RenderComboboxPopover = observer(
  ({ options }: { options?: MakeComboboxPropsOptions }) => {
    console.warn('Render Combobox Popover');
    const { makeComboboxProps } = makeHooks<RecordType>();
    return (
      <Memo>
        {() => {
          useComboboxQuery();
          return <ComboboxPopover {...makeComboboxProps(options)} />;
        }}
      </Memo>
    );
  }
);

const RenderFilter = observer(
  ({ options }: { options?: MakeFilterPropsOptions }) => {
    console.warn('Render Filter');
    const { makeFilterProps } = makeHooks<ProjectViewDataType>();
    return (
      <Memo>
        {() => {
          return <Filter.Default {...makeFilterProps(options)} />;
        }}
      </Memo>
    );
  }
);

const RenderInputDialog = observer(
  (props: { options?: MakeInputDialogPropsOptions }) => {
    console.warn('Render Input Dialog');
    const { makeInputDialogProps } = makeHooks<ProjectViewDataType>();
    return (
      <Memo>
        {() => {
          return (
            <InputDialog.Default {...makeInputDialogProps(props.options)} />
          );
        }}
      </Memo>
    );
  }
);

const RenderQueryInput = observer(() => {
  console.warn('Render Query Input');
  return <QueryInput />;
});

const RenderList = observer((props: { options?: MakeListPropsOptions }) => {
  const { makeListProps } = makeHooks<ProjectViewDataType>();
  console.warn('Render List');

  return (
    <Memo>
      {() => {
        return <List.Default {...makeListProps(props.options)} />;
      }}
    </Memo>
  );
});

export const Route = createFileRoute('/fastApp/projects')({
  loader: async ({ context }) => context.preloadQuery(projectsConfig),
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={projectsConfig}
        globalConfig={config.config}
        views={views}
        uiViewConfig={uiViewConfig}
        queryKey={getQueryKey(projectsConfig)}
      >
        <Project />
      </ClientViewProviderConvex>
    );
  },
});

const RenderContextmenu = observer(() => {
  const { makeContextmenuProps } = makeHooks<ProjectViewDataType>();

  return (
    <Memo>
      {() => {
        return <ContextMenuDefault {...makeContextmenuProps({})} />;
      }}
    </Memo>
  );
});
