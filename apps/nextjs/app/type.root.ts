import { ConvexSchemaType } from '@apps-next/convex-adapter-app';
import { DataProvider } from '@apps-next/core';
import { ViewDataProvider } from 'libs/react/src/lib/view-provider';

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
