import { createServerViewConfig } from '@apps-next/core';
import {
  configurePrismaLoader,
  prismaViewLoader,
  QueryPrefetchProvider,
} from '@apps-next/query-adapter';
import { prisma, PrismaClientType } from '../../../db';
import { globalConfig } from '../../layout';
import { TasksClient } from './tasks-client';

export const dynamic = 'force-dynamic';

export const viewConfig = createServerViewConfig(
  'task',
  {
    displayField: { field: 'name' },
  },
  globalConfig.config
);

const configWithCustomLoader = configurePrismaLoader(
  viewConfig
)<PrismaClientType>({
  include: {
    tags: {
      include: { tag: true },
    },
  },
});

// type ReturnTypeOf = Awaited<
//   ReturnType<
//     typeof prisma.task.findFirstOrThrow<{
//       include: {
//         project: true;
//         tags: {
//           include: { tag: true };
//         };
//       };
//     }>
//   >
// >;

// const Tasks = Prisma.dmmf.datamodel.models.find((m) => m.name === 'Task');
export default function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider
      viewConfig={configWithCustomLoader}
      viewLoader={(props) => prismaViewLoader(prisma, props)}
    >
      <TasksClient viewConfig={configWithCustomLoader} />
    </QueryPrefetchProvider>
  );
}

// const getWhereType = <
//   PrismaClient extends Record<string, any>,
//   TableName extends GetPrismaTableName<PrismaClient>
// >(
//   prisma: PrismaClient,
//   tableName: TableName,
//   where: GetFindManyWhere<PrismaClient, TableName>
// ): GetFindManyWhere<PrismaClient, TableName> => {
//   return prisma[tableName].findMany;
// };

// type x = GetFindManyWhere<PrismaClient, T>;
// const X: x = {'dsa': 1}

const test = async () => {
  const include = {
    project: true,
  };

  const x = await prisma.task.findMany<{
    include: { project: boolean };
    take: number;
  }>({
    take: 10,
    include,
  });

  type ReturnTypeOf = Awaited<
    ReturnType<
      typeof prisma.task.findFirstOrThrow<{
        include: typeof include;
      }>
    >
  >;
};
