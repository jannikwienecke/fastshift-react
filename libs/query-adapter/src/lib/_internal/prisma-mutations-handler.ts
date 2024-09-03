import {
  FieldConfig,
  ID,
  ManyToManyMutationProps,
  MutationPropsServer,
} from '@apps-next/core';
import { PrismaClient } from '../prisma.types';
import { client } from './prisma-get-client';
import {
  createSuccessResponse,
  isCreateRecord,
  isDeleteRecord,
  isUpdateRecord,
  throwInvalidMutationTypeError,
} from './prisma-mutations-helper';

export const createMutation = async (
  prismaClient: Record<string, PrismaClient>,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (!isCreateRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { record } = mutation.payload;

  const dbMutation = client(prismaClient).tableClient(
    viewConfigManager.getTableName()
  );

  const result = await dbMutation.create({
    data: record,
  });

  return createSuccessResponse(
    `Record ${result?.id} created successfully`,
    'CREATED'
  );
};

export const deleteMutation = async (
  prismaClient: Record<string, PrismaClient>,
  { mutation, viewConfigManager }: MutationPropsServer
) => {
  if (!isDeleteRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { id } = mutation.payload;

  const tableClient = client(prismaClient).tableClient(
    viewConfigManager.getTableName()
  );

  await tableClient.delete({
    where: {
      id,
    },
  });

  return createSuccessResponse(`Record ${id} deleted successfully`, 'DELETED');
};

export const updateMutation = async (
  prismaClient: Record<string, PrismaClient>,
  props: MutationPropsServer
) => {
  const { mutation, viewConfigManager } = props;

  if (!isUpdateRecord(mutation)) throwInvalidMutationTypeError(mutation);

  const { id } = mutation.payload;
  const { id: _, ...data } = mutation.payload.record;

  const manyToManyRelations = Object.keys(data)
    .map((key) => {
      const field = viewConfigManager.getFieldBy(key);

      if (
        field.relation?.manyToManyRelation &&
        field.relation.manyToManyTable &&
        field.relation.manyToManyModelFields
      ) {
        const value = data[key];
        delete data[key];

        return {
          fieldName: key,
          table:
            field.relation.type === 'manyToMany'
              ? field.relation.manyToManyRelation
              : field.relation.tableName,
          manyToManyTable: field.relation.manyToManyTable,
          values: typeof value === 'string' ? [value] : value,
          manyToManyModelFields: field.relation.manyToManyModelFields,
        } satisfies ManyToManyMutationProps;
      }

      return null;
    })
    .filter(Boolean) as ManyToManyMutationProps[];

  if (manyToManyRelations.length > 0) {
    await updateManyToManyMutation(prismaClient, props, manyToManyRelations);
  } else {
    const tableClient = client(prismaClient).tableClient(
      viewConfigManager.getTableName()
    );

    await tableClient.update({
      where: {
        id,
      },
      data: data,
    });
  }

  return createSuccessResponse(`Record ${id} updated successfully`, 'UPDATED');
};

// TODO refactor this whole function -> split into oneToMany and manyToMany
export const updateManyToManyMutation = async (
  prismaClient: Record<string, PrismaClient>,
  { viewConfigManager, mutation }: MutationPropsServer,
  manyToManyRelations: {
    fieldName: string;
    table: string;
    values: ID[];
    manyToManyTable: string;
    manyToManyModelFields: FieldConfig[];
  }[]
) => {
  const { id } = mutation.payload;

  // // Handle many-to-many relations
  for (const relation of manyToManyRelations) {
    const relationTableClient = client(prismaClient).tableClient(
      relation.manyToManyTable
    );

    const fieldNameTable = relation.manyToManyModelFields.find(
      (f) =>
        f.name.toLowerCase() === viewConfigManager.getTableName().toLowerCase()
    )?.relation?.fieldName;

    const fieldNameRelationTable = relation.manyToManyModelFields.find(
      (f) => f.name.toLowerCase() === relation.fieldName.toLowerCase()
    )?.relation?.fieldName;

    if (!fieldNameTable) return;

    const exisitingValues: string[] = [];
    if (fieldNameRelationTable) {
      const allExisting = await relationTableClient.findMany({
        where: {
          // the table where we are currently on. Tasks -> has tags (we update a tag) -> taskId
          [fieldNameTable]: id,
          // the relation table field -> tagId
        },
        select: {
          [fieldNameRelationTable]: true,
        },
      });

      const toDelete = allExisting
        .map((v) => v?.[fieldNameRelationTable])
        .filter((v) => !relation.values.includes(v));

      await relationTableClient.deleteMany({
        where: {
          [fieldNameRelationTable]: {
            in: toDelete,
          },
        },
      });
    } else {
      const relationTableClient = client(prismaClient).tableClient(
        viewConfigManager.getTableName()
      );

      const projectWithTasks = await relationTableClient.findUnique({
        where: {
          id,
        },
        select: {
          [relation.fieldName]: {
            select: {
              id: true,
            },
          },
        },
      });

      const allExistingIds: string[] = projectWithTasks?.[
        relation.fieldName
      ].map((v: { id: string }) => v.id);

      const toDelete = allExistingIds.filter(
        (v) => !relation.values.includes(v)
      );

      exisitingValues.push(...allExistingIds);

      for (const value of toDelete) {
        const relationTableClient = client(prismaClient).tableClient(
          relation.table
        );

        const fieldNameTable = relation.manyToManyModelFields.find(
          (f) => f.name === viewConfigManager.getTableName()
        )?.relation?.fieldName;

        await relationTableClient.update({
          where: {
            id: value,
          },
          data: {
            [fieldNameTable as string]: null,
          },
        });
      }
    }

    for (const value of relation.values) {
      if (exisitingValues.includes(value.toString())) {
        continue;
      }

      if (!fieldNameRelationTable) {
        const relationTableClient = client(prismaClient).tableClient(
          relation.table
        );

        const fieldNameTable = relation.manyToManyModelFields.find(
          (f) => f.name === viewConfigManager.getTableName()
        )?.relation?.fieldName;

        await relationTableClient.update({
          where: {
            id: value,
          },
          data: {
            [fieldNameTable as string]: id,
          },
        });
      } else {
        const hasRecord = await relationTableClient.findMany({
          where: {
            // the table where we are currently on. Tasks -> has tags (we update a tag) -> taskId
            [fieldNameTable]: id,
            // the relation table field -> tagId
            [fieldNameRelationTable]: value,
          },
        });

        if (!(hasRecord.length > 0)) {
          await relationTableClient.create({
            data: {
              [fieldNameTable]: id,
              [fieldNameRelationTable]: value,
            },
          });
        }
      }
    }
  }
};
