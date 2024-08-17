import { Form, QueryInput, ViewProvider } from '@apps-next/react';
import { List } from '@apps-next/ui';
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

  // @ts-expect-error - THIS IS FOR TESTING
  const INVALID = data?.[0].INVALID_FIELD;

  // @ts-expect-error - THIS IS FOR TESTING
  const COOL = getListProps().items?.[0].INVALID_FIELD;

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

        <List {...getListProps()} />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

// export const Route = createFileRoute('/fastApp/tasks')({
//   component: () => taskBaseView.createScreen(TasksComponent),
// });

// const TasksComponent = ({
//   data: tasks,
// }: InferViewProps<typeof taskBaseView>) => {
//   const [isAdd, setIsAdd] = React.useState(false);

//   const getListProps = taskBaseView.useList();

//   const ScreenControl = () => {
//     return (
//       <div className="w-full pb-6 flex justify-end">
//         <button
//           onClick={() => setIsAdd(!isAdd)}
//           className="border border-black p-1 px-4 rounded-md"
//         >
//           Add
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="p-2 flex gap-2 grow">
//       <div className="flex flex-col w-full ">
//         <ScreenControl />

//         {isAdd && <Form />}

//         <div>tasks</div>

//         <QueryInput />

//         <List {...getListProps()} />
//       </div>
//       <hr />

//       <Outlet />
//     </div>
//   );
// };
