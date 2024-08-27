'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import { DataType, makeHooks, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { Project, Tag } from '@prisma/client';
import {
  CompletedComponent,
  PriorityComponent,
  TagsComponent,
} from './components';

type TaskViewDataType = DataType<
  'task',
  {
    project: Project;
    tags: {
      tag: Tag;
    }[];
  }
>;

setClientViewConfig<TaskViewDataType>('task', {
  fields: {
    completed: {
      component: CompletedComponent,
    },

    priority: {
      component: PriorityComponent,
    },

    tags: {
      component: TagsComponent,
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

  const getListProps = useList();
  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  // console.log(data?.[0].tags?.[0].tag.name);
  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  const queryData = useQueryData();

  return (
    <div className="p-4 flex flex-col gap-2 w-full overflow-scroll h-screen">
      <div className="py-1 border-b border-gray-200">
        <button onClick={() => dispatch({ type: 'ADD_NEW_RECORD' })}>
          Add New
        </button>

        <div>
          <QueryInput />
        </div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}
      </div>

      <List.Default
        {...getListProps({
          fieldsLeft: ['name', 'priority'],
          fieldsRight: ['project', 'tags'],
        })}
      />
    </div>
  );
};
