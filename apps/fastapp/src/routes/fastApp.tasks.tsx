import { Outlet, createFileRoute } from '@tanstack/react-router';
// import { List, useList } from "lib/react/ui";
import React from 'react';
// import { taskBaseView } from "src/views";
// import schema from "src/schema";
import { useQuery as useQueryTanstack } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@apps-next/convex';
export const Route = createFileRoute('/fastApp/tasks')({
  // component: () => taskBaseView.createScreen(ProjectsComponent),
  component: TasksComponent,
});

function TasksComponent() {
  const data = useQueryTanstack(convexQuery(api.query.create, {}));

  // const { data } = taskBaseView.useQuery({ query: "" });
  // const list = useList();

  // console.log(schema);

  // console.log({ config });
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
        {data.data?.map((task) => (
          <div key={task._id}>{task.name}</div>
        ))}

        {/* <List.Default {...list.getProps({ data })} /> */}
      </div>
      <hr />

      <Outlet />
    </div>
  );
}
