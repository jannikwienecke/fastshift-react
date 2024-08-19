// import { prisma } from '../../../db';

import { TasksClient } from './tasks-client';

// import {
//   dehydrate,
//   HydrationBoundary,
//   QueryClient,
// } from '@tanstack/react-query';

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

//   type PrismaFieldTypeMapping = {
//     [key in PrismaField['kind']]: FieldType;
//   };

//   const fieldTypeMapping: PrismaFieldTypeMapping = {
//     string: 'String',
//   };

//   const viewFields = models.reduce((acc, model) => {

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

// export default async function FastAppTasksPage() {
//   const queryClient = new QueryClient();

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

export default async function FastAppTasksPage() {
  return <TasksClient />;
}
