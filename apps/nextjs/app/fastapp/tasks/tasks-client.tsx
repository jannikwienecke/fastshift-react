'use client';

import {
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import { makeHooks, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { Tag } from '@prisma/client';

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'task'>;
}) => {
  const { useList, useQuery, useForm } = makeHooks<
    'task',
    {
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

  return (
    <div className="p-4 flex flex-col gap-2 w-full">
      <button onClick={() => dispatch({ type: 'ADD_NEW_RECORD' })}>
        Add New
      </button>

      <div>
        <QueryInput />
      </div>

      <div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}

        <List {...getListProps({ descriptionKey: 'priority' })} />
      </div>
    </div>
  );
};

// export const TasksClient = ({
//   viewConfig,
// }: {
//   viewConfig: ViewConfigType<'task'>;
// }) => {
//   return (
//     <ViewProvider
//       view={{ viewConfigManager: new BaseViewConfigManager(viewConfig) }}
//     >
//       <TasksClient_ viewConfig={viewConfig} />
//     </ViewProvider>
//   );
// };
