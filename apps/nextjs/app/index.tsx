// import { createView, ConfigWithouUi, _createView } from './config-model';
import { createConfigFromPrismaSchema, PrismaConfig } from '@apps-next/core';
import { Prisma } from '@prisma/client';
import { prisma, PrismaClientType } from '../db';

const config = createConfigFromPrismaSchema<
  Prisma.DMMF.Datamodel,
  PrismaClientType
>(Prisma.dmmf.datamodel);

const x = config.getAllTables()[0] === 'user';

const prismaConfig = new PrismaConfig(prisma);

declare module '@apps-next/core' {
  interface Register {
    config: typeof config;
    prisma: typeof prismaConfig;
  }
}

// declare global {
//   interface Register {
//     config: typeof config;
//     prisma: typeof prismaConfig;
//   }
// }

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
//   { Component: () => <div>Hello</div> }
// );

// const TasksView = () => {
//   const {} = taskBase?.useList();
//   const {} = taskBase.useQuery({ query: 'tasks' });
// };
