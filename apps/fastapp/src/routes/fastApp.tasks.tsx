import { createView } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { createFileRoute } from '@tanstack/react-router';

const TasksView = createView(
  'tasks',
  { displayField: { field: 'name', cell: (value) => <div>{value.name}</div> } },
  {
    Component: ({ data, useList }) => {
      const getListProps = useList();
      console.log(data?.data?.[0]?.name);

      // @ts-expect-error INVALID FIELD
      const INVALID = data?.data?.[0]?.NOT_VALID_FIELD;

      return (
        <div>
          <List {...getListProps()} />
        </div>
      );
    },
  }
);

// const TasksView = () => {
//   const getListProps = taskBase.useList();

//   const { mutate } = useMutation();

//   const [isAdd, setIsAdd] = React.useState(false);

//   const ScreenControl = () => {
//     return (
//       <div className="w-full pb-6 flex justify-end">
//         <button
//           onClick={() => {
//             mutate({
//               mutation: {
//                 type: 'CREATE_RECORD',
//                 record: {
//                   label: 'test',
//                   description: 'test',
//                   ownerId: 'jn7199c7wsfqz3ne782ggagsf16ywr3z',
//                   categoryId: 'jh743ap41j1q4vv2tgbx4tag656ywhaq',
//                   dueDate: new Date().getTime(),
//                 },
//               },
//             });
//           }}
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

//         <ShineBorder color={['#A07CFE', '#FE8FB5', '#FFBE7B']}>
//           <button className="w-24 h-14">Test</button>
//         </ShineBorder>

//         <h1>tasks</h1>

//         <QueryInput />

//         <List {...getListProps()} />
//       </div>
//       <hr />

//       <Outlet />
//     </div>
//   );
// };

export const Route = createFileRoute('/fastApp/tasks')({
  component: () => (
    // <ViewProvider view={{ viewConfigManager: taskBase.viewConfigManager }}>
    <TasksView />
    // </ViewProvider>
  ),
});
