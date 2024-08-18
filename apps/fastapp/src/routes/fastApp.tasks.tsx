import { Form, QueryInput, useMutation, ViewProvider } from '@apps-next/react';
import { List, ShineBorder } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';
import { _createView } from '../config-model';

// export const Route = createFileRoute('/fastApp/tasks')({
//   component: () =>
//     _createView(
//       'projects',
//       { displayField: { field: 'label' } },
//       {
//         Component: (props) => {
//           const getListProps = props.useList();

//           return (
//             <div>
//               <>
//                 Tasks
//                 <List {...getListProps()} />
//               </>
//             </div>
//           );
//         },
//       }
//     ),
// });

const taskBase = _createView(
  'projects',
  {
    displayField: { field: 'label' },
  },
  null
);

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => (
    <ViewProvider view={taskBase}>
      <TasksView />
    </ViewProvider>
  ),
});

// const Componen =

const TasksView = () => {
  const getListProps = taskBase.useList();
  const { data } = taskBase.useQuery({});

  const { mutate } = useMutation();

  // @ts-expect-error - THIS IS FOR TESTING
  const INVALID = data?.[0].INVALID_FIELD;

  // @ts-expect-error - THIS IS FOR TESTING
  const COOL = getListProps().items?.[0]?.INVALID_FIELD;

  const [isAdd, setIsAdd] = React.useState(false);

  const ScreenControl = () => {
    return (
      <div className="w-full pb-6 flex justify-end">
        <button
          onClick={() => {
            mutate({
              mutation: {
                type: 'CREATE_RECORD',
                record: {
                  label: 'test',
                  description: 'test',
                  ownerId: 'jn7199c7wsfqz3ne782ggagsf16ywr3z',
                  categoryId: 'jh743ap41j1q4vv2tgbx4tag656ywhaq',
                  dueDate: new Date().getTime(),
                },
              },
            });
          }}
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

        <ShineBorder color={['#A07CFE', '#FE8FB5', '#FFBE7B']}>
          <button className="w-24 h-12">Test</button>
        </ShineBorder>

        <h1>tasks</h1>

        <QueryInput />

        {/* <section className="">
          <AnimatedList>
            {data?.map((task) => (
              <li key={task.id}>{task.label}</li>
            ))}
          </AnimatedList>
        </section> */}

        <List {...getListProps()} />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};
