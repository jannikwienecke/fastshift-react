import {
  BaseConfigInterface,
  createServerViewConfig,
  GetTableName,
  RegisteredViews,
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
  return tableNames.reduce((acc, tableName) => {
    const tableData = dataModel.models.find(
      (m) => m.name.toLowerCase() === tableName.toString().toLowerCase()
    );

    if (!tableData) return acc;

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

    console.log('GENERATE DEFAULT VIEW CONFIGS', tableName, displayField);
    const _config = createServerViewConfig(
      tableName as GetTableName,
      {
        query: {},
        _generated: true,
        relativePath: tableName,
        viewName: tableName as string,
        displayField: {
          field: guessDisplayFieldIfNotProvided ? displayField ?? 'id' : 'id',
        },
        icon: 'FaDotCircle',
      },
      config
    );

    return {
      ...acc,
      [tableName]: _config,
    };
  }, {} as RegisteredViews);
};
