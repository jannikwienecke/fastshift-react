import {
  BaseConfigInterface,
  createServerViewConfig,
  GetTableName,
} from '@apps-next/core';
import { Prisma, PrismaField } from '../prisma.types';
import {
  getPrefferedDisplayField,
  prismaViewFieldsHelper,
} from './prisma-view-fields-helper';

export const generateDefaultViewConfigs = ({
  tableNames,
  dataModel,
  config,
  guessDisplayFieldIfNotProvided,
}: {
  tableNames: string[];
  dataModel: Prisma['dmmf']['datamodel'];
  config: BaseConfigInterface;
  guessDisplayFieldIfNotProvided?: boolean;
}) => {
  tableNames.forEach((tableName) => {
    const tableData = dataModel.models.find(
      (m) => m.name.toLowerCase() === tableName.toString().toLowerCase()
    );

    if (!tableData) return;

    const options = (tableData?.fields as PrismaField[])
      .map((f) => {
        const { isOptionForDisplayField } = prismaViewFieldsHelper(
          f,
          tableData,
          dataModel
        );

        if (isOptionForDisplayField) {
          return f;
        }

        return null;
      })
      .filter((f) => f !== null);

    const displayField = getPrefferedDisplayField(options.map((f) => f.name));

    createServerViewConfig(
      tableName as GetTableName,
      {
        query: {},
        viewName: tableName as string,
        displayField: {
          field: guessDisplayFieldIfNotProvided ? displayField ?? 'id' : 'id',
        },
      },
      config
    );
  });
};
