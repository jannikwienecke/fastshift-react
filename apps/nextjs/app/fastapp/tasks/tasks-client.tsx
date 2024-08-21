'use client';

import { ViewConfigType } from '@apps-next/core';
import { QueryInput, makeHooks } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';

export const TasksClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'post'>;
}) => {
  const { useList, useQuery, useForm } = makeHooks(viewConfig);

  const getListProps = useList();
  const { data } = useQuery();
  const item = getListProps().items?.[0];

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
        <Form {...getFormProps()} />

        <List {...getListProps({ descriptionKey: 'content' })} />
      </div>
    </div>
  );
};
