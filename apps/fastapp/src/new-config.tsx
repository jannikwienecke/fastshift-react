import { schema } from '@apps-next/convex';
import {
  createConfigFromConvexSchema,
  createConvexViewConfig,
} from '@apps-next/convex-adapter-app';
// import { Register } from '@apps-next/core';

// export const config = new ConfigWithouUi(schema);
export const config = createConfigFromConvexSchema(schema);
// createConvexViewConfig('dsad', {})

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
  }
}

// const View = createView(
//   'tasks',
//   {
//     displayField: {
//       field: 'name',
//     },
//   },
//   {
//     Component: ({ data, useList }) => {
//       const list = useList();
//       console.log(list().items?.[0].id);
//       // @ts-expect-error
//       console.log(list().items?.[0].NOT_VALID_FIELD);

//       // @ts-expect-error
//       const invalid = <div>Hello: {data.data?.[0].NOT_VALID_FIELD}</div>;

//       return <div>Hello: {data.data?.[0].completed}</div>;
//     },
//   }
// );

// schema.tables.tasks.validator

// const data = loader('tasks', {
//   name: {
//     label: 'Name',
//   },
// });

// const xx = data.data?.[0];

// const ComponentX = () => {
//   const data = useStableQuery('tasks', '', '');
//   console.log(data.data?.[0].priority);
//   return null;
// };

// const test = config.createView('tasks', {
//   Component: (props) => {
//     return <div>Hello: {props.data?.[0].completed}</div>;
//   },
// });

// const taskBase = _createView(
//   'projects',
//   {
//     displayField: { field: 'label' },
//   },
//   null
// );

// const x = _createView(
//   'projects',
//   { displayField: { field: 'label' } },
//   { Component: (props) => <div>{props.data.data?.[0].label}</div> }
// );

// const TasksView = () => {
//   const items = taskBase.useList();

//   const { data } = taskBase.useQuery({ query: 'tasks' });
//   const s = data?.[0].categoryId;
// };
