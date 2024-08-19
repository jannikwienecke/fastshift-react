import { ConvexSchemaType } from '@apps-next/convex-adapter-app';
import { DataProvider } from '@apps-next/core';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
