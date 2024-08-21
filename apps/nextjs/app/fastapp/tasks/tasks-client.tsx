'use client';

import { useStoreValue, ViewConfigType } from '@apps-next/core';
import { makeHooks, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'post'>;
}) => {
  const { useList, useQuery, useForm } = makeHooks(viewConfig);

  const getListProps = useList();
  const { edit } = useStoreValue();

  const { data } = useQuery();

  const content = data?.[0]?.content;

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  const getFormProps = useForm();

  return (
    <div className="p-4 flex flex-col gap-2 w-full">
      <div>
        <QueryInput />
      </div>

      <div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}

        <List {...getListProps({ descriptionKey: 'content' })} />
      </div>
    </div>
  );
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
