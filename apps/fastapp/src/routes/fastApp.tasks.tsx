import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { List, QueryInput } from '@apps-next/react';
import { taskBaseView } from '../config';

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => taskBaseView.createScreen(TasksComponent),
});

const TasksComponent = ({
  data: tasks,
}: ReturnType<typeof taskBaseView.useQuery>) => {
  const [isAdd, setIsAdd] = React.useState(false);

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

  const Form = () => {
    return (
      <div className="w-full pb-6 flex justify-end">
        <input className="border border-black p-1 px-4 rounded-md" />
        <button className="border border-red-500 p-1 px-4 rounded-md">
          Save
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

        <List />
        {tasks?.map((task) => (
          <div key={task.id}>
            {task.name} - {task.completed ? '✅' : '❌'}
          </div>
        ))}

        {/* <List.Default {...list.getProps({ data })} /> */}
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
