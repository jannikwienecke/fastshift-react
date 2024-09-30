import { config, tasksConfig, views } from '@apps-next/convex';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  listItems$,
  makeHooks,
  QueryInput,
  setViewFieldsConfig,
} from '@apps-next/react';
import { ComboboxPopover, Filter, InputDialog, List } from '@apps-next/ui';
import { For, observer } from '@legendapp/state/react';
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
import { ListItem, ListProps } from '@apps-next/core';

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

function ListDefault<TItem extends ListItem = ListItem>({
  onSelect,
  selected,
}: ListProps<TItem>) {
  console.log('RENDER LIST');
  return (
    <List.Provider onSelect={onSelect} selected={selected}>
      <For each={listItems$}>
        {(item) => {
          console.log('RENDER LIST ITEM');
          return (
            <List.Item key={item.id.get()} className="" item={item.get()}>
              <div className="flex gap-1 pr-2">
                <List.Control />
                <List.Icon icon={item.icon.get()} />
              </div>

              <List.Values>
                <List.ValuesLeft values={item.valuesLeft.get()} />
                <List.ValuesRight values={item.valuesRight.get()} />
              </List.Values>
            </List.Item>
          );
        }}
      </For>
      {/* {items.map((item) => {
        return (
          <List.Item key={item.id} className="" item={item}>
            <div className="flex gap-1 pr-2">
              <List.Control />
              <List.Icon icon={item?.icon} />
            </div>

            <List.Values>
              <List.ValuesLeft values={item.valuesLeft} />
              <List.ValuesRight values={item.valuesRight} />
            </List.Values>
          </List.Item>
        );
      })} */}
    </List.Provider>
  );
}

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
  const { makeListProps } = makeHooks<TaskViewDataType>();
  // optimize this list with the For loop from legend state lib
  // list should "neber update" if only one list item changes
  return (
    <>
      <ListDefault
        {...makeListProps({
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
