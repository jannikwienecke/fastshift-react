'use client';

import {
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import { makeHooks, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { Example as ComboboxExample } from './combobox';

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'task'>;
}) => {
  const { useList, useQuery, useForm } = makeHooks(viewConfig);

  const getListProps = useList();
  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

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

  // return <ComboboxExample />;
};

// export const TasksClient = ({
//   viewConfig,
// }: {
//   viewConfig: ViewConfigType<'post'>;
// }) => {
//   return (
//     <ViewProvider
//       view={{ viewConfigManager: new BaseViewConfigManager(viewConfig) }}
//     >
//       <TasksClientContent viewConfig={viewConfig} />
//     </ViewProvider>
//   );
// };
