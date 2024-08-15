import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { Form, List, QueryInput } from '@apps-next/react';
import { projectsBaseView } from '../config';
import { InferViewProps } from '@apps-next/core';

export const Route = createFileRoute('/fastApp/projects')({
  component: () => projectsBaseView.createScreen(ProjectsComponent),
});

const ProjectsComponent = ({
  data: projects,
}: InferViewProps<typeof projectsBaseView>) => {
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

        <div className="bg-red-300">
          Table: {projectsBaseView.getViewManager().getTableName()}
        </div>

        <QueryInput />

        <List />
        <div className="flex flex-col gap-4 p-4 w-full">
          {projects?.map((project) => (
            <div key={project.id} className="flex flex-col">
              <div className="text-lg font-bold">{project.label}</div>
              <div>{project.description}</div>
            </div>
          ))}
        </div>

        {/* <List.Default {...list.getProps({ data })} /> */}
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
