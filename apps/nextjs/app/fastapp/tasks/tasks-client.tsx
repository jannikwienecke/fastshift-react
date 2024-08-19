'use client';

import { createView } from '@apps-next/react';
import { List } from '@apps-next/ui';

export const TasksClientContent = createView(
  'post',
  {
    displayField: { field: 'title' },
  },
  {
    Component: ({ useList, data }) => {
      const getListProps = useList();
      const item = getListProps().items?.[0];

      const test = data.data?.[0].content;

      // @ts-expect-error INVALID FIELD
      const INVALID = data.data?.[0]?.NOT_VALID_FIELD;

      return (
        <div>
          <List {...getListProps()} />
        </div>
      );
    },
  }
);

export const TasksClient = () => {
  return (
    <>
      <TasksClientContent />
    </>
  );
};
