import { config, tasksConfig, views } from '@apps-next/convex';
import {
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
import { cn, ComboboxPopover, Filter, InputDialog, List } from '@apps-next/ui';
import { Memo, observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { getQueryKey } from '../main';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TaskViewDataType,
} from '../views/tasks.components';

const viewFieldsConfig = makeViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    tags: {
      component: {
        list: TagsComponent,
      },
    },
    completed: {
      component: {
        list: CompletedComponent,
        combobox: CompletedComponentCombobox,
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
    dueDate: {
      component: {
        list: ({ data }) => {
          if (!data.dueDate) return null;

          const date = new Date(data.dueDate);
          const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'short',
          });

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const isInTheNext7Days =
            date.getTime() >= today.getTime() &&
            date.getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

          const isOverdue = date.getTime() < today.getTime();

          return (
            <div className="flex flex-row items-center gap-1 border border-foreground/10 rounded-lg px-1 p-1">
              <div>
                <CalendarIcon
                  className={cn(
                    'w-4 h-4',
                    isInTheNext7Days
                      ? 'text-orange-500'
                      : isOverdue
                      ? 'text-red-500'
                      : 'text-foreground/80'
                  )}
                />
              </div>
              <span className="text-xs text-foreground/80">
                {formatter.format(date)}
              </span>
            </div>
          );
        },
        combobox: ({ data }) => {
          return (
            <div className="flex items-center gap-1">
              <div>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>{data}</div>
            </div>
          );
        },
      },
    },
  },
});

const Task = observer(() => {
  console.log('Render Task View');
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

  return (
    <DefaultTemplate<TaskViewDataType>
      listOptions={{
        fieldsLeft: ['name', 'projects', 'dueDate'],
        fieldsRight: ['tags', 'completed', 'priority'],
      }}
      filterOptions={{
        hideFields: ['subtitle'],
      }}
      RenderInputDialog={observer(() => (
        <InputDialog.Default {...makeInputDialogProps({})} />
      ))}
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

        <div className="flex flex-col w-full ">
          <RenderQueryInput />

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
    console.log('Render Combobox Popover');
    const { makeComboboxProps } = makeHooks<RecordType>();

    return (
      <>
        <Memo>
          {() => {
            useComboboxQuery();
            return <ComboboxPopover {...makeComboboxProps(options)} />;
          }}
        </Memo>
      </>
    );
  }
);

const RenderFilter = observer(
  ({ options }: { options?: MakeFilterPropsOptions }) => {
    console.log('Render Filter');
    const { makeFilterProps } = makeHooks<TaskViewDataType>();
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
    console.log('Render Input Dialog');
    const { makeInputDialogProps } = makeHooks<TaskViewDataType>();
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
  console.log('Render Query Input');
  return <QueryInput />;
});

const RenderList = observer((props: { options?: MakeListPropsOptions }) => {
  const { makeListProps } = makeHooks<TaskViewDataType>();
  console.log('Render List');

  return (
    <Memo>
      {() => {
        return <List.Default {...makeListProps(props.options)} />;
      }}
    </Memo>
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
        viewFieldsConfig={viewFieldsConfig}
        queryKey={getQueryKey(tasksConfig)}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});
