import { useStoreDispatch, useStoreValue } from '@apps-next/core';
import { createView, QueryInput, useMutation } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const TasksView = createView(
  'tasks',

  {
    displayField: {
      field: 'name',

      // CELL UNSUPPORTED TYPE FOR CONVEX
      // CANNOT SEND TO THE SEVER -> NEED TO CLEAN CLIENT ONLY CONFIG
      //  cell: (value) => <div>{value.name}</div>
    },
  },
  ({ data, useList, useForm }) => {
    const getListProps = useList();
    const getFormProps = useForm();

    const { edit } = useStoreValue();

    const dispatch = useStoreDispatch();

    const ScreenControl = () => {
      return (
        <div className="w-full pb-6 flex justify-end">
          <button
            onClick={() => dispatch({ type: 'ADD_NEW_RECORD' })}
            className="border border-black p-1 px-4 rounded-md"
          >
            Add
          </button>
        </div>
      );
    };

    return (
      <div className="p-2 flex gap-2 grow overflow-scroll">
        <div className="flex flex-col w-full ">
          <ScreenControl />

          <h1>tasks</h1>
          <QueryInput />

          {edit.isEditing ? <Form {...getFormProps()} /> : null}

          <List {...getListProps()} />
        </div>
        <hr />

        <Outlet />
      </div>
    );
  }
);

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => <TasksView />,
});
