import {
  ModelSchema,
  BaseConfigInterface,
  ModelField,
  schemaHelper,
  getPrefferedDisplayField,
  GetTableName,
  RegisteredViews,
  ViewConfigType,
  _log,
} from '@apps-next/core';
import { createViewConfig } from './create-view-config';
import { CubeIcon } from '@radix-ui/react-icons';

export const generateDefaultViewConfigs = ({
  tableNames,
  dataModel,
  config,
  guessDisplayFieldIfNotProvided,
  userDefinedViews,
}: {
  tableNames: string[];
  dataModel: ModelSchema;
  config: BaseConfigInterface;
  guessDisplayFieldIfNotProvided?: boolean;
  userDefinedViews: ViewConfigType[];
}) => {
  const tablesWithView = userDefinedViews.map((v) => v.tableName);

  return tableNames
    .filter((table) => !tablesWithView.includes(table))
    .reduce((acc, tableName) => {
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

      if (!displayField) {
        // _log.debug(`No display field found for view with table '${tableName}'`);
      }

      const _config = createViewConfig(
        tableName as GetTableName,
        {
          query: {},
          _generated: true,
          relativePath: tableName,
          viewName: tableName as string,
          displayField: {
            field: (guessDisplayFieldIfNotProvided
              ? displayField ?? 'id'
              : 'id') as never,
          },
          icon: CubeIcon,
        },
        config
      );

      return {
        ...acc,
        [tableName]: _config,
      };
    }, {} as RegisteredViews);
};
