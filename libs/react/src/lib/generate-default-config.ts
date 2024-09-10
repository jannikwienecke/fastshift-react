import {
  ModelSchema,
  BaseConfigInterface,
  ModelField,
  schemaHelper,
  getPrefferedDisplayField,
  GetTableName,
  RegisteredViews,
} from '@apps-next/core';
import { createViewConfig } from './create-view-config';

export const generateDefaultViewConfigs = ({
  tableNames,
  dataModel,
  config,
  guessDisplayFieldIfNotProvided,
}: {
  tableNames: string[];
  dataModel: ModelSchema;
  config: BaseConfigInterface;
  guessDisplayFieldIfNotProvided?: boolean;
}) => {
  return tableNames.reduce((acc, tableName) => {
    const tableData = dataModel.models.find(
      (m) => m.name.toLowerCase() === tableName.toString().toLowerCase()
    );

    if (!tableData) return acc;

    const options = (tableData?.fields as ModelField[])
      .map((f) => {
        const { isOptionForDisplayField } = schemaHelper(
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
    const _config = createViewConfig(
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
