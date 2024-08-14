import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { Form, List, QueryInput } from '@apps-next/react';
import { projectsBaseView } from '../config';

export const Route = createFileRoute('/fastApp/projects')({
  component: () => projectsBaseView.createScreen(TasksComponent),
});

const TasksComponent = ({
  data: projects,
}: ReturnType<typeof projectsBaseView.useQuery>) => {
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

  return (
    <div className="p-2 flex gap-2 grow">
      <div className="flex flex-col w-full ">
        <ScreenControl />

        {isAdd && <Form />}

        <div>tasks</div>

        <QueryInput />

        <List />
        {projects?.map((project) => (
          <div key={project.text}>{project.text}</div>
        ))}

        {/* <List.Default {...list.getProps({ data })} /> */}
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
