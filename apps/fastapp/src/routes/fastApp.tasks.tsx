import { InferViewProps } from '@apps-next/core';
import { Form, QueryInput } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { taskBaseView } from '../config';

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => taskBaseView.createScreen(TasksComponent),
});

const TasksComponent = ({
  data: tasks,
}: InferViewProps<typeof taskBaseView>) => {
  const [isAdd, setIsAdd] = React.useState(false);

  const getListProps = taskBaseView.useList();

  const ScreenControl = () => {
    return (
      <div className="w-full pb-6 flex justify-end">
        <button
          onClick={() => setIsAdd(!isAdd)}
          className="border border-black p-1 px-4 rounded-md"
        >
          Add
        </button>
      </div>
    );
  };

  return (
    <div className="p-2 flex gap-2 grow">
      <div className="flex flex-col w-full ">
        <ScreenControl />

        {isAdd && <Form />}

        <div>tasks</div>

        <QueryInput />

        <List {...getListProps()} />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
