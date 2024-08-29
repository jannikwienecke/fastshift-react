'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import {
  makeHooks,
  QueryInput,
  useHandleSelectCombobox,
} from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import {
  CompletedComponent,
  PriorityComponent,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsCombobox,
  TagsComponent,
} from './tasks.components';
import { TaskViewDataType } from './tasks.types';

setClientViewConfig<TaskViewDataType>('task', {
  fields: {
    completed: {
      component: {
        list: CompletedComponent,
        combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponent,
      },
    },

    tag: {
      component: {
        list: TagsComponent,
        combobox: TagsCombobox,
      },
    },
    project: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
      },
    },
  },
});

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'task'>;
}) => {
  const { useList, useQuery, useForm, useQueryData } =
    makeHooks<TaskViewDataType>();

  const handleSelect = useHandleSelectCombobox();

  const getListProps = useList({
    comboboxOptions: {
      onSelect: handleSelect,
    },
  });
  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  // console.log(data?.[0].tags?.[0].tag.name);
  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  const queryData = useQueryData();

  return (
    <div className="p-4 pb-0 flex flex-col w-full overflow-scroll h-[calc(100vh-16px)]">
      <div className="pt-1 border-b border-gray-100">
        <div>
          <QueryInput />
        </div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}
      </div>

      <List.Default
        {...getListProps({
          fieldsLeft: ['name', 'priority'],
          fieldsRight: ['project', 'tag'],
        })}
      />
    </div>
  );
};
