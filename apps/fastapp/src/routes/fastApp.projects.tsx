import { InferViewProps } from '@apps-next/core';
import { Form, QueryInput } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { projectsBaseView } from '../config';

export const Route = createFileRoute('/fastApp/projects')({
  component: () => projectsBaseView.createScreen(ProjectsComponent),
});

const ProjectsComponent = ({
  data: projects,
}: InferViewProps<typeof projectsBaseView>) => {
  const [isAdd, setIsAdd] = React.useState(false);
  const getListProps = projectsBaseView.useList();

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

        <List {...getListProps({ descriptionKey: 'description' })} />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
