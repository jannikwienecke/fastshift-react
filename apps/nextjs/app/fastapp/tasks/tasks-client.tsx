'use client';

import {
  clientViewConfigAtom,
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import { makeHooks, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { Project, Tag } from '@prisma/client';
import { useAtomValue } from 'jotai';

setClientViewConfig('task', {
  fields: {
    completed: {
      component: ({ data }) => (
        <div>{data.getItemValue('completed') ? '✅' : '❌'}</div>
      ),
    },

    priority: {
      component: (props) => {
        const PRIORITY_COLORS = {
          low: '🟢',
          medium: '🟡',
          high: '🔴',
        };

        const priority = props.data.getItemValue('priority');

        return <div>{PRIORITY_COLORS[priority]}</div>;
      },
    },

    // TODO: Clean up types here
    // @ts-expect-error INVALID FIELD
    tags: {
      component: ({ data }: any) => {
        return <div>Tags...</div>;
      },
    },
  },
});

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'task'>;
}) => {
  const { useList, useQuery, useForm, useQueryData } = makeHooks<
    'task',
    {
      project: Project;
      tags: {
        tag: Tag;
      }[];
    }
  >(viewConfig);

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
