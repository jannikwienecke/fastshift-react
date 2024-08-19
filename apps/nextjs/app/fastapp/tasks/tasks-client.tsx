'use client';

import { RegisteredRouter } from '@apps-next/core';
import { creatatePrismaViewConfig } from '@apps-next/query-adapter';
import { createGenericView, createView } from '@apps-next/react';
import { List } from '@apps-next/ui';

const _viewConfig = creatatePrismaViewConfig('post', {
  displayField: { field: 'title' },
});

createGenericView(
  'post',
  { displayField: { field: 'title' } },
  {
    Component: ({ data }) => {
      return <div>{data.data?.[0]?.title}</div>;
    },
  }
);

type XX = RegisteredRouter['config']['testType']['post'];

export const TasksClientContent = createView(_viewConfig.viewConfig, {
  Component: ({ useList, data }) => {
    const getListProps = useList();
    const item = getListProps().items?.[0];

    const test = data.data?.[0].content;

    return (
      <div>
        <List {...getListProps()} />
      </div>
    );
  },
});

export const TasksClient = () => {
  return (
    <>
      <TasksClientContent />
    </>
  );
};
