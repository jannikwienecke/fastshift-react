/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DataModel,
  FieldType,
  GetTableName,
  QueryProps,
  ViewConfig,
  ViewFieldConfig,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';
import { z, ZodFirstPartyTypeKind } from 'zod';
import { ViewProvider } from './page-provider';
import { debouncedQueryAtom } from './query-input';
import { useQuery } from './use-query';

const ZodTypeMapping: Partial<Record<ZodFirstPartyTypeKind, FieldType>> = {
  ZodString: 'String',
  ZodNumber: 'Number',
  ZodBoolean: 'Boolean',
  ZodDate: 'Date',
};

export class Config<TDataModel extends DataModel> {
  dataModel: TDataModel;
  tableNames: (keyof TDataModel)[];
  viewFields: Record<keyof TDataModel, ViewFieldConfig>;

  viewConfig = new Map<keyof TDataModel, ViewConfig<TDataModel, any>>();

  constructor(dataModel: TDataModel) {
    this.tableNames = Object.keys(dataModel) as (keyof TDataModel)[];
    this.dataModel = dataModel;
    this.viewFields = {} as any;

    Object.entries(dataModel).forEach(([tableName, table]) => {
      const shape = table.schema.shape;

      this.viewFields[tableName] = Object.keys(shape).reduce((acc, key) => {
        const type =
          ZodTypeMapping[shape[key]._def.typeName as ZodFirstPartyTypeKind] ??
          'String';

        acc[key] = { type };

        return acc;
      }, {} as Record<string, { type: FieldType }>);
    });
  }

  createBaseView<TableName extends GetTableName<TDataModel>>(
    tableName: TableName,
    config: Partial<
      Omit<ViewConfig<TDataModel, TableName>, 'viewFields' | 'tableName'>
    >
  ) {
    const viewFields = this.viewFields;

    type DataType = z.infer<TDataModel[TableName]['schema']>;

    const _useQuery = (props: QueryProps) => {
      return useQuery<DataType[]>(props);
    };

    function createScreen(
      Component: (props: ReturnType<typeof _useQuery>) => React.ReactNode
    ) {
      const viewConfig = {
        ...config,
        labelKey: config.labelKey as string,
        viewFields: viewFields[tableName as string],
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
      createScreen,
      useQuery: _useQuery,
    };
  }
}
