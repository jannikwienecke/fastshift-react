import { ConvexSchemaType } from '@apps-next/convex-adapter-app';
import { DataProvider } from '@apps-next/core';

interface Register {
  //
}

export interface BaseConfigInterface<
  TDataModel extends Record<string, any>,
  TableName
> {
  dataModel: TDataModel;
  tableNames: TableName[];
}
