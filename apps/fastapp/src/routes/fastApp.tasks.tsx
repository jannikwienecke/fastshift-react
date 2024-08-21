import { useStoreDispatch, useStoreValue } from '@apps-next/core';
import { createView, GetViewProps, QueryInput } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAtomsDevtools } from 'jotai-devtools';

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
  (props) => {
    const DebugAtoms = () => {
      useAtomsDevtools('Store');
      return null;
    };

    const getListProps = props.useList();

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

          <DebugAtoms />

          <QueryInput />

          <FormRender {...props} />

          <List {...getListProps()} />
        </div>
        <hr />

        <Outlet />
      </div>
    );
  }
);

const FormRender = ({ useForm }: GetViewProps<'tasks'>) => {
  const getFormProps = useForm();

  const { edit } = useStoreValue();

  return <span>{edit.isEditing ? <Form {...getFormProps()} /> : null}</span>;
};

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => <TasksView />,
});
