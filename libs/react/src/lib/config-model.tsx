import {
  FieldType,
  QueryProps,
  ViewConfig,
  ViewFieldConfig,
} from '@apps-next/core';
import { Infer } from 'convex/values';
import { useAtomValue } from 'jotai';
import { ViewProvider } from './page-provider';
import { debouncedQueryAtom } from './query-input';
import { useQuery } from './use-query';

const MappingConvexToFieldType: Record<string, FieldType> = {
  string: 'String',
  number: 'Number',
  boolean: 'Boolean',
  date: 'Date',
};

type ConvexSchemaType = {
  tables: Record<string, any>;
};

export class Config<TDataModel extends ConvexSchemaType> {
  dataModel: Record<string, any>;
  tableNames: (keyof TDataModel)[];
  viewFields: Record<string, ViewFieldConfig>;

  constructor(dataModel: TDataModel) {
    this.tableNames = Object.keys(dataModel) as (keyof TDataModel)[];
    this.dataModel = dataModel;

    this.viewFields = {} as any;

    this.viewFields = Object.fromEntries(
      Object.entries(dataModel.tables).map(([tableName, tableData]) => [
        tableName,
        Object.fromEntries(
          Object.entries(tableData.validator.fields).map(
            ([fieldName, fieldData]) => [
              fieldName,
              {
                type: MappingConvexToFieldType[(fieldData as any).kind],
              },
            ]
          )
        ),
      ])
    );
  }

  createBaseView<TableName extends keyof TDataModel['tables']>(
    tableName: TableName,
    config: Partial<
      Omit<ViewConfig<TDataModel, TableName>, 'viewFields' | 'tableName'>
    >
  ) {
    const viewFields = this.viewFields[tableName as string];

    type DataType = Infer<TDataModel['tables'][TableName]['validator']>;

    type DataTypeWithId = DataType & { id: string };
    const _useQuery = (props: QueryProps) => {
      return useQuery<DataTypeWithId[]>(props);
    };

    function createScreen(
      Component: (props: ReturnType<typeof _useQuery>) => React.ReactNode
    ) {
      const viewConfig = {
        ...config,
        labelKey: config.labelKey as string,
        viewFields: viewFields,
        tableName,
        viewName: config.viewName ?? (tableName as string),
      };

      const Content = (props: {
        Component: (props: ReturnType<typeof _useQuery>) => React.ReactNode;
      }) => {
        const query = useAtomValue(debouncedQueryAtom);
        const data = _useQuery({ query, viewConfig });
        return <props.Component {...data} />;
      };

      const Provider = (
        <ViewProvider viewConfig={viewConfig}>
          <Content Component={Component} />
        </ViewProvider>
      );

      return Provider;
    }

    return {
      useQuery: _useQuery,
      createScreen,
    };
  }
}

export const createConfigFromConvexSchema = <
  TDataModel extends ConvexSchemaType
>(
  schema: TDataModel
) => {
  const config = new Config(schema);

  return config;
};
