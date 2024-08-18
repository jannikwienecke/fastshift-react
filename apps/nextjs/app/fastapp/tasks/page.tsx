// import { prisma } from '../../../db';

import { Prisma } from '@prisma/client';
import { TasksClient } from './tasks-client';

// import { clientConfig } from './global';

// import {
//   dehydrate,
//   HydrationBoundary,
//   QueryClient,
// } from '@tanstack/react-query';

// import { TasksClient } from './tasks-client';
// import { getTasks } from './actions';
// import { Prisma } from '@prisma/client';
// import { generateConfigFrom, PrismaField } from '@apps-next/react';
// import {
//   FieldType,
//   ViewConfigTypePrisma,
//   ViewFieldConfig,
// } from '@apps-next/core';
// import { ViewDataProvider } from 'libs/react/src/lib/view-provider';

// export type Prisma = {
//   dmmf: {
//     datamodel: {
//       // PrismaField
//       models: Array<{
//         fields: Array<PrismaField>;
//       }>;
//     };
//   };
// };

// export const generateFromPrismaSchema = <
//   TDataModel extends Prisma,
//   PrismaClient extends Record<string, any>
// >(
//   schema: TDataModel
// ) => {
//   const models = schema.dmmf.datamodel.models;

//   type PrismaFieldTypeMapping = {
//     [key in PrismaField['kind']]: FieldType;
//   };

//   const fieldTypeMapping: PrismaFieldTypeMapping = {
//     string: 'String',
//   };

//   console.log('HJIER', ViewDataProvider);
//   const viewFields = models.reduce((acc, model) => {
//     console.log(model);

//     return model.fields.reduce((acc, field) => {
//       console.log(field);
//       return {
//         ...acc,
//         [field.name]: {
//           type: fieldTypeMapping[field.kind] ?? 'String',
//           name: field.name,
//         },
//       };
//     }, acc);
//   }, {} as ViewFieldConfig);

//   console.log('VIEWFIELDS', viewFields);

//   const createView = <TableName extends keyof PrismaClient>(
//     tableName: TableName,
//     config: Partial<
//       Omit<
//         ViewConfigTypePrisma<PrismaClient, TableName>,
//         'viewFields' | 'tableName'
//       >
//     > & {
//       displayField: ViewConfigTypePrisma<
//         PrismaClient,
//         TableName
//       >['displayField'];
//     }
//   ) => {
//     // const viewFields = schema.dmmf.datamodel.models.find(
//     //   (model) => model.name === tableName
//     // )?.fields;
//     return {};
//   };

//   return {
//     createView,
//   };
// };

// export default async function FastAppTasksPage() {
//   const queryClient = new QueryClient();

//   console.log('PRISMA');
//   generateFromPrismaSchema<typeof Prisma, typeof prisma>(Prisma);

//   await queryClient.prefetchQuery({
//     queryKey: ['posts', ''],
//     queryFn: (context) => getTasks(),
//   });

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <TasksClient />
//     </HydrationBoundary>
//   );
// }

// // const DataModel = {
// //   name: 'Post',
// //   dbName: null,
// //   fields: [
// //     {
// //       name: 'id',
// //       kind: 'scalar',
// //       isList: false,
// //       isRequired: true,
// //       isUnique: false,
// //       isId: true,
// //       isReadOnly: false,
// //       hasDefaultValue: true,
// //       type: 'Int',
// //       default: [Object],
// //       isGenerated: false,
// //       isUpdatedAt: false,
// //     } as const,
// //   ],
// // } as const;

// // const DataModelTask = {
// //   name: 'Task',
// //   dbName: null,
// //   fields: [
// //     {
// //       name: 'id',
// //       kind: 'scalar',
// //       isList: false,
// //       isRequired: true,
// //       isUnique: false,
// //       isId: true,
// //       isReadOnly: false,
// //       hasDefaultValue: true,
// //       type: 'Int',
// //       default: [Object],
// //       isGenerated: false,
// //       isUpdatedAt: false,
// //     } as const,
// //   ],
// // } as const;

// // const dataModels = [DataModel, DataModelTask];

// // // Post | Task
// // type DataModelName = (typeof dataModels)[number]['name'];

// // type DataModelNamePrisma =
// //   (typeof Prisma.dmmf.datamodel.models)[number]['name'];

// // export type Prisma = {
// //   dmmf: {
// //     datamodel: {
// //       models: Array<unknown>;
// //     };
// //   };
// // };

// // // const PrismaSchema = {
// // //   ...Prisma,
// // // } as const;

// // // const generateConfigFromPrismaSchema = <
// // //   TableNames,
// // //   TDataModel extends Prisma.dmmf.datamodel.models
// // // >(
// // //   datModel: TDataModel extends Prisma.dmmf.datamodel.models ? TDataModel : never
// // // ) => {
// // //   return {
// // //     select: <TableName extends TableNames>(tableName: TableName) => {
// // //       //
// // //     },
// // //   };
// // // };

// // // type XXX = keyof typeof prisma;
// // // // const test : XXX =''
// // // type test = Awaited<ReturnType<(typeof prisma.post)['findFirst']>>;

// // // const config = generateConfigFromPrismaSchema<
// // //   keyof typeof prisma,
// // //   typeof Prisma
// // // >(Prisma);
// // // config.select('post');

// // // schema.tables['tasks'].validator.fields.

// // // generateConfigFrom('prisma', Prisma.dmmf.datamodel);

type PrismaModelType = Prisma.ModelName;

export default async function FastAppTasksPage() {
  const model = 'post';

  return <TasksClient datamodel={Prisma.dmmf.datamodel} />;
}
